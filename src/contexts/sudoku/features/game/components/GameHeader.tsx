import { cn } from "@/shared/utils";
import type { Difficulty } from "../model";

interface GameHeaderProps {
  difficulty: Difficulty;
  mistakes: number;
  elapsed: number;
  status: string;
  onDifficultyChange: (d: Difficulty) => void;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

const difficulties: Difficulty[] = ["easy", "medium", "hard"];

const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  easy: "Fácil",
  medium: "Médio",
  hard: "Difícil",
};

export function GameHeader({
  difficulty,
  mistakes,
  elapsed,
  status,
  onDifficultyChange,
}: GameHeaderProps) {
  return (
    <div className="flex flex-col items-center gap-3 w-full">
      <h1
        className={cn(
          "text-3xl sm:text-4xl tracking-[0.3em] uppercase",
          "text-neon-blue drop-shadow-[0_0_10px_var(--color-neon-blue)]",
        )}
      >
        Sudoku
      </h1>

      <div className="flex items-center gap-2">
        {difficulties.map((d) => (
          <button
            key={d}
            type="button"
            onClick={() => onDifficultyChange(d)}
            className={cn(
              "px-3 py-1 rounded text-xs uppercase tracking-wider",
              "transition-all duration-200 cursor-pointer",
              d === difficulty
                ? "bg-neon-purple/20 text-neon-purple border border-neon-purple/50 shadow-[0_0_8px_var(--color-neon-purple)]"
                : "text-white/40 border border-white/10 hover:text-white/70 hover:border-white/30",
            )}
          >
            {DIFFICULTY_LABELS[d]}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-6 text-sm">
        <span className="text-neon-yellow drop-shadow-[0_0_4px_var(--color-neon-yellow)]">
          {formatTime(elapsed)}
        </span>
        <span className="text-white/60">
          Erros:{" "}
          <span
            className={cn(
              mistakes > 0
                ? "text-neon-pink drop-shadow-[0_0_4px_var(--color-neon-pink)]"
                : "text-white/40",
            )}
          >
            {mistakes}
          </span>
        </span>
      </div>

      {status === "won" && (
        <div
          className={cn(
            "text-neon-green text-lg tracking-widest uppercase",
            "drop-shadow-[0_0_10px_var(--color-neon-green)]",
            "animate-pulse",
          )}
        >
          Você venceu!
        </div>
      )}
    </div>
  );
}
