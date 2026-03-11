import { cn } from "@/shared/utils";
import type { Card } from "../model";
import { UnoCard } from "./UnoCard";

interface Props {
  cards: Card[];
  onPlay?: (cardId: string) => void;
  disabled?: boolean;
  faceDown?: boolean;
}

export function PlayerHand({ cards, onPlay, disabled, faceDown }: Props) {
  return (
    <div className="flex items-center justify-center gap-1 flex-wrap">
      {cards.map((card) => (
        <UnoCard
          key={card.id}
          card={card}
          faceDown={faceDown}
          small={faceDown}
          onClick={onPlay && !disabled ? () => onPlay(card.id) : undefined}
          disabled={disabled}
        />
      ))}
      {cards.length === 0 && (
        <span className={cn("font-display text-xs tracking-widest text-white/30 uppercase")}>
          Sem cartas
        </span>
      )}
    </div>
  );
}
