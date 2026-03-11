import {
  Chess,
  type Color,
  type Move,
  type PieceSymbol,
  type Square,
} from "chess.js";
import type { GameMove, GameStatus, PieceColor, PieceType } from "./model";

export type MoveResult =
  | { ok: true; move: GameMove }
  | { ok: false; reason: string };

function toDomainColor(color: Color): PieceColor {
  return color === "w" ? "white" : "black";
}

function toGameMove(m: Move): GameMove {
  return {
    from: m.from as string,
    to: m.to as string,
    piece: m.piece as PieceType,
    color: toDomainColor(m.color),
    san: m.san,
    isCapture: !!m.captured,
    promotion: m.promotion as PieceType | undefined,
    isCheck: m.san.includes("+"),
    isCheckmate: m.san.includes("#"),
  };
}

export function createGame(): Chess {
  return new Chess();
}

export function executeMove(
  chess: Chess,
  from: string,
  to: string,
  promotion?: PieceType,
): MoveResult {
  try {
    const move = chess.move({
      from: from as Square,
      to: to as Square,
      promotion: (promotion ?? "q") as PieceSymbol,
    });
    return { ok: true, move: toGameMove(move) };
  } catch {
    return { ok: false, reason: "Movimento inválido" };
  }
}

export function undoMove(chess: Chess): GameMove | null {
  const move = chess.undo();
  if (!move) return null;
  return toGameMove(move);
}

export function legalMovesFrom(chess: Chess, square: string): string[] {
  return chess
    .moves({ square: square as Square, verbose: true })
    .map((m) => m.to);
}

export function getGameStatus(chess: Chess): GameStatus {
  if (chess.isCheckmate()) return "checkmate";
  if (chess.isStalemate()) return "stalemate";
  if (chess.isDraw()) return "draw";
  if (chess.isCheck()) return "check";
  return "playing";
}

export function getCurrentTurn(chess: Chess): PieceColor {
  return chess.turn() === "w" ? "white" : "black";
}

export function getFEN(chess: Chess): string {
  return chess.fen();
}

export function isPlayerPiece(chess: Chess, square: string): boolean {
  const piece = chess.get(square as Square);
  return !!piece && piece.color === "w";
}

export function needsPromotion(
  chess: Chess,
  from: string,
  to: string,
): boolean {
  const piece = chess.get(from as Square);
  if (!piece || piece.type !== "p") return false;
  const rank = to[1];
  return (
    (piece.color === "w" && rank === "8") ||
    (piece.color === "b" && rank === "1")
  );
}
