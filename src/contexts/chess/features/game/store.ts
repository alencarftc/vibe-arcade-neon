import { Chess } from "chess.js";
import { atom } from "jotai";
import type {
  Clock,
  DifficultyLevel,
  GameMove,
  GameStatus,
  PieceType,
} from "./model";

const DEFAULT_CLOCK_MS = 10 * 60 * 1000;

export const gameInstanceAtom = atom<Chess>(new Chess());

export const boardRevisionAtom = atom(0);

export const difficultyAtom = atom<DifficultyLevel | null>(null);

export const gameStatusAtom = atom<GameStatus>("waiting");

export const selectedSquareAtom = atom<string | null>(null);

export const legalMovesAtom = atom<string[]>([]);

export const moveHistoryAtom = atom<GameMove[]>([]);

export const pendingPromotionAtom = atom<{ from: string; to: string } | null>(
  null,
);

export const promotionPieceAtom = atom<PieceType | null>(null);

export const clockAtom = atom<Clock>({
  white: DEFAULT_CLOCK_MS,
  black: DEFAULT_CLOCK_MS,
  active: null,
});

export const aiThinkingAtom = atom(false);
