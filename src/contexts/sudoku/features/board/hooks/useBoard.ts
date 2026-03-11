import { useAtom, useAtomValue } from "jotai";
import type { Position } from "../model";
import { boardAtom, selectedCellAtom, solutionAtom } from "../store";

export function useBoard() {
  const board = useAtomValue(boardAtom);
  const solution = useAtomValue(solutionAtom);
  const [selectedCell, setSelectedCell] = useAtom(selectedCellAtom);

  function selectCell(pos: Position | null) {
    setSelectedCell(pos);
  }

  return { board, solution, selectedCell, selectCell };
}
