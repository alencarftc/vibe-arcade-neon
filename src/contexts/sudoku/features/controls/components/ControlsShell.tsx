"use client";

import { useBoard } from "@/contexts/sudoku/features/board";
import { useGame } from "@/contexts/sudoku/features/game";
import { ActionBar } from "./ActionBar";
import { NumberPad } from "./NumberPad";

export function ControlsShell() {
  const { board } = useBoard();
  const {
    status,
    difficulty,
    placeNumber,
    eraseCell,
    requestHint,
    startNewGame,
  } = useGame();

  const remainingCounts: Record<number, number> = {};
  if (board) {
    for (let n = 1; n <= 9; n++) {
      let count = 9;
      for (const row of board) {
        for (const cell of row) {
          if (cell.value === n) count--;
        }
      }
      remainingCounts[n] = count;
    }
  }

  return (
    <div className="flex flex-col gap-4 w-full max-w-md mx-auto">
      <NumberPad onNumber={placeNumber} remainingCounts={remainingCounts} />
      <ActionBar
        onNewGame={() => startNewGame(difficulty)}
        onHint={requestHint}
        onErase={eraseCell}
        disabled={status !== "playing"}
      />
    </div>
  );
}
