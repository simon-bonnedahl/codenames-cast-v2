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
  onReveal?: (index: number) => void;
};

const revealedPalette: Record<Exclude<CellType, null>, string> = {
  red: "border-red-400/40 bg-gradient-to-br from-red-500 to-red-900 text-white shadow-red-700/40",
  blue: "border-sky-400/40 bg-gradient-to-br from-sky-400 to-indigo-900 text-white shadow-sky-700/40",
  neutral: "border-stone-300/30 bg-gradient-to-br from-stone-300 to-stone-600 text-stone-950 shadow-stone-700/20",
  bomb: "border-purple-400/30 bg-gradient-to-br from-zinc-800 to-black text-white shadow-purple-900/50",
};

const controllerHintPalette: Record<Exclude<CellType, null>, string> = {
  red: "border-red-500/50 bg-gradient-to-br from-red-900/80 to-red-950 text-red-200",
  blue: "border-sky-500/50 bg-gradient-to-br from-sky-900/80 to-indigo-950 text-sky-200",
  neutral: "border-stone-400/30 bg-gradient-to-br from-stone-700/60 to-stone-900 text-stone-300",
  bomb: "border-purple-500/30 bg-gradient-to-br from-zinc-900/80 to-black text-purple-200",
};

const hiddenCell =
  "border-amber-200/20 bg-gradient-to-br from-[#3a2d18] via-[#2e2210] to-[#1a1408] text-amber-100 shadow-black/40";

function getCellClass(cell: BoardCell, mode: GameBoardProps["mode"]) {
  if (cell.revealed && cell.type) {
    return revealedPalette[cell.type];
  }
  if (mode === "controller" && cell.type) {
    return controllerHintPalette[cell.type];
  }
  return hiddenCell;
}

export function GameBoard({ cells, mode, onReveal }: GameBoardProps) {
  const isDisplay = mode === "display";

  // Both modes use the same grid strategy: fill the parent container with grid-rows-5.
  // The parent is responsible for providing a bounded height (h-full / flex-1 min-h-0).
  return (
    <div
      className={[
        "grid h-full w-full grid-cols-5 grid-rows-5",
        isDisplay
          ? "mx-auto max-w-[150vh] gap-[min(1vw,0.9vh)]"
          : "gap-1.5 sm:gap-2",
      ].join(" ")}
    >
      {cells.map((cell) => {
        const isBomb = cell.type === "bomb";
        const showBombIcon = isBomb && (cell.revealed || mode === "controller");

        const wordEl = (
          <span className="text-center text-[clamp(0.55rem,1.6vw,1.1rem)] font-black uppercase tracking-wide leading-tight">
            {cell.word}
          </span>
        );

        const bombEl = showBombIcon ? (
          <span className="absolute right-1.5 top-1 text-[0.7em] opacity-70">💣</span>
        ) : null;

        const cellClasses = [
          "group relative flex min-h-0 items-center justify-center overflow-hidden rounded-xl border shadow-xl transition-all duration-200 p-1.5",
          getCellClass(cell, mode),
          !cell.revealed && onReveal
            ? "cursor-pointer hover:-translate-y-0.5 hover:scale-[1.02] hover:brightness-125 active:scale-[0.98]"
            : "",
          cell.revealed ? "opacity-90 ring-1 ring-white/20 brightness-95" : "",
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
