import type { Card } from "../model";
import { UnoCard } from "./UnoCard";

interface Props {
  topCard: Card;
  onDraw: () => void;
  disabled: boolean;
  pendingDraw: number;
}

export function DiscardPile({ topCard, onDraw, disabled, pendingDraw }: Props) {
  return (
    <div className="flex items-center justify-center gap-6">
      <UnoCard card={topCard} />

      <button
        type="button"
        onClick={onDraw}
        disabled={disabled}
        className="flex flex-col items-center justify-center gap-1 w-14 h-20 rounded-lg border-2 border-white/20 bg-[#1a1a3a] transition-all hover:border-white/50 hover:scale-105 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <span className="font-display font-black text-white/40 text-lg leading-none">U</span>
        {pendingDraw > 0 ? (
          <span className="font-display text-[9px] tracking-wider text-[#ff4444] font-bold">
            +{pendingDraw}
          </span>
        ) : (
          <span className="font-display text-[9px] tracking-wider text-white/30">
            Comprar
          </span>
        )}
      </button>
    </div>
  );
}
