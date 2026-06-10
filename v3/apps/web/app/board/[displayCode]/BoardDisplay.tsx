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
        <header className="flex shrink-0 items-center justify-between gap-4 rounded-2xl border border-white/8 bg-white/5 px-[min(2vw,2vh)] py-[min(1.2vw,1.2vh)] backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-400 to-indigo-600">
              <span className="text-xs font-black">CW</span>
            </div>
            <div>
              <p className="text-[0.6rem] font-black uppercase tracking-[0.5em] text-white/35">
                CodeWords
              </p>
              <p className="font-mono text-[clamp(0.9rem,2vw,1.4rem)] font-black tracking-[0.2em] text-amber-200/80">
                {game.displayCode}
              </p>
            </div>
          </div>

          {/* Scores */}
          <div className="flex items-center gap-3">
            <div
              className={[
                "flex items-center gap-2 rounded-xl border px-[min(1.5vw,1.5vh)] py-[min(0.8vw,0.8vh)] transition-all duration-500",
                isRed && !game.winner
                  ? "border-red-400/50 bg-red-500/20 shadow-lg shadow-red-500/20"
                  : "border-white/5 bg-white/5",
              ].join(" ")}
            >
              <div className="h-2.5 w-2.5 rounded-full bg-red-400" />
              <span className="text-[clamp(1.2rem,2.5vw,2.5rem)] font-black leading-none text-red-200">
                {game.redRemaining}
              </span>
              <span className="text-[0.65rem] font-black uppercase tracking-widest text-red-300/50">
                Red
              </span>
              {isRed && !game.winner && (
                <span className="rounded-md bg-red-500/30 px-1.5 py-0.5 text-[0.6rem] font-black uppercase tracking-wider text-red-200">
                  Turn
                </span>
              )}
            </div>

            <span className="text-xs font-black text-white/15">vs</span>

            <div
              className={[
                "flex items-center gap-2 rounded-xl border px-[min(1.5vw,1.5vh)] py-[min(0.8vw,0.8vh)] transition-all duration-500",
                isBlue && !game.winner
                  ? "border-sky-400/50 bg-sky-500/20 shadow-lg shadow-sky-500/20"
                  : "border-white/5 bg-white/5",
              ].join(" ")}
            >
              <div className="h-2.5 w-2.5 rounded-full bg-sky-400" />
              <span className="text-[clamp(1.2rem,2.5vw,2.5rem)] font-black leading-none text-sky-200">
                {game.blueRemaining}
              </span>
              <span className="text-[0.65rem] font-black uppercase tracking-widest text-sky-300/50">
                Blue
              </span>
              {isBlue && !game.winner && (
                <span className="rounded-md bg-sky-500/30 px-1.5 py-0.5 text-[0.6rem] font-black uppercase tracking-wider text-sky-200">
                  Turn
                </span>
              )}
            </div>
          </div>
        </header>

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
