import { atom } from "jotai";
import type { Board, Position } from "./model";

export const boardAtom = atom<Board | null>(null);
export const solutionAtom = atom<Board | null>(null);
export const selectedCellAtom = atom<Position | null>(null);
