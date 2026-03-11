"use client";

import { cn } from "@/shared/utils";
import { PIECE_UNICODE, type PieceType } from "../model";

interface Props {
  square: string;
  piece: { type: PieceType; color: "w" | "b" } | null;
  isLight: boolean;
  isSelected: boolean;
  isLegalMove: boolean;
  isLastMove: boolean;
  isInCheck: boolean;
  onClick: (square: string) => void;
}

export function BoardSquare({
  square,
  piece,
  isLight,
  isSelected,
  isLegalMove,
  isLastMove,
  isInCheck,
  onClick,
}: Props) {
  let bgClass: string;
  if (isInCheck) {
    bgClass = "bg-[#3a0a1a]";
  } else if (isSelected) {
    bgClass = "bg-[#0a253a]";
  } else if (isLastMove) {
    bgClass = isLight ? "bg-[#3e3000]" : "bg-[#2c2100]";
  } else {
    bgClass = isLight ? "bg-[#25255c]" : "bg-[#0e0e36]";
  }

  return (
    <button
      type="button"
      onClick={() => onClick(square)}
      className={cn(
        "relative flex items-center justify-center w-full aspect-square text-3xl sm:text-4xl select-none transition-colors duration-100",
        bgClass,
        isSelected &&
          "ring-2 ring-inset ring-[#00f0ff] shadow-[inset_0_0_10px_rgba(0,240,255,0.25)]",
        isInCheck &&
          "ring-2 ring-inset ring-[#ff2d95] shadow-[inset_0_0_10px_rgba(255,45,149,0.35)]",
        isLastMove && !isSelected && !isInCheck && "ring-1 ring-inset ring-[#ffe600]/50",
      )}
    >
      {isLegalMove && !piece && (
        <span className="absolute w-[30%] h-[30%] rounded-full bg-[#00f0ff]/40 pointer-events-none" />
      )}
      {isLegalMove && piece && (
        <span className="absolute inset-0 ring-2 ring-inset ring-[#00f0ff]/60 pointer-events-none" />
      )}
      {piece && (
        <span
          className={cn(
            "z-10 leading-none",
            piece.color === "w"
              ? "text-white drop-shadow-[0_1px_4px_rgba(0,0,0,1)]"
              : "text-[#cc88ff] drop-shadow-[0_1px_4px_rgba(0,0,0,1)]",
          )}
        >
          {PIECE_UNICODE[piece.type]}
        </span>
      )}
    </button>
  );
}
