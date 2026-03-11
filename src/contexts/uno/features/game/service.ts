import { DomainError } from "@/shared/errors";
import type { Card, CardColor, CardValue, GameState, PlayerSeat } from "./model";
import { STARTING_HAND_SIZE } from "./model";

export function createDeck(): Card[] {
  const cards: Card[] = [];
  let id = 0;
  const colors = ["red", "blue", "green", "yellow"] as const;

  for (const color of colors) {
    cards.push({ id: String(id++), color, value: "0" });
    for (let n = 1; n <= 9; n++) {
      const v = String(n) as CardValue;
      cards.push({ id: String(id++), color, value: v });
      cards.push({ id: String(id++), color, value: v });
    }
    for (const value of ["skip", "reverse", "draw_two"] as const) {
      cards.push({ id: String(id++), color, value });
      cards.push({ id: String(id++), color, value });
    }
  }

  for (let i = 0; i < 4; i++) {
    cards.push({ id: String(id++), color: "wild", value: "wild" });
    cards.push({ id: String(id++), color: "wild", value: "wild_draw_four" });
  }

  return cards;
}

export function shuffleDeck(deck: Card[], rng: () => number = Math.random): Card[] {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function isValidPlay(card: Card, topDiscard: Card, currentColor: CardColor): boolean {
  if (card.color === "wild") return true;
  if (card.color === currentColor) return true;
  if (card.value === topDiscard.value) return true;
  return false;
}

export function canPlay(hand: Card[], topDiscard: Card, currentColor: CardColor): boolean {
  return hand.some((card) => isValidPlay(card, topDiscard, currentColor));
}

export function chooseAiColor(hand: Card[], excludeCardId: string): CardColor {
  const counts: Record<string, number> = { red: 0, blue: 0, green: 0, yellow: 0 };
  for (const card of hand) {
    if (card.id !== excludeCardId && card.color !== "wild") {
      counts[card.color] = (counts[card.color] ?? 0) + 1;
    }
  }
  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  return (sorted[0]?.[0] as CardColor) ?? "red";
}

export function chooseAiCard(hand: Card[], topDiscard: Card, currentColor: CardColor): Card | null {
  return hand.find((card) => isValidPlay(card, topDiscard, currentColor)) ?? null;
}

function nextPlayer(current: PlayerSeat): PlayerSeat {
  return current === "human" ? "ai" : "human";
}

function replenishDeck(state: GameState): GameState {
  if (state.deck.length > 0) return state;
  if (state.discardPile.length <= 1) return state;
  const reversed = [...state.discardPile].reverse();
  const [top, ...rest] = reversed;
  const newDeck = shuffleDeck([...rest].reverse());
  return { ...state, deck: newDeck, discardPile: [top] };
}

function takeFromDeck(state: GameState, count: number): { cards: Card[]; state: GameState } {
  let current = replenishDeck(state);
  const taken: Card[] = [];
  for (let i = 0; i < count; i++) {
    if (current.deck.length === 0) break;
    const [card, ...rest] = current.deck;
    taken.push(card);
    current = { ...current, deck: rest };
  }
  return { cards: taken, state: current };
}

export function drawCards(state: GameState, player: PlayerSeat, count: number): GameState {
  const { cards, state: newState } = takeFromDeck(state, count);
  return {
    ...newState,
    hands: {
      ...newState.hands,
      [player]: [...newState.hands[player], ...cards],
    },
  };
}

export function initGame(rng: () => number = Math.random): GameState {
  const deck = shuffleDeck(createDeck(), rng);

  const humanHand = deck.slice(0, STARTING_HAND_SIZE);
  const aiHand = deck.slice(STARTING_HAND_SIZE, STARTING_HAND_SIZE * 2);
  let remaining = deck.slice(STARTING_HAND_SIZE * 2);

  let topIdx = remaining.findIndex((c) => c.color !== "wild");
  if (topIdx === -1) topIdx = 0;
  const topCard = remaining[topIdx];
  remaining = [...remaining.slice(0, topIdx), ...remaining.slice(topIdx + 1)];

  return {
    deck: remaining,
    discardPile: [topCard],
    hands: { human: humanHand, ai: aiHand },
    currentPlayer: "human",
    direction: "clockwise",
    phase: "playing",
    currentColor: topCard.color,
    pendingDraw: 0,
    winner: null,
  };
}

export function playCard(state: GameState, cardId: string, wildcardColor?: CardColor): GameState {
  if (state.phase !== "playing") {
    throw new DomainError("GAME_NOT_PLAYING", "O jogo não está em andamento.");
  }

  const hand = state.hands[state.currentPlayer];
  const cardIndex = hand.findIndex((c) => c.id === cardId);
  if (cardIndex === -1) {
    throw new DomainError("CARD_NOT_IN_HAND", "Carta não encontrada na mão.");
  }

  const card = hand[cardIndex];
  const topDiscard = state.discardPile[state.discardPile.length - 1];

  if (!isValidPlay(card, topDiscard, state.currentColor)) {
    throw new DomainError("INVALID_PLAY", "Jogada inválida.");
  }

  if ((card.value === "wild" || card.value === "wild_draw_four") && !wildcardColor) {
    throw new DomainError("WILDCARD_COLOR_REQUIRED", "Escolha uma cor para o curinga.");
  }

  const newHand = [...hand.slice(0, cardIndex), ...hand.slice(cardIndex + 1)];

  let newState: GameState = {
    ...state,
    hands: { ...state.hands, [state.currentPlayer]: newHand },
    discardPile: [...state.discardPile, card],
    currentColor: card.color === "wild" ? (wildcardColor ?? card.color) : card.color,
    pendingDraw: 0,
  };

  const other = nextPlayer(state.currentPlayer);

  switch (card.value) {
    case "skip":
    case "reverse":
      newState = { ...newState, currentPlayer: state.currentPlayer };
      if (newHand.length === 0) {
        return { ...newState, phase: "finished", winner: state.currentPlayer };
      }
      break;
    case "draw_two":
      newState = { ...newState, currentPlayer: other, pendingDraw: 2 };
      break;
    case "wild_draw_four":
      newState = { ...newState, currentColor: wildcardColor!, currentPlayer: other, pendingDraw: 4 };
      break;
    case "wild":
      newState = { ...newState, currentColor: wildcardColor!, currentPlayer: other };
      if (newHand.length === 0) {
        return { ...newState, phase: "finished", winner: state.currentPlayer };
      }
      break;
    default:
      newState = { ...newState, currentPlayer: other };
      if (newHand.length === 0) {
        return { ...newState, phase: "finished", winner: state.currentPlayer };
      }
      break;
  }

  return newState;
}

export function drawAndPass(state: GameState): GameState {
  if (state.phase !== "playing") return state;

  const count = state.pendingDraw > 0 ? state.pendingDraw : 1;
  const newState = drawCards(state, state.currentPlayer, count);

  return {
    ...newState,
    pendingDraw: 0,
    currentPlayer: nextPlayer(state.currentPlayer),
  };
}

export function runAiTurn(state: GameState): GameState {
  if (state.phase !== "playing" || state.currentPlayer !== "ai") return state;

  if (state.pendingDraw > 0) {
    return drawAndPass(state);
  }

  const hand = state.hands.ai;
  const topDiscard = state.discardPile[state.discardPile.length - 1];
  const cardToPlay = chooseAiCard(hand, topDiscard, state.currentColor);

  if (!cardToPlay) {
    return drawAndPass(state);
  }

  let wildcardColor: CardColor | undefined;
  if (cardToPlay.value === "wild" || cardToPlay.value === "wild_draw_four") {
    wildcardColor = chooseAiColor(hand, cardToPlay.id);
  }

  return playCard(state, cardToPlay.id, wildcardColor);
}

