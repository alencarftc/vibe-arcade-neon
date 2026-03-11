import type { Metadata } from "next";
import { ChessShell } from "@/contexts/chess";
import { GamePageHeader } from "@/shared/ui/GamePageHeader";

export const metadata: Metadata = {
  title: "Xadrez — Arcade Neon",
  description: "Jogue xadrez contra a IA com estilo neon.",
};

export default function XadrezPage() {
  return (
    <div className="min-h-dvh flex flex-col">
      <GamePageHeader title="Xadrez" accentColor="#b829dd" />
      <main className="flex-1 flex flex-col items-center justify-center py-4">
        <ChessShell />
      </main>
    </div>
  );
}
