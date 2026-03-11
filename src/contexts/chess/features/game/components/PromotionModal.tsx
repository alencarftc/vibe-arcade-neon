"use client";

import { PIECE_UNICODE, type PieceType } from "../model";

const PROMOTION_OPTIONS: { piece: PieceType; label: string }[] = [
  { piece: "q", label: "Rainha" },
  { piece: "r", label: "Torre" },
  { piece: "b", label: "Bispo" },
  { piece: "n", label: "Cavalo" },
];

interface Props {
  onChoose: (piece: PieceType) => void;
}

export function PromotionModal({ onChoose }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4 rounded-2xl border border-[#00f0ff]/30 bg-[#0a0a1a] p-8 shadow-[0_0_40px_rgba(0,240,255,0.2)]">
        <h2 className="font-display text-lg font-bold tracking-widest uppercase text-[#00f0ff]">
          Promover Peão
        </h2>
        <div className="flex gap-3">
          {PROMOTION_OPTIONS.map(({ piece, label }) => (
            <button
              key={piece}
              type="button"
              onClick={() => onChoose(piece)}
              title={label}
              className="flex flex-col items-center gap-1 rounded-xl border border-white/10 bg-[#141430] px-4 py-3 text-4xl text-white transition-all hover:border-[#00f0ff]/60 hover:shadow-[0_0_16px_rgba(0,240,255,0.3)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00f0ff]"
            >
              <span className="drop-shadow-[0_0_6px_rgba(255,255,255,0.9)]">
                {PIECE_UNICODE[piece]}
              </span>
              <span className="text-[10px] font-display tracking-wider text-white/40">
                {label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
