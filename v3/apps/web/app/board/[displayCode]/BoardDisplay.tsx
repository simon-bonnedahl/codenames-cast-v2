"use client";

import { useQuery } from "convex/react";
import Image from "next/image";

import { api } from "../../../lib/api";
import { GameBoard, type BoardCell } from "../../components/GameBoard";

type BoardDisplayProps = {
  displayCode: string;
  variant?: "browser" | "tv";
};

function Blobs() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden">
      <div className="absolute -left-64 -top-64 h-[600px] w-[600px] rounded-full bg-indigo-900/30 blur-[120px]" />
      <div className="absolute -right-64 top-0 h-[500px] w-[500px] rounded-full bg-rose-900/25 blur-[120px]" />
      <div className="absolute bottom-0 left-1/2 h-[400px] w-[400px] -translate-x-1/2 rounded-full bg-cyan-900/20 blur-[120px]" />
    </div>
  );
}

export function BoardDisplay({ displayCode, variant = "browser" }: BoardDisplayProps) {
  const gameState = useQuery(api.games.getPublicByDisplayCode, { displayCode });
  const isTv = variant === "tv";

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
  const hasWinner = !!game.winner;

  return (
    <main className="h-screen overflow-hidden bg-[#0b0919] text-white">
      <Blobs />

      <div
        className={[
          "relative flex h-full flex-col",
          isTv ? "gap-2 px-4 py-3" : "gap-[min(1.2vw,1.2vh)] p-[min(2vw,2vh)]",
        ].join(" ")}
      >
        {/* Top bar — matches controller web app */}
        <header className="flex shrink-0 items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Image
              src="/icon.png"
              alt="CodeWords"
              width={isTv ? 32 : 28}
              height={isTv ? 32 : 28}
              className="rounded-lg"
            />
            <span
              className={[
                "font-black uppercase tracking-[0.3em] text-white/50",
                isTv ? "text-sm" : "text-xs",
              ].join(" ")}
            >
              CodeWords
            </span>
          </div>
          <div className="rounded-2xl border border-white/6 bg-white/4 px-4 py-2 text-right">
            <p className="text-[0.6rem] font-black uppercase tracking-[0.3em] text-white/30">
              Board code
            </p>
            <p
              className={[
                "font-mono font-black tracking-[0.15em] text-amber-200",
                isTv ? "text-xl" : "text-lg",
              ].join(" ")}
            >
              {game.displayCode}
            </p>
          </div>
        </header>

        {/* Score row — matches controller web app */}
        <div
          className={[
            "grid shrink-0 gap-2",
            isTv ? "grid-cols-2" : "grid-cols-1 sm:grid-cols-2",
          ].join(" ")}
        >
          <div
            className={[
              "flex items-center gap-4 rounded-2xl border px-5 py-4 transition-all duration-500",
              isRed && !hasWinner
                ? "border-red-400/40 bg-red-500/12 shadow-lg shadow-red-500/15"
                : "border-white/6 bg-white/4",
            ].join(" ")}
          >
            <div
              className={[
                "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-2xl font-black transition-all duration-500",
                isRed && !hasWinner ? "bg-red-500/30 text-red-200" : "bg-red-500/10 text-red-300/50",
              ].join(" ")}
            >
              {game.redRemaining}
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-red-300/50">Red team</p>
              <p className="text-xs text-red-200/40">words remaining</p>
            </div>
            {isRed && !hasWinner && (
              <span className="ml-auto rounded-lg bg-red-500/25 px-2.5 py-1 text-[0.6rem] font-black uppercase tracking-wider text-red-200">
                Turn
              </span>
            )}
          </div>

          <div
            className={[
              "flex items-center gap-4 rounded-2xl border px-5 py-4 transition-all duration-500",
              isBlue && !hasWinner
                ? "border-sky-400/40 bg-sky-500/12 shadow-lg shadow-sky-500/15"
                : "border-white/6 bg-white/4",
            ].join(" ")}
          >
            <div
              className={[
                "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-2xl font-black transition-all duration-500",
                isBlue && !hasWinner ? "bg-sky-500/30 text-sky-200" : "bg-sky-500/10 text-sky-300/50",
              ].join(" ")}
            >
              {game.blueRemaining}
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-sky-300/50">Blue team</p>
              <p className="text-xs text-sky-200/40">words remaining</p>
            </div>
            {isBlue && !hasWinner && (
              <span className="ml-auto rounded-lg bg-sky-500/25 px-2.5 py-1 text-[0.6rem] font-black uppercase tracking-wider text-sky-200">
                Turn
              </span>
            )}
          </div>
        </div>

        {/* Players */}
        {gameState.players.length > 0 && (
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            <span className="text-[0.6rem] font-black uppercase tracking-widest text-white/25">
              Players
            </span>
            {gameState.players.map((p: { _id: string; name: string; joinedAt: number }) => (
              <span
                key={p._id}
                className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-black text-white/70"
              >
                🕵️ {p.name}
              </span>
            ))}
          </div>
        )}

        {/* Winner banner */}
        {hasWinner && (
          <div
            className={[
              "shrink-0 rounded-2xl py-3 text-center font-black uppercase tracking-widest",
              game.winner === "red" ? "bg-red-500/20 text-red-200" : "bg-sky-500/20 text-sky-200",
              isTv ? "py-4 text-2xl" : "",
            ].join(" ")}
          >
            {game.winner} wins!
          </div>
        )}

        {/* Board — wide landscape grid, fills remaining space */}
        <div className="min-h-0 w-full flex-1">
          <GameBoard
            cells={gameState.cells as BoardCell[]}
            mode="display"
            size={isTv ? "tv" : "default"}
          />
        </div>
      </div>
    </main>
  );
}
