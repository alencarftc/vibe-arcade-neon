import type { Board, Position } from "./model";

// --- Internal helpers (pure, zero framework imports) ---

function createEmptyGrid(): number[][] {
  return Array.from({ length: 9 }, () => Array<number>(9).fill(0));
}

function isValidPlacement(
  grid: number[][],
  row: number,
  col: number,
  num: number,
): boolean {
  for (let c = 0; c < 9; c++) {
    if (grid[row][c] === num) return false;
  }
  for (let r = 0; r < 9; r++) {
    if (grid[r][col] === num) return false;
  }
  const boxRow = Math.floor(row / 3) * 3;
  const boxCol = Math.floor(col / 3) * 3;
  for (let r = boxRow; r < boxRow + 3; r++) {
    for (let c = boxCol; c < boxCol + 3; c++) {
      if (grid[r][c] === num) return false;
    }
  }
  return true;
}

function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function solveGrid(grid: number[][]): boolean {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (grid[row][col] === 0) {
        const nums = shuffleArray([1, 2, 3, 4, 5, 6, 7, 8, 9]);
        for (const num of nums) {
          if (isValidPlacement(grid, row, col, num)) {
            grid[row][col] = num;
            if (solveGrid(grid)) return true;
            grid[row][col] = 0;
          }
        }
        return false;
      }
    }
  }
  return true;
}

function gridToBoard(
  grid: number[][],
  isInitialFn: (val: number) => boolean,
): Board {
  return grid.map((row) =>
    row.map((value) => ({
      value: value === 0 ? null : value,
      isInitial: isInitialFn(value),
    })),
  );
}

// --- Public API ---

export function generatePuzzle(cellsToRemove: number): {
  puzzle: Board;
  solution: Board;
} {
  const grid = createEmptyGrid();
  solveGrid(grid);

  const solution = gridToBoard(grid, () => true);

  const puzzleGrid = grid.map((row) => [...row]);
  const positions = shuffleArray(
    Array.from(
      { length: 81 },
      (_, i) => [Math.floor(i / 9), i % 9] as [number, number],
    ),
  );

  for (let i = 0; i < cellsToRemove && i < positions.length; i++) {
    const [r, c] = positions[i];
    puzzleGrid[r][c] = 0;
  }

  const puzzle = gridToBoard(puzzleGrid, (val) => val !== 0);

  return { puzzle, solution };
}

export function validateMove(
  board: Board,
  pos: Position,
  value: number,
): boolean {
  for (let c = 0; c < 9; c++) {
    if (c !== pos.col && board[pos.row][c].value === value) return false;
  }
  for (let r = 0; r < 9; r++) {
    if (r !== pos.row && board[r][pos.col].value === value) return false;
  }
  const boxRow = Math.floor(pos.row / 3) * 3;
  const boxCol = Math.floor(pos.col / 3) * 3;
  for (let r = boxRow; r < boxRow + 3; r++) {
    for (let c = boxCol; c < boxCol + 3; c++) {
      if ((r !== pos.row || c !== pos.col) && board[r][c].value === value) {
        return false;
      }
    }
  }
  return true;
}

export function isCorrectValue(
  solution: Board,
  pos: Position,
  value: number,
): boolean {
  return solution[pos.row][pos.col].value === value;
}

export function isSolved(board: Board, solution: Board): boolean {
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (board[r][c].value !== solution[r][c].value) return false;
    }
  }
  return true;
}

export function getHint(board: Board, solution: Board): Position | null {
  const candidates: Position[] = [];
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (
        board[r][c].value === null ||
        (!board[r][c].isInitial && board[r][c].value !== solution[r][c].value)
      ) {
        candidates.push({ row: r, col: c });
      }
    }
  }
  if (candidates.length === 0) return null;
  return candidates[Math.floor(Math.random() * candidates.length)];
}
