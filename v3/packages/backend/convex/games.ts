import { v } from "convex/values";

import { mutation, query } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import type { MutationCtx, QueryCtx } from "./_generated/server";

const teamValidator = v.union(v.literal("red"), v.literal("blue"));
const cellTypeValidator = v.union(
  v.literal("red"),
  v.literal("blue"),
  v.literal("neutral"),
  v.literal("bomb"),
);
const gameStatusValidator = v.union(
  v.literal("lobby"),
  v.literal("active"),
  v.literal("finished"),
);
const publicCellValidator = v.object({
  _id: v.id("gameCell"),
  index: v.number(),
  word: v.string(),
  type: v.union(cellTypeValidator, v.null()),
  revealed: v.boolean(),
});
const controllerCellValidator = v.object({
  _id: v.id("gameCell"),
  index: v.number(),
  word: v.string(),
  type: cellTypeValidator,
  revealed: v.boolean(),
});
const gameSummaryValidator = v.object({
  _id: v.id("game"),
  displayCode: v.string(),
  languageCode: v.string(),
  status: gameStatusValidator,
  startingTeam: teamValidator,
  currentTurn: teamValidator,
  redRemaining: v.number(),
  blueRemaining: v.number(),
  winner: v.union(teamValidator, v.null()),
});
const playerValidator = v.object({
  _id: v.id("gamePlayer"),
  name: v.string(),
  joinedAt: v.number(),
});
const publicGameStateValidator = v.union(
  v.object({
    game: gameSummaryValidator,
    cells: v.array(publicCellValidator),
    players: v.array(playerValidator),
  }),
  v.null(),
);
const controllerGameStateValidator = v.union(
  v.object({
    game: gameSummaryValidator,
    cells: v.array(controllerCellValidator),
    players: v.array(playerValidator),
  }),
  v.null(),
);

type Team = "red" | "blue";
type CellType = "red" | "blue" | "neutral" | "bomb";

const fallbackWords = [
  "Agent",
  "Anchor",
  "Apple",
  "Bridge",
  "Castle",
  "Cipher",
  "Cloud",
  "Comet",
  "Crown",
  "Dragon",
  "Eagle",
  "Forest",
  "Glass",
  "Harbor",
  "Island",
  "Jacket",
  "Knight",
  "Lantern",
  "Mirror",
  "Mountain",
  "Orbit",
  "Piano",
  "River",
  "Rocket",
  "Shadow",
  "Signal",
  "Silver",
  "Spider",
  "Storm",
  "Temple",
  "Tiger",
  "Tower",
  "Vault",
  "Whisper",
  "Window",
];

function normalizeDisplayCode(displayCode: string) {
  return displayCode.trim().toUpperCase();
}

function assertDisplayCode(displayCode: string) {
  if (!/^[A-Z0-9]{4,8}$/.test(displayCode)) {
    throw new Error("Display code must be 4-8 letters or numbers.");
  }
}

function assertControllerToken(controllerToken: string) {
  if (controllerToken.length < 16) {
    throw new Error("Controller token is too short.");
  }
}

function seededRandom(seed: string) {
  let state = 2166136261;
  for (let index = 0; index < seed.length; index += 1) {
    state ^= seed.charCodeAt(index);
    state = Math.imul(state, 16777619);
  }

  return () => {
    state = Math.imul(state, 1664525) + 1013904223;
    return (state >>> 0) / 4294967296;
  };
}

function shuffled<T>(items: T[], seed: string) {
  const random = seededRandom(seed);
  const result = [...items];

  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    const current = result[index];
    const swap = result[swapIndex];
    if (current === undefined || swap === undefined) {
      continue;
    }
    result[index] = swap;
    result[swapIndex] = current;
  }

  return result;
}

function buildBoard(seed: string) {
  const startingTeam: Team = seededRandom(`${seed}:team`)() > 0.5 ? "red" : "blue";
  const redCount = startingTeam === "red" ? 9 : 8;
  const blueCount = startingTeam === "blue" ? 9 : 8;
  const types: CellType[] = [
    ...Array<CellType>(redCount).fill("red"),
    ...Array<CellType>(blueCount).fill("blue"),
    ...Array<CellType>(7).fill("neutral"),
    "bomb",
  ];
  const words = shuffled(fallbackWords, `${seed}:words`).slice(0, 25);
  const shuffledTypes = shuffled(types, `${seed}:types`);

  return {
    startingTeam,
    redCount,
    blueCount,
    cells: words.map((word, index) => ({
      index,
      word,
      type: shuffledTypes[index] ?? "neutral",
      revealed: false,
    })),
  };
}

