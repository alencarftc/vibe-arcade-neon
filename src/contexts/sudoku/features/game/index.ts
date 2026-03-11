// Types
export type { Difficulty, GameStatus } from "./model";

// Service
export { getCellsToRemove } from "./service";

// Atoms
export {
  difficultyAtom,
  elapsedAtom,
  gameStatusAtom,
  mistakesAtom,
} from "./store";

// Hooks
export { useGame } from "./hooks/useGame";
export { useTimer } from "./hooks/useTimer";

// Components
export { GameHeader } from "./components/GameHeader";
