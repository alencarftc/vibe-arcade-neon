import { cn } from "@/shared/utils";
import type { Board, Position } from "../model";
import { SudokuCell } from "./SudokuCell";

interface SudokuGridProps {
  board: Board;
  solution: Board;
  selectedCell: Position | null;
  onCellSelect: (pos: Position) => void;
  won: boolean;
}

function getBoxCells(board: Board, boxIndex: number) {
  const boxRow = Math.floor(boxIndex / 3) * 3;
  const boxCol = (boxIndex % 3) * 3;
  const cells: { cell: Board[0][0]; row: number; col: number }[] = [];
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      cells.push({
        cell: board[boxRow + r][boxCol + c],
        row: boxRow + r,
        col: boxCol + c,
      });
    }
  }
  return cells;
}

export function SudokuGrid({
  board,
  solution,
  selectedCell,
  onCellSelect,
  won,
}: SudokuGridProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-3 gap-[3px] rounded-lg overflow-hidden",
        "bg-neon-purple/60 border-2 border-neon-purple/50",
        won &&
          "border-neon-green/60 bg-neon-green/20 shadow-[0_0_30px_var(--color-neon-green)]",
      )}
    >
      {Array.from({ length: 9 }, (_, boxIndex) => (
        <div key={boxIndex} className="grid grid-cols-3 gap-[1px] bg-white/8">
          {getBoxCells(board, boxIndex).map(({ cell, row, col }) => {
            const isSelected =
              selectedCell?.row === row && selectedCell?.col === col;

            const isHighlighted =
              selectedCell !== null &&
              !isSelected &&
              (selectedCell.row === row ||
                selectedCell.col === col ||
                (Math.floor(selectedCell.row / 3) === Math.floor(row / 3) &&
                  Math.floor(selectedCell.col / 3) === Math.floor(col / 3)));

            const selectedValue =
              selectedCell !== null
                ? board[selectedCell.row][selectedCell.col].value
                : null;

            const isSameValue =
              !isSelected &&
              selectedValue !== null &&
              cell.value !== null &&
              cell.value === selectedValue;

            const isError =
              !cell.isInitial &&
              cell.value !== null &&
              cell.value !== solution[row][col].value;

            return (
              <SudokuCell
                key={`${row}-${col}`}
                cell={cell}
                isSelected={isSelected}
                isHighlighted={isHighlighted}
                isSameValue={isSameValue}
                isError={isError}
                onClick={() => onCellSelect({ row, col })}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
}