type DatabaseCtx = QueryCtx | MutationCtx;

async function getPlayers(ctx: DatabaseCtx, gameId: Id<"game">) {
  const players = await ctx.db
    .query("gamePlayer")
    .withIndex("byGameId", (q) => q.eq("gameId", gameId))
    .collect();
  return players.sort((a, b) => a.joinedAt - b.joinedAt);
}

async function getCells(ctx: DatabaseCtx, gameId: Id<"game">) {
  const cells = await ctx.db
    .query("gameCell")
    .withIndex("byGameId", (q) => q.eq("gameId", gameId))
    .collect();

  return cells.sort((left, right) => left.index - right.index);
}

async function getGameByDisplayCode(ctx: DatabaseCtx, displayCode: string) {
  return await ctx.db
    .query("game")
    .withIndex("byDisplayCode", (q) => q.eq("displayCode", displayCode))
    .unique();
}

function summarizeGame(game: NonNullable<Awaited<ReturnType<typeof getGameByDisplayCode>>>) {
  return {
    _id: game._id,
    displayCode: game.displayCode,
    languageCode: game.languageCode,
    status: game.status,
    startingTeam: game.startingTeam,
    currentTurn: game.currentTurn,
    redRemaining: game.redRemaining,
    blueRemaining: game.blueRemaining,
    winner: game.winner ?? null,
  };
}

export const create = mutation({
  args: {
    displayCode: v.string(),
    controllerToken: v.string(),
    languageCode: v.optional(v.string()),
    seed: v.string(),
  },
  returns: v.object({
    gameId: v.id("game"),
    displayCode: v.string(),
  }),
  handler: async (ctx, args) => {
    const displayCode = normalizeDisplayCode(args.displayCode);
    assertDisplayCode(displayCode);
    assertControllerToken(args.controllerToken);

    const existing = await getGameByDisplayCode(ctx, displayCode);
    if (existing) {
      throw new Error("That display code is already in use.");
    }

    const board = buildBoard(`${displayCode}:${args.seed}`);
    const now = Date.now();
    const gameId = await ctx.db.insert("game", {
      displayCode,
      controllerToken: args.controllerToken,
      languageCode: args.languageCode ?? "en",
      status: "active",
      startingTeam: board.startingTeam,
      currentTurn: board.startingTeam,
      redRemaining: board.redCount,
      blueRemaining: board.blueCount,
      createdAt: now,
      updatedAt: now,
    });

    for (const cell of board.cells) {
      await ctx.db.insert("gameCell", {
        gameId,
        ...cell,
      });
    }

    return { gameId, displayCode };
  },
});

export const getPublicByDisplayCode = query({
  args: {
    displayCode: v.string(),
  },
  returns: publicGameStateValidator,
  handler: async (ctx, args) => {
    const displayCode = normalizeDisplayCode(args.displayCode);
    assertDisplayCode(displayCode);

    const game = await getGameByDisplayCode(ctx, displayCode);
    if (!game) {
      return null;
    }

    const [cells, players] = await Promise.all([
      getCells(ctx, game._id),
      getPlayers(ctx, game._id),
    ]);
    return {
      game: summarizeGame(game),
      cells: cells.map((cell) => ({
        _id: cell._id,
        index: cell.index,
        word: cell.word,
        type: cell.revealed ? cell.type : null,
        revealed: cell.revealed,
      })),
      players: players.map((p) => ({ _id: p._id, name: p.name, joinedAt: p.joinedAt })),
    };
  },
});

