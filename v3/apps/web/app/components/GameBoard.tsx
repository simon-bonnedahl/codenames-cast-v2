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

// Revealed: soft pastels — obvious but not heavy
const revealedPalette: Record<Exclude<CellType, null>, string> = {
  red: "border-red-200/80 bg-gradient-to-b from-red-100 to-red-300 text-red-900 shadow-md shadow-red-200/30",
  blue: "border-sky-200/80 bg-gradient-to-b from-sky-100 to-sky-300 text-sky-950 shadow-md shadow-sky-200/30",
  neutral: "border-stone-300/80 bg-gradient-to-b from-stone-100 to-stone-300 text-stone-800 shadow-md shadow-stone-200/30",
  bomb: "border-zinc-500/80 bg-gradient-to-b from-zinc-600 to-zinc-800 text-zinc-100 shadow-md shadow-zinc-500/30",
};

// Unrevealed hints: light team tints for the spymaster
const controllerHintPalette: Record<Exclude<CellType, null>, string> = {
  red: "border-red-200/70 bg-red-50/90 text-red-800",
  blue: "border-sky-200/70 bg-sky-50/90 text-sky-900",
  neutral: "border-stone-300/70 bg-stone-100/90 text-stone-700",
  bomb: "border-zinc-400/70 bg-zinc-200/90 text-zinc-800",
};

const hiddenCell =
  "border-stone-300/50 bg-gradient-to-b from-[#f7f0e6] to-[#ebe0d0] text-stone-800 shadow-sm shadow-stone-900/10";

function getCellClass(cell: BoardCell, mode: GameBoardProps["mode"]) {
  if (cell.revealed && cell.type) {
    return revealedPalette[cell.type];
  }
  if (mode === "controller" && cell.type) {
    return controllerHintPalette[cell.type];
  }
  return hiddenCell;
}

export function GameBoard({ cells, mode, onReveal, size = "default" }: GameBoardProps) {
  const isTv = size === "tv";

  // Both modes use the same grid strategy: fill the parent container with grid-rows-5.
  // The parent is responsible for providing a bounded height (h-full / flex-1 min-h-0).
  return (
    <div
      className={[
        "grid h-full w-full grid-cols-5 grid-rows-5 auto-rows-fr",
        isTv ? "gap-2.5" : "gap-1.5 sm:gap-2",
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
                ? "text-[clamp(0.7rem,2.2vh,1.35rem)]"
                : "text-[clamp(0.55rem,1.6vw,1.1rem)]",
            ].join(" ")}
          >
            {cell.word}
          </span>
        );

        const bombEl = showBombIcon ? (
          <span className="absolute right-1.5 top-1 text-[0.7em] opacity-70">💣</span>
        ) : null;

        const cellClasses = [
          "group relative flex min-h-0 items-center justify-center overflow-hidden rounded-2xl border px-2 py-1.5 shadow-sm transition-all duration-200",
          getCellClass(cell, mode),
          !cell.revealed && onReveal
            ? "cursor-pointer hover:-translate-y-0.5 hover:brightness-[1.03] active:scale-[0.99]"
            : "",
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
