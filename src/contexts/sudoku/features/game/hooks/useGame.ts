import {
  boardAtom,
  generatePuzzle,
  getHint,
  isCorrectValue,
  isSolved,
  selectedCellAtom,
  solutionAtom,
} from "@/contexts/sudoku/features/board";
import { useAtom, useSetAtom } from "jotai";
import type { Difficulty } from "../model";
import { getCellsToRemove } from "../service";
import {
  difficultyAtom,
  elapsedAtom,
  gameStatusAtom,
  mistakesAtom,
} from "../store";

export function useGame() {
  const [board, setBoard] = useAtom(boardAtom);
  const [solution, setSolution] = useAtom(solutionAtom);
  const [selectedCell, setSelectedCell] = useAtom(selectedCellAtom);
  const [difficulty, setDifficulty] = useAtom(difficultyAtom);
  const [status, setStatus] = useAtom(gameStatusAtom);
  const [mistakes, setMistakes] = useAtom(mistakesAtom);
  const setElapsed = useSetAtom(elapsedAtom);

  function startNewGame(diff: Difficulty) {
    const count = getCellsToRemove(diff);
    const { puzzle, solution: sol } = generatePuzzle(count);
    setBoard(puzzle);
    setSolution(sol);
    setDifficulty(diff);
    setSelectedCell(null);
    setStatus("playing");
    setMistakes(0);
    setElapsed(0);
  }

  function placeNumber(value: number) {
    if (status !== "playing" || !selectedCell || !board || !solution) return;

    const cell = board[selectedCell.row][selectedCell.col];
    if (cell.isInitial) return;

    if (!isCorrectValue(solution, selectedCell, value)) {
      setMistakes((m) => m + 1);
    }

    const newBoard = board.map((row) => row.map((c) => ({ ...c })));
    newBoard[selectedCell.row][selectedCell.col] = {
      ...newBoard[selectedCell.row][selectedCell.col],
      value,
    };
    setBoard(newBoard);

    if (isSolved(newBoard, solution)) {
      setStatus("won");
    }
  }

  function eraseCell() {
    if (status !== "playing" || !selectedCell || !board) return;

    const cell = board[selectedCell.row][selectedCell.col];
    if (cell.isInitial) return;

    const newBoard = board.map((row) => row.map((c) => ({ ...c })));
    newBoard[selectedCell.row][selectedCell.col] = {
      ...newBoard[selectedCell.row][selectedCell.col],
      value: null,
    };
    setBoard(newBoard);
  }

  function requestHint() {
    if (status !== "playing" || !board || !solution) return;

    const pos = getHint(board, solution);
    if (!pos) return;

    const newBoard = board.map((row) => row.map((c) => ({ ...c })));
    newBoard[pos.row][pos.col] = {
      ...newBoard[pos.row][pos.col],
      value: solution[pos.row][pos.col].value,
      isInitial: true,
    };
    setBoard(newBoard);
    setSelectedCell(pos);

    if (isSolved(newBoard, solution)) {
      setStatus("won");
    }
  }

  return {
    board,
    solution,
    difficulty,
    status,
    mistakes,
    startNewGame,
    placeNumber,
    eraseCell,
    requestHint,
  };
}
