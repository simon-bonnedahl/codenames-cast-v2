import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

const team = v.union(v.literal("red"), v.literal("blue"));
const gameStatus = v.union(
  v.literal("lobby"),
  v.literal("active"),
  v.literal("finished"),
);
const cellType = v.union(
  v.literal("red"),
  v.literal("blue"),
  v.literal("neutral"),
  v.literal("bomb"),
);

const schema = defineSchema({
  language: defineTable({
    code: v.string(),
    name: v.string(),
    emoji: v.string(),
  }).index("byCode", ["code"]),
  word: defineTable({
    languageId: v.id("language"),
    word: v.string(),
  }).index("byLanguageId", ["languageId"]),
  game: defineTable({
    displayCode: v.string(),
    controllerToken: v.string(),
    languageCode: v.string(),
    status: gameStatus,
    startingTeam: team,
    currentTurn: team,
    redRemaining: v.number(),
    blueRemaining: v.number(),
    winner: v.optional(team),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("byDisplayCode", ["displayCode"])
    .index("byStatus", ["status"]),
  gameCell: defineTable({
    gameId: v.id("game"),
    index: v.number(),
    word: v.string(),
    type: cellType,
    revealed: v.boolean(),
  })
    .index("byGameId", ["gameId"])
    .index("byGameAndIndex", ["gameId", "index"]),
  gamePlayer: defineTable({
    gameId: v.id("game"),
    name: v.string(),
    joinedAt: v.number(),
  }).index("byGameId", ["gameId"]),
});

export default schema;
