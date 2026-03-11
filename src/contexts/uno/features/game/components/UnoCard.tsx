import { cn } from "@/shared/utils";
import type { Card } from "../model";
import { CARD_VALUE_LABEL } from "../model";

const COLOR_BG: Record<string, string> = {
  red: "bg-[#cc1c1c] shadow-[0_0_12px_#cc1c1c88]",
  blue: "bg-[#1a4ecc] shadow-[0_0_12px_#1a4ecc88]",
  green: "bg-[#1a8c36] shadow-[0_0_12px_#1a8c3688]",
  yellow: "bg-[#c8a800] shadow-[0_0_12px_#c8a80088]",
  wild: "bg-[#1a1a2e] shadow-[0_0_12px_#b829dd88]",
};

const COLOR_BORDER: Record<string, string> = {
  red: "border-[#ff4444]",
  blue: "border-[#4488ff]",
  green: "border-[#22cc55]",
  yellow: "border-[#ffe600]",
  wild: "border-[#b829dd]",
};

interface Props {
  card: Card;
  onClick?: () => void;
  disabled?: boolean;
  faceDown?: boolean;
  small?: boolean;
}

export function UnoCard({ card, onClick, disabled, faceDown, small }: Props) {
  const isWild = card.color === "wild";
  const label = faceDown ? "" : CARD_VALUE_LABEL[card.value];
  const bg = faceDown ? "bg-[#1a1a3a] shadow-none" : COLOR_BG[card.color];
  const border = faceDown ? "border-white/20" : COLOR_BORDER[card.color];
  const isAction = isNaN(Number(card.value));

  if (faceDown) {
    return (
      <div
        className={cn(
          "rounded-lg border select-none",
          small ? "w-8 h-12" : "w-14 h-20",
          "bg-[#1a1a3a] border-white/20",
          "flex items-center justify-center",
        )}
      >
        <span className="font-display font-black text-white/20 text-lg">U</span>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "rounded-lg border-2 select-none transition-all duration-150",
        small ? "w-8 h-12 text-[8px]" : "w-14 h-20 text-xs",
        bg,
        border,
        onClick && !disabled
          ? "cursor-pointer hover:scale-110 hover:-translate-y-2 active:scale-95"
          : "cursor-default",
        disabled && "opacity-40 cursor-not-allowed hover:scale-100 hover:translate-y-0",
        "flex flex-col items-center justify-center gap-0.5 relative overflow-hidden",
      )}
    >
      {isWild ? (
        <div className="grid grid-cols-2 gap-0.5 w-5 h-5">
          <div className="rounded-tl-full bg-[#cc1c1c]" />
          <div className="rounded-tr-full bg-[#1a4ecc]" />
          <div className="rounded-bl-full bg-[#1a8c36]" />
          <div className="rounded-br-full bg-[#c8a800]" />
        </div>
      ) : (
        <span
          className={cn(
            "font-display font-black text-white leading-none",
            isAction ? (small ? "text-[7px]" : "text-[10px]") : (small ? "text-sm" : "text-xl"),
          )}
        >
          {label}
        </span>
      )}
      {!small && !isWild && (
        <span className="font-display font-black text-white/50 text-[8px] leading-none">
          {label}
        </span>
      )}
      {!small && card.value === "wild_draw_four" && (
        <span className="font-display font-black text-white text-[8px] leading-none">+4</span>
      )}
    </button>
  );
}
