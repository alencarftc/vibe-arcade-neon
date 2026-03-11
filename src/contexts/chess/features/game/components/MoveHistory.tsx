"use client";

import { useEffect, useRef } from "react";
import type { GameMove } from "../model";

interface Props {
  moveHistory: GameMove[];
}

export function MoveHistory({ moveHistory }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [moveHistory.length]);

  const pairs: [GameMove, GameMove | null][] = [];
  for (let i = 0; i < moveHistory.length; i += 2) {
    pairs.push([moveHistory[i], moveHistory[i + 1] ?? null]);
  }

  return (
    <div className="flex flex-col h-full min-h-0">
      <h3 className="mb-2 text-xs font-display tracking-widest uppercase text-white/30">
        Movimentos
      </h3>
      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-0.5 pr-1 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10">
        {pairs.length === 0 && (
          <p className="text-xs text-white/20 italic">
            Nenhum movimento ainda.
          </p>
        )}
        {pairs.map(([white, black], idx) => (
          <div
            key={idx}
            className="grid grid-cols-[2rem_1fr_1fr] items-center gap-1 text-sm font-display"
          >
            <span className="text-white/20 text-xs">{idx + 1}.</span>
            <span className="text-white/70 px-1 rounded hover:bg-white/5 transition-colors">
              {white.san}
            </span>
            {black && (
              <span className="text-[#b829dd]/80 px-1 rounded hover:bg-white/5 transition-colors">
                {black.san}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
