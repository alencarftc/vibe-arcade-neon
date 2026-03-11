"use client";

import { useBoard } from "../hooks/useBoard";
import { SudokuGrid } from "./SudokuGrid";

interface BoardShellProps {
  won?: boolean;
}

export function BoardShell({ won = false }: BoardShellProps) {
  const { board, solution, selectedCell, selectCell } = useBoard();

  if (!board || !solution) return null;

  return (
    <div className="w-full max-w-md mx-auto">
      <SudokuGrid
        board={board}
        solution={solution}
        selectedCell={selectedCell}
        onCellSelect={selectCell}
        won={won}
      />
    </div>
  );
}
