"use client";

import { BoardShell, useBoard } from "@/contexts/sudoku/features/board";
import { ControlsShell } from "@/contexts/sudoku/features/controls";
import {
  GameHeader,
  elapsedAtom,
  useGame,
  useTimer,
} from "@/contexts/sudoku/features/game";
import { useAtomValue } from "jotai";
import { useCallback, useEffect } from "react";

export function SudokuShell() {
  const { selectedCell, selectCell } = useBoard();
  const {
    difficulty,
    status,
    mistakes,
    startNewGame,
    placeNumber,
    eraseCell,
    requestHint,
  } = useGame();
  const elapsed = useAtomValue(elapsedAtom);
  useTimer();

  // Auto-start a game on mount
  useEffect(() => {
    startNewGame("easy");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (status !== "playing") return;

      if (e.key >= "1" && e.key <= "9") {
        placeNumber(parseInt(e.key, 10));
        return;
      }

      if (e.key === "Backspace" || e.key === "Delete") {
        eraseCell();
        return;
      }

      if (e.key === "h" || e.key === "H") {
        requestHint();
        return;
      }

      if (!selectedCell) return;

      const moves: Record<string, [number, number]> = {
        ArrowUp: [-1, 0],
        ArrowDown: [1, 0],
        ArrowLeft: [0, -1],
        ArrowRight: [0, 1],
      };

      const move = moves[e.key];
      if (move) {
        e.preventDefault();
        selectCell({
          row: Math.max(0, Math.min(8, selectedCell.row + move[0])),
          col: Math.max(0, Math.min(8, selectedCell.col + move[1])),
        });
      }
    },
    [status, selectedCell, placeNumber, eraseCell, requestHint, selectCell],
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-lg mx-auto px-4 py-8">
      <GameHeader
        difficulty={difficulty}
        mistakes={mistakes}
        elapsed={elapsed}
        status={status}
        onDifficultyChange={(d) => startNewGame(d)}
      />
      <BoardShell won={status === "won"} />
      <ControlsShell />
    </div>
  );
}
