import { atom } from "jotai";
import type { Difficulty, GameStatus } from "./model";

export const difficultyAtom = atom<Difficulty>("easy");
export const gameStatusAtom = atom<GameStatus>("idle");
export const mistakesAtom = atom(0);
export const elapsedAtom = atom(0);
