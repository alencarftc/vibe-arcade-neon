import { atom } from "jotai";
import type { GameState } from "./model";

export const gameStateAtom = atom<GameState | null>(null);
export const pendingWildCardIdAtom = atom<string | null>(null);
