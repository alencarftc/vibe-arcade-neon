import type { Metadata } from "next";
import { SudokuShell } from "@/contexts/sudoku";
import { GamePageHeader } from "@/shared/ui/GamePageHeader";

export const metadata: Metadata = {
  title: "Sudoku — Arcade Neon",
  description: "Jogue Sudoku com estilo neon.",
};

export default function SudokuPage() {
  return (
    <div className="min-h-dvh flex flex-col">
      <GamePageHeader title="Sudoku" accentColor="#00f0ff" />
      <main className="flex-1 flex flex-col items-center justify-center py-4">
        <SudokuShell />
      </main>
    </div>
  );
}
