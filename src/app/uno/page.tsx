import { GamePageHeader } from "@/shared/ui/GamePageHeader";
import { UnoShell } from "@/contexts/uno";

export const metadata = {
  title: "UNO — Arcade Neon",
  description: "Jogue UNO contra a IA.",
};

export default function UnoPage() {
  return (
    <div className="min-h-dvh flex flex-col bg-[#0a0a1a]">
      <GamePageHeader title="UNO" accentColor="#ff4444" />
      <main className="flex-1 flex flex-col">
        <UnoShell />
      </main>
    </div>
  );
}
