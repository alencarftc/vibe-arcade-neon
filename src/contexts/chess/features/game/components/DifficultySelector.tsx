"use client";

import {
  DIFFICULTY_DESCRIPTIONS,
  DIFFICULTY_LABELS,
  type DifficultyLevel,
} from "../model";

const DIFFICULTY_LEVELS: DifficultyLevel[] = [
  "easy",
  "medium",
  "hard",
  "master",
];

const DIFFICULTY_COLOR: Record<DifficultyLevel, string> = {
  easy: "#39ff14",
  medium: "#00f0ff",
  hard: "#ffe600",
  master: "#ff2d95",
};

interface Props {
  onSelect: (difficulty: DifficultyLevel) => void;
}

export function DifficultySelector({ onSelect }: Props) {
  return (
    <div className="flex flex-col items-center gap-8 px-4 py-12">
      <div className="text-center space-y-2">
        <h1
          className="text-4xl sm:text-5xl font-display font-black tracking-widest uppercase"
          style={{
            color: "#d8b0ee",
            textShadow: "0 0 8px #b829dd, 0 0 20px #b829dd50",
          }}
        >
          ♟ Xadrez
        </h1>
        <p className="text-sm tracking-widest uppercase text-white/55 font-display">
          Escolha o nível da IA
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-lg">
        {DIFFICULTY_LEVELS.map((level) => (
          <button
            key={level}
            type="button"
            onClick={() => onSelect(level)}
            className="group flex flex-col gap-2 rounded-2xl border border-white/10 bg-[#141428] px-6 py-5 text-left transition-all duration-200 hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00f0ff]"
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor =
                `${DIFFICULTY_COLOR[level]}55`;
              (e.currentTarget as HTMLElement).style.boxShadow =
                `0 0 16px ${DIFFICULTY_COLOR[level]}18`;
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = "";
              (e.currentTarget as HTMLElement).style.boxShadow = "";
            }}
          >
            <span
              className="text-xl font-display font-bold tracking-wider"
              style={{ color: DIFFICULTY_COLOR[level] }}
            >
              {DIFFICULTY_LABELS[level]}
            </span>
            <span className="text-xs text-white/60 leading-relaxed">
              {DIFFICULTY_DESCRIPTIONS[level]}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
