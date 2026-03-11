"use client";

import type { Chess, Square } from "chess.js";
import { useMemo } from "react";
import type { PieceType } from "../model";
import { BoardSquare } from "./BoardSquare";

const FILES = ["a", "b", "c", "d", "e", "f", "g", "h"] as const;
const RANKS = [8, 7, 6, 5, 4, 3, 2, 1] as const;

interface Props {
  chess: Chess;
  selectedSquare: string | null;
  legalMoves: string[];
  moveHistory: { from: string; to: string }[];
  onSquareClick: (square: string) => void;
}

export function ChessBoard({
  chess,
  selectedSquare,
  legalMoves,
  moveHistory,
  onSquareClick,
}: Props) {
  const lastMove = moveHistory[moveHistory.length - 1];

  const checkedKingSquare = useMemo(() => {
    if (!chess.isCheck()) return null;
    const board = chess.board();
    const currentTurn = chess.turn();
    for (let rank = 0; rank < 8; rank++) {
      for (let file = 0; file < 8; file++) {
        const piece = board[rank][file];
        if (piece && piece.type === "k" && piece.color === currentTurn) {
          return `${FILES[file]}${8 - rank}`;
        }
      }
    }
    return null;
  }, [chess]);

  return (
    <div
      className="relative border border-[#2a2a5e] shadow-[0_0_40px_rgba(0,240,255,0.1)]"
      style={{ aspectRatio: "1 / 1" }}
    >
      <div className="absolute -left-5 inset-y-0 flex flex-col justify-around pointer-events-none">
        {RANKS.map((rank) => (
          <span
            key={rank}
            className="text-[10px] font-display text-white/30 w-4 text-center"
          >
            {rank}
          </span>
        ))}
      </div>

      <div className="absolute -bottom-5 inset-x-0 flex justify-around pointer-events-none">
        {FILES.map((file) => (
          <span
            key={file}
            className="text-[10px] font-display text-white/30 flex-1 text-center"
          >
            {file}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-8 w-full h-full">
        {RANKS.map((rank, ri) =>
          FILES.map((file, fi) => {
            const square = `${file}${rank}`;
            const rawPiece = chess.get(square as Square);
            const piece = rawPiece
              ? { type: rawPiece.type as PieceType, color: rawPiece.color }
              : null;
            const isLight = (ri + fi) % 2 === 0;

            return (
              <BoardSquare
                key={square}
                square={square}
                piece={piece}
                isLight={isLight}
                isSelected={selectedSquare === square}
                isLegalMove={legalMoves.includes(square)}
                isLastMove={
                  lastMove?.from === square || lastMove?.to === square
                }
                isInCheck={checkedKingSquare === square}
                onClick={onSquareClick}
              />
            );
          }),
        )}
      </div>
    </div>
  );
}
