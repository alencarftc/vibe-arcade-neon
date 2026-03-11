// Types
export type { Board, Cell, Position } from "./model";

// Service (pure domain logic)
export {
  generatePuzzle,
  getHint,
  isCorrectValue,
  isSolved,
  validateMove,
} from "./service";

// Atoms
export { boardAtom, selectedCellAtom, solutionAtom } from "./store";

// Hooks
export { useBoard } from "./hooks/useBoard";

// Components
export { BoardShell } from "./components/BoardShell";
