"use client";

import { useQuery } from "convex/react";

import { api } from "../../../lib/api";
import { GameBoard, type BoardCell } from "../../components/GameBoard";

export function BoardDisplay({ displayCode }: { displayCode: string }) {
  const gameState = useQuery(api.games.getPublicByDisplayCode, { displayCode });

  if (gameState === undefined) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#0b0919] text-white">
        <div className="space-y-3 text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-cyan-500/30 border-t-cyan-400" />
          <p className="text-sm font-black uppercase tracking-[0.4em] text-white/40">
            Linking board
          </p>
        </div>
      </main>
    );
  }

  if (gameState === null) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#0b0919] p-6 text-white">
        <div className="max-w-lg rounded-2xl border border-white/10 bg-white/5 p-10 text-center">
          <p className="text-xs font-black uppercase tracking-[0.5em] text-red-400">
            No mission found
          </p>
          <h1 className="mt-4 font-mono text-5xl font-black tracking-[0.2em] text-white/50">
            {displayCode}
          </h1>
          <p className="mt-4 text-white/40">
            Start a game from the controller, then open this link again.
          </p>
        </div>
      </main>
    );
  }

  const game = gameState.game;
  const isRed = game.currentTurn === "red";
  const isBlue = game.currentTurn === "blue";

  return (
    <main className="h-screen overflow-hidden bg-[#0b0919] text-white">
      {/* Ambient glow */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-indigo-900/20 blur-[100px]" />
        <div className="absolute -right-32 top-0 h-80 w-80 rounded-full bg-rose-900/15 blur-[100px]" />
      </div>

      <div className="relative flex h-full flex-col gap-[min(1.2vw,1.2vh)] p-[min(2vw,2vh)]">
        {/* Header bar */}
        <header className="flex shrink-0 items-center gap-[min(2vw,2vh)] rounded-2xl border border-white/8 bg-white/5 px-[min(2vw,2vh)] py-[min(1.2vw,1.2vh)] backdrop-blur-sm">
          {/* Brand */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-400 to-indigo-600">
              <span className="text-xs font-black">CW</span>
            </div>
            <p className="font-mono text-[clamp(0.8rem,1.6vw,1.2rem)] font-black tracking-[0.2em] text-amber-200/70">
              {game.displayCode}
            </p>
          </div>

          {/* Whose turn it is — big, centred */}
          {!game.winner && (
            <div
              className={[
                "flex flex-1 items-center justify-center gap-[min(1vw,1vh)] rounded-xl border py-[min(0.8vw,0.8vh)] transition-all duration-500",
                isRed
                  ? "border-red-400/50 bg-red-500/15 shadow-lg shadow-red-500/20"
                  : "border-sky-400/50 bg-sky-500/15 shadow-lg shadow-sky-500/20",
              ].join(" ")}
            >
              <div className={["h-3 w-3 rounded-full", isRed ? "bg-red-400" : "bg-sky-400"].join(" ")} />
              <span
                className={[
                  "text-[clamp(1rem,2.2vw,1.8rem)] font-black uppercase tracking-widest",
                  isRed ? "text-red-200" : "text-sky-200",
                ].join(" ")}
              >
                {game.currentTurn} team's turn
              </span>
            </div>
          )}

          {/* Scores */}
          <div className="flex shrink-0 items-center gap-[min(1vw,1vh)]">
            <div
              className={[
                "flex items-center gap-2 rounded-xl border px-[min(1.2vw,1.2vh)] py-[min(0.6vw,0.6vh)] transition-all duration-500",
                isRed && !game.winner ? "border-red-400/40 bg-red-500/15" : "border-white/5 bg-white/5",
              ].join(" ")}
            >
              <div className="h-2 w-2 rounded-full bg-red-400" />
              <span className="text-[clamp(1.1rem,2.2vw,2rem)] font-black leading-none text-red-200">
                {game.redRemaining}
              </span>
            </div>

            <span className="text-[0.6rem] font-black text-white/15">vs</span>

            <div
              className={[
                "flex items-center gap-2 rounded-xl border px-[min(1.2vw,1.2vh)] py-[min(0.6vw,0.6vh)] transition-all duration-500",
                isBlue && !game.winner ? "border-sky-400/40 bg-sky-500/15" : "border-white/5 bg-white/5",
              ].join(" ")}
            >
              <div className="h-2 w-2 rounded-full bg-sky-400" />
              <span className="text-[clamp(1.1rem,2.2vw,2rem)] font-black leading-none text-sky-200">
                {game.blueRemaining}
              </span>
            </div>
          </div>
        </header>

        {/* Players */}
        {gameState.players.length > 0 && (
          <div className="flex shrink-0 flex-wrap items-center gap-[min(0.8vw,0.8vh)]">
            {gameState.players.map((p: { _id: string; name: string; joinedAt: number }) => (
              <span
                key={p._id}
                className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-[clamp(0.6rem,1.2vw,0.85rem)] font-black text-white/60"
              >
                🕵️ {p.name}
              </span>
            ))}
          </div>
        )}

        {/* Winner banner */}
        {game.winner && (
          <div
            className={[
              "shrink-0 rounded-2xl py-4 text-center text-[clamp(1.5rem,3vw,3rem)] font-black uppercase tracking-widest shadow-2xl",
              game.winner === "red"
                ? "bg-gradient-to-r from-red-600 to-red-900 text-white shadow-red-500/30"
                : "bg-gradient-to-r from-sky-500 to-indigo-800 text-white shadow-sky-500/30",
            ].join(" ")}
          >
            {game.winner} team wins!
          </div>
        )}

        {/* Board */}
        <div className="min-h-0 flex-1 flex items-center">
          <GameBoard cells={gameState.cells as BoardCell[]} mode="display" />
        </div>
      </div>
    </main>
  );
}
