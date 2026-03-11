import { Button } from "@/shared/ui";

interface ActionBarProps {
  onNewGame: () => void;
  onHint: () => void;
  onErase: () => void;
  disabled: boolean;
}

export function ActionBar({
  onNewGame,
  onHint,
  onErase,
  disabled,
}: ActionBarProps) {
  return (
    <div className="flex items-center justify-center gap-3">
      <Button onClick={onNewGame} variant="primary" size="sm">
        Nova partida
      </Button>
      <Button onClick={onHint} variant="ghost" size="sm" disabled={disabled}>
        Dica
      </Button>
      <Button onClick={onErase} variant="ghost" size="sm" disabled={disabled}>
        Apagar
      </Button>
    </div>
  );
}
