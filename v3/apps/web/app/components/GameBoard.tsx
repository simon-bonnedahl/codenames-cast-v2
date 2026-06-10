"use client";

type CellType = "red" | "blue" | "neutral" | "bomb" | null;

export type BoardCell = {
  _id: string;
  index: number;
  word: string;
  type: CellType;
  revealed: boolean;
};

type GameBoardProps = {
  cells: BoardCell[];
  mode: "controller" | "display";
  size?: "default" | "tv";
  onReveal?: (index: number) => void;
};

// ─── Default (controller + browser board) ───────────────────────────────────

const revealedPalette: Record<Exclude<CellType, null>, string> = {
  red: "border-red-300/60 bg-gradient-to-br from-red-400 via-red-600 to-red-800 text-white shadow-lg shadow-red-600/50 ring-2 ring-red-300/30",
  blue: "border-sky-300/60 bg-gradient-to-br from-sky-300 via-blue-500 to-indigo-700 text-white shadow-lg shadow-sky-500/50 ring-2 ring-sky-300/30",
  neutral: "border-stone-200/60 bg-gradient-to-br from-stone-200 via-stone-400 to-stone-500 text-stone-900 shadow-lg shadow-stone-400/30 ring-2 ring-stone-200/30",
  bomb: "border-purple-300/50 bg-gradient-to-br from-purple-900 via-zinc-900 to-black text-white shadow-lg shadow-purple-700/50 ring-2 ring-purple-400/30",
};

const controllerHintPalette: Record<Exclude<CellType, null>, string> = {
  red: "border-red-700/40 bg-gradient-to-br from-red-900/70 to-red-950/90 text-red-400",
  blue: "border-sky-700/40 bg-gradient-to-br from-sky-900/70 to-indigo-950/90 text-sky-400",
  neutral: "border-stone-500/40 bg-gradient-to-br from-stone-600/70 to-stone-700/90 text-stone-300",
  bomb: "border-purple-700/40 bg-gradient-to-br from-zinc-800/70 to-zinc-900/90 text-zinc-400",
};

const hiddenCell =
  "border-amber-200/20 bg-gradient-to-br from-[#3a2d18] via-[#2e2210] to-[#1a1408] text-amber-100 shadow-black/40";

// ─── TV receiver (lighter, compact cards) ───────────────────────────────────

const tvRevealedPalette: Record<Exclude<CellType, null>, string> = {
  red: "border-red-200/80 bg-gradient-to-b from-red-100 to-red-300 text-red-900 shadow-sm shadow-red-200/20",
  blue: "border-sky-200/80 bg-gradient-to-b from-sky-100 to-sky-300 text-sky-950 shadow-sm shadow-sky-200/20",
  neutral: "border-stone-300/80 bg-gradient-to-b from-stone-100 to-stone-300 text-stone-800 shadow-sm shadow-stone-200/20",
  bomb: "border-zinc-500/80 bg-gradient-to-b from-zinc-600 to-zinc-800 text-zinc-100 shadow-sm shadow-zinc-500/20",
};

const tvHiddenCell =
  "border-stone-300/50 bg-gradient-to-b from-[#f7f0e6] to-[#ebe0d0] text-stone-800 shadow-sm shadow-stone-900/10";

function getCellClass(cell: BoardCell, mode: GameBoardProps["mode"], isTv: boolean) {
  if (isTv) {
    if (cell.revealed && cell.type) return tvRevealedPalette[cell.type];
    return tvHiddenCell;
  }
  if (cell.revealed && cell.type) return revealedPalette[cell.type];
  if (mode === "controller" && cell.type) return controllerHintPalette[cell.type];
  return hiddenCell;
}

export function GameBoard({ cells, mode, onReveal, size = "default" }: GameBoardProps) {
  const isTv = size === "tv";
  const isDisplay = mode === "display";

  return (
    <div
      className={[
        "grid h-full w-full grid-cols-5 grid-rows-5",
        isTv
          ? "gap-1"
          : isDisplay
            ? "mx-auto max-w-[150vh] gap-[min(1vw,0.9vh)]"
            : "gap-1.5 sm:gap-2",
      ].join(" ")}
    >
      {cells.map((cell) => {
        const isBomb = cell.type === "bomb";
        const showBombIcon = isBomb && (cell.revealed || mode === "controller");

        const wordEl = (
          <span
            className={[
              "text-center font-black uppercase tracking-wide leading-tight",
              isTv
                ? "text-[clamp(0.5rem,1.5vh,0.95rem)]"
                : "text-[clamp(0.55rem,1.6vw,1.1rem)]",
            ].join(" ")}
          >
            {cell.word}
          </span>
        );

        const bombEl = showBombIcon ? (
          <span className="absolute right-1 top-0.5 text-[0.65em] opacity-70">💣</span>
        ) : null;

        const cellClasses = [
          "group relative flex min-h-0 items-center justify-center overflow-hidden border transition-all duration-200",
          isTv ? "rounded-lg px-1 py-0.5 shadow-sm" : "rounded-xl p-1.5 shadow-xl",
          getCellClass(cell, mode, isTv),
          !cell.revealed && onReveal
            ? isTv
              ? "cursor-pointer hover:brightness-[1.03] active:scale-[0.99]"
              : "cursor-pointer hover:-translate-y-0.5 hover:scale-[1.02] hover:brightness-125 active:scale-[0.98]"
            : "",
          !isTv && cell.revealed ? "opacity-95" : "",
        ]
          .filter(Boolean)
          .join(" ");

        if (!onReveal || cell.revealed) {
          return (
            <div key={cell._id} className={cellClasses}>
              {wordEl}
              {bombEl}
            </div>
          );
        }

        return (
          <button
            key={cell._id}
            className={cellClasses}
            disabled={cell.revealed}
            type="button"
            onClick={() => onReveal(cell.index)}
          >
            {wordEl}
            {bombEl}
          </button>
        );
      })}
    </div>
  );
}
