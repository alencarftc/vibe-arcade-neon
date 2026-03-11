import type { Difficulty } from "./model";

export function getCellsToRemove(difficulty: Difficulty): number {
  switch (difficulty) {
    case "easy":
      return 32;
    case "medium":
      return 44;
    case "hard":
      return 53;
  }
}
