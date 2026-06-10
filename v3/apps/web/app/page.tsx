"use client";

import { useMutation, useQuery } from "convex/react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { CastSender } from "./components/CastSender";
import { GameBoard, type BoardCell } from "./components/GameBoard";
import { api } from "../lib/api";

const controllerStorageKey = "codewords.controller";
const codeAlphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function createDisplayCode() {
  const bytes = new Uint8Array(6);
  globalThis.crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((byte) => codeAlphabet[byte % codeAlphabet.length] ?? "X")
    .join("");
}

function createControllerToken() {
  return globalThis.crypto.randomUUID();
}

export default function Home() {
  const createGame = useMutation(api.games.create);
  const revealCell = useMutation(api.games.revealCell);
  const [displayCode, setDisplayCode] = useState<string | null>(null);
  const [controllerToken, setControllerToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const saved = window.localStorage.getItem(controllerStorageKey);
    if (!saved) return;
    const [savedDisplayCode, savedControllerToken] = saved.split(":");
    if (savedDisplayCode && savedControllerToken) {
      setDisplayCode(savedDisplayCode);
      setControllerToken(savedControllerToken);
    }
  }, []);

  const controllerArgs = useMemo(() => {
    if (!displayCode || !controllerToken) return "skip";
    return { displayCode, controllerToken };
  }, [controllerToken, displayCode]);

  const gameState = useQuery(api.games.getControllerByDisplayCode, controllerArgs);
  const boardUrl = displayCode ? `/board/${displayCode}` : null;

  async function startMission() {
    setError(null);
    try {
      const nextDisplayCode = createDisplayCode();
      const nextControllerToken = createControllerToken();
      const result = await createGame({
        displayCode: nextDisplayCode,
        controllerToken: nextControllerToken,
        languageCode: "en",
        seed: `${nextDisplayCode}:${nextControllerToken}`,
      });
      setDisplayCode(result.displayCode);
      setControllerToken(nextControllerToken);
      window.localStorage.setItem(
        controllerStorageKey,
        `${result.displayCode}:${nextControllerToken}`,
      );
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not create game.");
    }
  }

  async function reveal(index: number) {
    if (!gameState || !controllerToken) return;
    setError(null);
    try {
      await revealCell({ gameId: gameState.game._id, cellIndex: index, controllerToken });
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not reveal card.");
    }
  }

  function copyBoardUrl() {
    if (!boardUrl) return;
    const full = `${window.location.origin}${boardUrl}`;
    navigator.clipboard.writeText(full).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  const game = gameState?.game;
  const isRed = game?.currentTurn === "red";
  const isBlue = game?.currentTurn === "blue";
  const hasWinner = !!game?.winner;

  // When a game is active the whole page becomes a fixed-height mission control panel
  const isGameActive = !!(displayCode || gameState);

  return (
    <main
      className={[
        "bg-[#0b0919] text-white",
        isGameActive ? "h-screen overflow-hidden" : "min-h-screen",
      ].join(" ")}
    >
      {/* Ambient gradient blobs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-64 -top-64 h-[600px] w-[600px] rounded-full bg-indigo-900/30 blur-[120px]" />
        <div className="absolute -right-64 top-0 h-[500px] w-[500px] rounded-full bg-rose-900/25 blur-[120px]" />
        <div className="absolute bottom-0 left-1/2 h-[400px] w-[400px] -translate-x-1/2 rounded-full bg-cyan-900/20 blur-[120px]" />
      </div>

      {/* No game yet — welcome screen */}
      {!isGameActive && (
        <div className="relative flex min-h-screen flex-col">
          <header className="flex items-center justify-between px-6 py-5">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-indigo-600 shadow-lg shadow-cyan-500/30">
                <span className="text-sm font-black">CW</span>
              </div>
              <span className="text-sm font-black uppercase tracking-[0.3em] text-white/60">
                CodeWords
              </span>
            </div>
          </header>
          <div className="flex flex-1 flex-col items-center justify-center gap-8 px-6 text-center">
            <div className="space-y-4">
              <p className="text-xs font-black uppercase tracking-[0.5em] text-cyan-400">
                Mission Control
              </p>
              <h1 className="text-5xl font-black leading-none sm:text-7xl">
                <span className="bg-gradient-to-r from-white via-cyan-100 to-indigo-300 bg-clip-text text-transparent">
                  Secret Word
                </span>
                <br />
                <span className="text-white/30">Operations</span>
              </h1>
              <p className="mx-auto max-w-md text-lg text-white/50">
                Start a mission, open the board on a TV or second screen, and reveal cards to lead
                your team to victory.
              </p>
            </div>
            <button
              className="rounded-2xl bg-gradient-to-r from-cyan-500 to-indigo-600 px-8 py-4 text-lg font-black uppercase tracking-wider shadow-2xl shadow-cyan-500/30 transition hover:brightness-110"
              type="button"
              onClick={startMission}
            >
              Begin Mission
            </button>
          </div>
        </div>
      )}

      {/* Game active — fixed full-screen mission control */}
      {isGameActive && (
        <div className="relative flex h-full gap-3 p-4">

          {/* ── Left sidebar ── */}
          <aside className="flex w-56 shrink-0 flex-col gap-3">

            {/* Brand + new mission */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-400 to-indigo-600">
                  <span className="text-xs font-black">CW</span>
                </div>
                <span className="text-xs font-black uppercase tracking-[0.25em] text-white/40">
                  CodeWords
                </span>
              </div>
              <button
                className="rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-[0.6rem] font-black uppercase tracking-wider text-white/50 transition hover:bg-white/10 hover:text-white"
                type="button"
                onClick={startMission}
              >
                New
              </button>
            </div>

            {/* Red score */}
            {game && (
              <div
                className={[
                  "flex flex-1 flex-col justify-center rounded-2xl border px-5 py-5 transition-all duration-500",
                  isRed && !hasWinner
                    ? "border-red-400/50 bg-red-500/15 shadow-lg shadow-red-500/20"
                    : "border-white/6 bg-white/4",
                ].join(" ")}
              >
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-red-400" />
                  <p className="text-xs font-black uppercase tracking-widest text-red-300/60">
                    Red team
                  </p>
                  {isRed && !hasWinner && (
                    <span className="ml-auto rounded-md bg-red-500/30 px-2 py-0.5 text-[0.6rem] font-black uppercase tracking-wider text-red-200">
                      Turn
                    </span>
                  )}
                </div>
                <p className="mt-2 text-6xl font-black leading-none text-red-200">
                  {game.redRemaining}
                </p>
                <p className="mt-1 text-xs text-red-300/40">words left</p>
              </div>
            )}

            {/* Blue score */}
            {game && (
              <div
                className={[
                  "flex flex-1 flex-col justify-center rounded-2xl border px-5 py-5 transition-all duration-500",
                  isBlue && !hasWinner
                    ? "border-sky-400/50 bg-sky-500/15 shadow-lg shadow-sky-500/20"
                    : "border-white/6 bg-white/4",
                ].join(" ")}
              >
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-sky-400" />
                  <p className="text-xs font-black uppercase tracking-widest text-sky-300/60">
                    Blue team
                  </p>
                  {isBlue && !hasWinner && (
                    <span className="ml-auto rounded-md bg-sky-500/30 px-2 py-0.5 text-[0.6rem] font-black uppercase tracking-wider text-sky-200">
                      Turn
                    </span>
                  )}
                </div>
                <p className="mt-2 text-6xl font-black leading-none text-sky-200">
                  {game?.blueRemaining}
                </p>
                <p className="mt-1 text-xs text-sky-300/40">words left</p>
              </div>
            )}

            {/* Winner banner */}
            {hasWinner && (
              <div
                className={[
                  "rounded-2xl px-5 py-4 text-center font-black uppercase tracking-widest",
                  game?.winner === "red"
                    ? "bg-red-500/20 text-red-200"
                    : "bg-sky-500/20 text-sky-200",
                ].join(" ")}
              >
                {game?.winner} wins!
              </div>
            )}

            {/* Board code + share */}
            {displayCode && boardUrl && (
              <div className="rounded-2xl border border-white/8 bg-white/4 px-4 py-4">
                <p className="text-[0.6rem] font-black uppercase tracking-[0.35em] text-white/30">
                  Board code
                </p>
                <p className="mt-1 font-mono text-2xl font-black tracking-[0.15em] text-amber-200">
                  {displayCode}
                </p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  <button
                    className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-[0.6rem] font-black uppercase tracking-wider text-white/50 transition hover:bg-white/10 hover:text-white"
                    type="button"
                    onClick={copyBoardUrl}
                  >
                    {copied ? "Copied!" : "Copy link"}
                  </button>
                  <Link
                    className="rounded-lg border border-amber-400/30 bg-amber-400/10 px-2.5 py-1.5 text-[0.6rem] font-black uppercase tracking-wider text-amber-200 transition hover:bg-amber-400/20"
                    href={boardUrl}
                    target="_blank"
                  >
                    Open board
                  </Link>
                </div>
                <div className="mt-2">
                  <CastSender displayCode={displayCode} />
                </div>
              </div>
            )}

            {error && (
              <div className="rounded-xl border border-red-400/30 bg-red-950/50 px-3 py-2 text-xs text-red-200">
                {error}
              </div>
            )}
          </aside>

          {/* ── Board area — centered with padding on both sides ── */}
          <div className="flex min-w-0 flex-1 items-center justify-center px-4">
            {gameState ? (
              <div className="h-full w-full max-w-3xl">
                <GameBoard
                  cells={gameState.cells as BoardCell[]}
                  mode="controller"
                  onReveal={reveal}
                />
              </div>
            ) : (
              <div className="flex h-full w-full items-center justify-center rounded-2xl border border-dashed border-white/10 bg-white/3 text-white/30">
                <p className="text-sm font-black uppercase tracking-widest">Loading board…</p>
              </div>
            )}
          </div>

        </div>
      )}
    </main>
  );
}
