"use client";

import { useMutation, useQuery } from "convex/react";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { CastSender } from "./components/CastSender";
import { GameBoard, type BoardCell } from "./components/GameBoard";
import { api } from "../lib/api";

const controllerStorageKey = "codewords.controller";
const codeAlphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

const LANGUAGES = [
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "sv", label: "Swedish", flag: "🇸🇪" },
  { code: "de", label: "German", flag: "🇩🇪" },
  { code: "fr", label: "French", flag: "🇫🇷" },
  { code: "es", label: "Spanish", flag: "🇪🇸" },
];

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

type View = "menu" | "controller" | "join" | "open-board";

// ─── Ambient blobs ───────────────────────────────────────────────────────────
function Blobs() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden">
      <div className="absolute -left-64 -top-64 h-[600px] w-[600px] rounded-full bg-indigo-900/30 blur-[120px]" />
      <div className="absolute -right-64 top-0 h-[500px] w-[500px] rounded-full bg-rose-900/25 blur-[120px]" />
      <div className="absolute bottom-0 left-1/2 h-[400px] w-[400px] -translate-x-1/2 rounded-full bg-cyan-900/20 blur-[120px]" />
    </div>
  );
}

// ─── Main export ─────────────────────────────────────────────────────────────
export default function Home() {
  const router = useRouter();
  const createGame = useMutation(api.games.create);
  const revealCell = useMutation(api.games.revealCell);
  const swapTurn = useMutation(api.games.swapTurn);

  const [view, setView] = useState<View>("menu");
  const [displayCode, setDisplayCode] = useState<string | null>(null);
  const [controllerToken, setControllerToken] = useState<string | null>(null);
  const [language, setLanguage] = useState("en");
  const [error, setError] = useState<string | null>(null);

  // Restore saved controller session
  useEffect(() => {
    const saved = window.localStorage.getItem(controllerStorageKey);
    if (!saved) return;
    const [savedCode, savedToken] = saved.split(":");
    if (savedCode && savedToken) {
      setDisplayCode(savedCode);
      setControllerToken(savedToken);
    }
  }, []);

  const controllerArgs = useMemo(() => {
    if (!displayCode || !controllerToken) return "skip";
    return { displayCode, controllerToken };
  }, [controllerToken, displayCode]);

  const gameState = useQuery(api.games.getControllerByDisplayCode, controllerArgs);
  const hasSavedGame = !!(displayCode && controllerToken);

  // ── Actions ─────────────────────────────────────────────────────────────
  async function startNewGame() {
    setError(null);
    try {
      const nextCode = createDisplayCode();
      const nextToken = createControllerToken();
      const result = await createGame({
        displayCode: nextCode,
        controllerToken: nextToken,
        languageCode: language,
        seed: `${nextCode}:${nextToken}`,
      });
      setDisplayCode(result.displayCode);
      setControllerToken(nextToken);
      window.localStorage.setItem(controllerStorageKey, `${result.displayCode}:${nextToken}`);
      setView("controller");
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

  async function endTurn() {
    if (!gameState || !controllerToken) return;
    setError(null);
    try {
      await swapTurn({ gameId: gameState.game._id, controllerToken });
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not swap turn.");
    }
  }

  function goToMenu() {
    setView("menu");
    setError(null);
  }

  // ── Derived ─────────────────────────────────────────────────────────────
  const game = gameState?.game;
  const isRed = game?.currentTurn === "red";
  const isBlue = game?.currentTurn === "blue";
  const hasWinner = !!game?.winner;

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <main
      className={[
        "bg-[#0b0919] text-white",
        view === "controller" ? "h-screen overflow-hidden" : "min-h-screen",
      ].join(" ")}
    >
      <Blobs />

      {/* ══════════════════════════════════════════════════════ MENU ══ */}
      {view === "menu" && (
        <div className="relative flex min-h-screen flex-col items-center justify-center px-6 py-12">
          {/* Hero */}
          <div className="mb-10 flex flex-col items-center gap-4 text-center">
            <Image
              src="/icon.png"
              alt="CodeWords"
              width={80}
              height={80}
              className="rounded-2xl shadow-2xl shadow-indigo-500/30"
            />
            <h1 className="text-5xl font-black tracking-tight sm:text-6xl">
              <span className="bg-gradient-to-r from-white via-cyan-100 to-indigo-300 bg-clip-text text-transparent">
                CodeWords
              </span>
            </h1>
            <p className="max-w-xs text-sm text-white/40">
              A spy-word game for teams. One screen, many agents.
            </p>
          </div>

          {/* Action cards */}
          <div className="w-full max-w-sm space-y-3">
            {/* New game */}
            <div className="rounded-2xl border border-white/8 bg-white/5 p-4">
              <p className="mb-3 text-[0.6rem] font-black uppercase tracking-[0.35em] text-white/35">
                Language
              </p>
              <div className="mb-4 flex flex-wrap gap-2">
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    className={[
                      "rounded-xl border px-3 py-1.5 text-xs font-black transition",
                      language === lang.code
                        ? "border-cyan-400/50 bg-cyan-500/20 text-cyan-200"
                        : "border-white/10 bg-white/5 text-white/50 hover:bg-white/10 hover:text-white",
                    ].join(" ")}
                    type="button"
                    onClick={() => setLanguage(lang.code)}
                  >
                    {lang.flag} {lang.label}
                  </button>
                ))}
              </div>
              <button
                className="w-full rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 py-3.5 font-black uppercase tracking-wider shadow-lg shadow-cyan-500/25 transition hover:brightness-110 active:scale-[0.98]"
                type="button"
                onClick={startNewGame}
              >
                New Mission
              </button>
            </div>

            {/* Resume saved */}
            {hasSavedGame && (
              <button
                className="flex w-full items-center gap-4 rounded-2xl border border-white/8 bg-white/5 px-5 py-4 text-left transition hover:bg-white/8"
                type="button"
                onClick={() => setView("controller")}
              >
                <span className="text-2xl">🎮</span>
                <div>
                  <p className="text-sm font-black text-white">Resume game</p>
                  <p className="mt-0.5 font-mono text-xs text-amber-300/70">{displayCode}</p>
                </div>
                <span className="ml-auto text-white/30">→</span>
              </button>
            )}

            {/* Join as controller */}
            <button
              className="flex w-full items-center gap-4 rounded-2xl border border-white/8 bg-white/5 px-5 py-4 text-left transition hover:bg-white/8"
              type="button"
              onClick={() => { setView("join"); setError(null); }}
            >
              <span className="text-2xl">🔑</span>
              <div>
                <p className="text-sm font-black text-white">Join as controller</p>
                <p className="mt-0.5 text-xs text-white/40">Enter a game code + token</p>
              </div>
              <span className="ml-auto text-white/30">→</span>
            </button>

            {/* Open board */}
            <button
              className="flex w-full items-center gap-4 rounded-2xl border border-white/8 bg-white/5 px-5 py-4 text-left transition hover:bg-white/8"
              type="button"
              onClick={() => { setView("open-board"); setError(null); }}
            >
              <span className="text-2xl">📺</span>
              <div>
                <p className="text-sm font-black text-white">Open board</p>
                <p className="mt-0.5 text-xs text-white/40">View a board by display code</p>
              </div>
              <span className="ml-auto text-white/30">→</span>
            </button>
          </div>

          {error && (
            <p className="mt-4 text-sm text-red-300">{error}</p>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════ JOIN ══ */}
      {view === "join" && (
        <JoinView onBack={goToMenu} />
      )}

      {/* ══════════════════════════════════ OPEN BOARD FROM CODE ══ */}
      {view === "open-board" && (
        <OpenBoardView onBack={goToMenu} router={router} />
      )}

      {/* ═══════════════════════════════════════════════ CONTROLLER ══ */}
      {view === "controller" && (
        <div className="relative flex h-full flex-col gap-2 px-4 py-3">

          {/* Top bar */}
          <header className="flex shrink-0 items-center justify-between">
            <button
              className="flex items-center gap-2.5 transition hover:opacity-70"
              type="button"
              onClick={goToMenu}
              title="Back to menu"
            >
              <Image src="/icon.png" alt="CodeWords" width={28} height={28} className="rounded-lg" />
              <span className="text-sm font-black uppercase tracking-[0.3em] text-white/50">
                CodeWords
              </span>
            </button>
            <button
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-black uppercase tracking-wider text-white/60 transition hover:bg-white/10 hover:text-white"
              type="button"
              onClick={startNewGame}
            >
              New Mission
            </button>
          </header>

          {/* Score + end turn row */}
          <div className="grid shrink-0 grid-cols-[1fr_auto_1fr_auto] gap-2">
            {/* Red */}
            <div className={["flex items-center gap-4 rounded-2xl border px-5 py-4 transition-all duration-500", isRed && !hasWinner ? "border-red-400/40 bg-red-500/12 shadow-lg shadow-red-500/15" : "border-white/6 bg-white/4"].join(" ")}>
              <div className={["flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-2xl font-black transition-all duration-500", isRed && !hasWinner ? "bg-red-500/30 text-red-200" : "bg-red-500/10 text-red-300/50"].join(" ")}>
                {game?.redRemaining ?? "–"}
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-red-300/50">Red team</p>
                <p className="text-xs text-red-200/40">words remaining</p>
              </div>
              {isRed && !hasWinner && (
                <span className="ml-auto rounded-lg bg-red-500/25 px-2.5 py-1 text-[0.6rem] font-black uppercase tracking-wider text-red-200">Turn</span>
              )}
            </div>

            {/* End Turn */}
            {game && !hasWinner && (
              <button
                className={["flex flex-col items-center justify-center gap-1 rounded-2xl border px-4 py-4 text-center transition-all duration-200 hover:scale-105 active:scale-95", isRed ? "border-red-400/40 bg-red-500/10 text-red-200 hover:bg-red-500/20" : "border-sky-400/40 bg-sky-500/10 text-sky-200 hover:bg-sky-500/20"].join(" ")}
                type="button"
                onClick={endTurn}
              >
                <span className="text-xl">⏭</span>
                <span className="text-[0.6rem] font-black uppercase tracking-widest opacity-70">End Turn</span>
              </button>
            )}

            {/* Blue */}
            <div className={["flex items-center gap-4 rounded-2xl border px-5 py-4 transition-all duration-500", isBlue && !hasWinner ? "border-sky-400/40 bg-sky-500/12 shadow-lg shadow-sky-500/15" : "border-white/6 bg-white/4"].join(" ")}>
              <div className={["flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-2xl font-black transition-all duration-500", isBlue && !hasWinner ? "bg-sky-500/30 text-sky-200" : "bg-sky-500/10 text-sky-300/50"].join(" ")}>
                {game?.blueRemaining ?? "–"}
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-sky-300/50">Blue team</p>
                <p className="text-xs text-sky-200/40">words remaining</p>
              </div>
              {isBlue && !hasWinner && (
                <span className="ml-auto rounded-lg bg-sky-500/25 px-2.5 py-1 text-[0.6rem] font-black uppercase tracking-wider text-sky-200">Turn</span>
              )}
            </div>

            {/* Board code */}
            {displayCode && (
              <div className="flex items-center gap-4 rounded-2xl border border-white/6 bg-white/4 px-5 py-4">
                <div>
                  <p className="text-[0.6rem] font-black uppercase tracking-[0.3em] text-white/30">Board code</p>
                  <p className="mt-0.5 font-mono text-xl font-black tracking-[0.15em] text-amber-200">{displayCode}</p>
                </div>
                <CastSender displayCode={displayCode} />
              </div>
            )}
          </div>

          {/* Players */}
          {gameState && gameState.players.length > 0 && (
            <div className="flex shrink-0 flex-wrap items-center gap-2">
              <span className="text-[0.6rem] font-black uppercase tracking-widest text-white/25">Players</span>
              {gameState.players.map((p: { _id: string; name: string; joinedAt: number }) => (
                <span key={p._id} className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-black text-white/70">
                  🕵️ {p.name}
                </span>
              ))}
            </div>
          )}

          {/* Winner banner */}
          {hasWinner && (
            <div className={["shrink-0 rounded-2xl py-3 text-center font-black uppercase tracking-widest", game?.winner === "red" ? "bg-red-500/20 text-red-200" : "bg-sky-500/20 text-sky-200"].join(" ")}>
              {game?.winner} wins! —{" "}
              <button className="underline underline-offset-2" type="button" onClick={goToMenu}>Back to menu</button>
            </div>
          )}

          {error && (
            <div className="shrink-0 rounded-xl border border-red-400/30 bg-red-950/50 px-3 py-2 text-xs text-red-200">{error}</div>
          )}

          {/* Board */}
          <div className="min-h-0 flex-1">
            {gameState ? (
              <GameBoard cells={gameState.cells as BoardCell[]} mode="controller" onReveal={reveal} />
            ) : (
              <div className="flex h-full items-center justify-center rounded-2xl border border-dashed border-white/10 bg-white/3 text-white/30">
                <p className="text-sm font-black uppercase tracking-widest">Loading board…</p>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}

// ─── Join view ────────────────────────────────────────────────────────────────
function JoinView({ onBack }: { onBack: () => void }) {
  const joinGame = useMutation(api.games.joinGame);
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const trimCode = code.trim().toUpperCase();
    const trimName = name.trim();
    if (!trimCode || trimCode.length < 4) { setError("Enter a valid board code."); return; }
    if (!trimName) { setError("Enter your name."); return; }
    setError(null);
    setLoading(true);
    try {
      await joinGame({ displayCode: trimCode, name: trimName });
      setDone(true);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not join game.");
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="relative flex min-h-screen flex-col items-center justify-center px-6 py-12 text-center">
        <div className="w-full max-w-sm space-y-4">
          <div className="text-5xl">🕵️</div>
          <h2 className="text-2xl font-black">You're in!</h2>
          <p className="text-white/50">
            You joined <span className="font-mono font-black text-amber-200">{code.toUpperCase()}</span> as <span className="font-black text-white">{name}</span>.
            <br />The controller can see you've arrived.
          </p>
          <button
            className="mt-4 w-full rounded-xl border border-white/10 bg-white/5 py-3 font-black uppercase tracking-wider text-white/60 transition hover:bg-white/10 hover:text-white"
            type="button"
            onClick={onBack}
          >
            Back to menu
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm">
        <button className="mb-6 flex items-center gap-2 text-sm text-white/40 transition hover:text-white" type="button" onClick={onBack}>
          ← Back
        </button>
        <h2 className="mb-1 text-2xl font-black">Join a game</h2>
        <p className="mb-6 text-sm text-white/40">Enter the room code and your name.</p>
        <form className="space-y-3" onSubmit={submit}>
          <div>
            <label className="mb-1 block text-[0.6rem] font-black uppercase tracking-widest text-white/40">Room code</label>
            <input
              autoFocus
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 font-mono text-lg font-black uppercase tracking-widest text-amber-200 outline-none placeholder:text-white/20 focus:border-amber-400/40"
              placeholder="MWKZCN"
              maxLength={8}
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
            />
          </div>
          <div>
            <label className="mb-1 block text-[0.6rem] font-black uppercase tracking-widest text-white/40">Your name</label>
            <input
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-base font-black text-white outline-none placeholder:text-white/20 focus:border-white/20"
              placeholder="Agent Fox"
              maxLength={24}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          {error && <p className="text-sm text-red-300">{error}</p>}
          <button
            className="w-full rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 py-3.5 font-black uppercase tracking-wider shadow-lg transition hover:brightness-110 disabled:opacity-50"
            type="submit"
            disabled={loading}
          >
            {loading ? "Joining…" : "Join Game"}
          </button>
        </form>
      </div>
    </div>
  );
}

// ─── Open board view ──────────────────────────────────────────────────────────
function OpenBoardView({ onBack, router }: { onBack: () => void; router: ReturnType<typeof useRouter> }) {
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const trimCode = code.trim().toUpperCase();
    if (!trimCode || trimCode.length < 4) { setError("Enter a valid board code."); return; }
    router.push(`/board/${trimCode}`);
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm">
        <button className="mb-6 flex items-center gap-2 text-sm text-white/40 transition hover:text-white" type="button" onClick={onBack}>
          ← Back
        </button>
        <h2 className="mb-1 text-2xl font-black">Open board</h2>
        <p className="mb-6 text-sm text-white/40">Enter a display code to open the board view.</p>
        <form className="space-y-3" onSubmit={submit}>
          <div>
            <label className="mb-1 block text-[0.6rem] font-black uppercase tracking-widest text-white/40">Board code</label>
            <input
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 font-mono text-lg font-black uppercase tracking-widest text-amber-200 outline-none placeholder:text-white/20 focus:border-amber-400/40 focus:bg-white/8"
              placeholder="MWKZCN"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
            />
          </div>
          {error && <p className="text-sm text-red-300">{error}</p>}
          <button className="w-full rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 py-3.5 font-black uppercase tracking-wider shadow-lg transition hover:brightness-110" type="submit">
            Open Board
          </button>
        </form>
      </div>
    </div>
  );
}