export const getControllerByDisplayCode = query({
  args: {
    displayCode: v.string(),
    controllerToken: v.string(),
  },
  returns: controllerGameStateValidator,
  handler: async (ctx, args) => {
    const displayCode = normalizeDisplayCode(args.displayCode);
    assertDisplayCode(displayCode);
    assertControllerToken(args.controllerToken);

    const game = await getGameByDisplayCode(ctx, displayCode);
    if (!game) {
      return null;
    }
    if (game.controllerToken !== args.controllerToken) {
      throw new Error("Unauthorized controller.");
    }

    const [cells, players] = await Promise.all([
      getCells(ctx, game._id),
      getPlayers(ctx, game._id),
    ]);
    return {
      game: summarizeGame(game),
      cells: cells.map((cell) => ({
        _id: cell._id,
        index: cell.index,
        word: cell.word,
        type: cell.type,
        revealed: cell.revealed,
      })),
      players: players.map((p) => ({ _id: p._id, name: p.name, joinedAt: p.joinedAt })),
    };
  },
});

export const joinGame = mutation({
  args: {
    displayCode: v.string(),
    name: v.string(),
  },
  returns: v.object({ playerId: v.id("gamePlayer") }),
  handler: async (ctx, args) => {
    const displayCode = normalizeDisplayCode(args.displayCode);
    assertDisplayCode(displayCode);

    const name = args.name.trim().slice(0, 24);
    if (!name) throw new Error("Name cannot be empty.");

    const game = await getGameByDisplayCode(ctx, displayCode);
    if (!game) throw new Error("Game not found.");

    const playerId = await ctx.db.insert("gamePlayer", {
      gameId: game._id,
      name,
      joinedAt: Date.now(),
    });

    return { playerId };
  },
});

export const swapTurn = mutation({
  args: {
    gameId: v.id("game"),
    controllerToken: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    assertControllerToken(args.controllerToken);

    const game = await ctx.db.get(args.gameId);
    if (!game) throw new Error("Game not found.");
    if (game.controllerToken !== args.controllerToken) throw new Error("Unauthorized controller.");
    if (game.status === "finished") return null;

    await ctx.db.patch(game._id, {
      currentTurn: game.currentTurn === "red" ? "blue" : "red",
      updatedAt: Date.now(),
    });

    return null;
  },
});

export const revealCell = mutation({
  args: {
    gameId: v.id("game"),
    cellIndex: v.number(),
    controllerToken: v.string(),
  },
  returns: controllerGameStateValidator,
  handler: async (ctx, args) => {
    assertControllerToken(args.controllerToken);
    if (!Number.isInteger(args.cellIndex) || args.cellIndex < 0 || args.cellIndex > 24) {
      throw new Error("Cell index must be between 0 and 24.");
    }

    const game = await ctx.db.get(args.gameId);
    if (!game) {
      throw new Error("Game not found.");
    }
    if (game.controllerToken !== args.controllerToken) {
      throw new Error("Unauthorized controller.");
    }
    if (game.status === "finished") {
      return {
        game: summarizeGame(game),
        cells: (await getCells(ctx, game._id)).map((cell) => ({
          _id: cell._id,
          index: cell.index,
          word: cell.word,
          type: cell.type,
          revealed: cell.revealed,
        })),
      };
    }

    const cell = await ctx.db
      .query("gameCell")
      .withIndex("byGameAndIndex", (q) =>
        q.eq("gameId", args.gameId).eq("index", args.cellIndex),
      )
      .unique();

    if (!cell) {
      throw new Error("Cell not found.");
    }

    if (!cell.revealed) {
      const redRemaining =
        cell.type === "red" ? Math.max(0, game.redRemaining - 1) : game.redRemaining;
      const blueRemaining =
        cell.type === "blue" ? Math.max(0, game.blueRemaining - 1) : game.blueRemaining;
      const winner =
        cell.type === "bomb"
          ? game.currentTurn === "red"
            ? "blue"
            : "red"
          : redRemaining === 0
            ? "red"
            : blueRemaining === 0
              ? "blue"
              : undefined;

      await ctx.db.patch(cell._id, { revealed: true });
      await ctx.db.patch(game._id, {
        redRemaining,
        blueRemaining,
        ...(winner ? { status: "finished" as const, winner } : {}),
        updatedAt: Date.now(),
      });
    }

    const updatedGame = await ctx.db.get(args.gameId);
    if (!updatedGame) {
      throw new Error("Game not found after update.");
    }

    const cells = await getCells(ctx, updatedGame._id);
    return {
      game: summarizeGame(updatedGame),
      cells: cells.map((updatedCell) => ({
        _id: updatedCell._id,
        index: updatedCell.index,
        word: updatedCell.word,
        type: updatedCell.type,
        revealed: updatedCell.revealed,
      })),
    };
  },
});
