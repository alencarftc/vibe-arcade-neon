import { cn } from "@/shared/utils";
import type { Cell } from "../model";

interface SudokuCellProps {
  cell: Cell;
  isSelected: boolean;
  isHighlighted: boolean;
  isSameValue: boolean;
  isError: boolean;
  onClick: () => void;
}

export function SudokuCell({
  cell,
  isSelected,
  isHighlighted,
  isSameValue,
  isError,
  onClick,
}: SudokuCellProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-center justify-center aspect-square",
        "text-lg sm:text-2xl transition-all duration-150",
        "focus:outline-none cursor-pointer select-none",
        // Background
        isSelected
          ? "bg-surface-selected shadow-[inset_0_0_12px_var(--color-neon-purple)]"
          : isSameValue
            ? "bg-neon-purple/15"
            : isHighlighted
              ? "bg-surface-highlight"
              : cell.isInitial
                ? "bg-surface-initial"
                : "bg-surface-cell",
        // Text color
        cell.value !== null &&
          (isError
            ? "text-neon-pink drop-shadow-[0_0_6px_var(--color-neon-pink)]"
            : cell.isInitial
              ? "text-neon-blue"
              : "text-neon-green drop-shadow-[0_0_4px_var(--color-neon-green)]"),
      )}
    >
      {cell.value}
    </button>
  );
}
