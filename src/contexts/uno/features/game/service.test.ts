import { DomainError } from "@/shared/errors";
import type { Card, CardColor, GameState } from "./model";
import {
  canPlay,
  chooseAiCard,
  chooseAiColor,
  createDeck,
  drawAndPass,
  drawCards,
  initGame,
  isValidPlay,
  playCard,
  runAiTurn,
  shuffleDeck,
} from "./service";

function makeState(overrides: Partial<GameState> = {}): GameState {
  const deck = createDeck().slice(20);
  return {
    deck,
    discardPile: [{ id: "top", color: "red", value: "5" }],
    hands: {
      human: [
        { id: "h1", color: "red", value: "7" },
        { id: "h2", color: "blue", value: "3" },
      ],
      ai: [
        { id: "a1", color: "green", value: "5" },
        { id: "a2", color: "yellow", value: "2" },
      ],
    },
    currentPlayer: "human",
    direction: "clockwise",
    phase: "playing",
    currentColor: "red",
    pendingDraw: 0,
    winner: null,
    ...overrides,
  };
}

describe("createDeck", () => {
  it("returns 108 cards total", () => {
    // Arrange — nothing

    // Act
    const deck = createDeck();

    // Assert
    expect(deck).toHaveLength(108);
  });

  it("contains exactly 19 number cards per color (1 zero + 2 × 1-9)", () => {
    // Arrange
    const numberValues = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];

    // Act
    const deck = createDeck();
    const redNumbers = deck.filter(
      (c) => c.color === "red" && numberValues.includes(c.value),
    );

    // Assert
    expect(redNumbers).toHaveLength(19);
  });

  it("contains exactly 6 action cards per color (2 × skip/reverse/draw_two)", () => {
    // Arrange
    const actionValues = ["skip", "reverse", "draw_two"];

    // Act
    const deck = createDeck();
    const blueActions = deck.filter(
      (c) => c.color === "blue" && actionValues.includes(c.value),
    );

    // Assert
    expect(blueActions).toHaveLength(6);
  });

  it("contains exactly 8 wild cards (4 wild + 4 wild_draw_four)", () => {
    // Arrange — nothing

    // Act
    const deck = createDeck();
    const wilds = deck.filter((c) => c.color === "wild");

    // Assert
    expect(wilds).toHaveLength(8);
  });

  it("assigns a unique id to every card", () => {
    // Arrange — nothing

    // Act
    const deck = createDeck();
    const uniqueIds = new Set(deck.map((c) => c.id));

    // Assert
    expect(uniqueIds.size).toBe(108);
  });
});

describe("shuffleDeck", () => {
  it("preserves all cards (same ids, any order)", () => {
    // Arrange
    const deck = createDeck();
    const originalIds = new Set(deck.map((c) => c.id));

    // Act
    const shuffled = shuffleDeck(deck, () => 0.5);

    // Assert
    expect(shuffled).toHaveLength(deck.length);
    expect(new Set(shuffled.map((c) => c.id))).toEqual(originalIds);
  });

  it("does not mutate the original array", () => {
    // Arrange
    const deck = createDeck();
    const firstId = deck[0].id;

    // Act
    shuffleDeck(deck);

    // Assert
    expect(deck[0].id).toBe(firstId);
  });
});

describe("isValidPlay", () => {
  it("allows a card whose color matches the current color", () => {
    // Arrange
    const card: Card = { id: "1", color: "red", value: "5" };
    const topDiscard: Card = { id: "2", color: "blue", value: "3" };
    const currentColor: CardColor = "red";

    // Act
    const result = isValidPlay(card, topDiscard, currentColor);

    // Assert
    expect(result).toBe(true);
  });

  it("allows a card whose value matches the top-of-discard value", () => {
    // Arrange
    const card: Card = { id: "1", color: "green", value: "7" };
    const topDiscard: Card = { id: "2", color: "blue", value: "7" };
    const currentColor: CardColor = "blue";

    // Act
    const result = isValidPlay(card, topDiscard, currentColor);

    // Assert
    expect(result).toBe(true);
  });

  it("always allows a wild card regardless of discard", () => {
    // Arrange
    const card: Card = { id: "1", color: "wild", value: "wild" };
    const topDiscard: Card = { id: "2", color: "red", value: "9" };
    const currentColor: CardColor = "yellow";

    // Act
    const result = isValidPlay(card, topDiscard, currentColor);

    // Assert
    expect(result).toBe(true);
  });

  it("always allows a wild_draw_four card regardless of discard", () => {
    // Arrange
    const card: Card = { id: "1", color: "wild", value: "wild_draw_four" };
    const topDiscard: Card = { id: "2", color: "green", value: "skip" };
    const currentColor: CardColor = "green";

    // Act
    const result = isValidPlay(card, topDiscard, currentColor);

    // Assert
    expect(result).toBe(true);
  });

  it("rejects a card that matches neither color nor value", () => {
    // Arrange
    const card: Card = { id: "1", color: "green", value: "3" };
    const topDiscard: Card = { id: "2", color: "red", value: "7" };
    const currentColor: CardColor = "red";

    // Act
    const result = isValidPlay(card, topDiscard, currentColor);

    // Assert
    expect(result).toBe(false);
  });
});

describe("canPlay", () => {
  it("returns true when at least one card in the hand is valid", () => {
    // Arrange
    const hand: Card[] = [
      { id: "1", color: "green", value: "4" },
      { id: "2", color: "red", value: "5" },
    ];
    const topDiscard: Card = { id: "3", color: "red", value: "9" };

    // Act
    const result = canPlay(hand, topDiscard, "red");

    // Assert
    expect(result).toBe(true);
  });

  it("returns false when no card in the hand is valid", () => {
    // Arrange
    const hand: Card[] = [
      { id: "1", color: "green", value: "4" },
      { id: "2", color: "blue", value: "5" },
    ];
    const topDiscard: Card = { id: "3", color: "red", value: "9" };

    // Act
    const result = canPlay(hand, topDiscard, "red");

    // Assert
    expect(result).toBe(false);
  });
});

describe("chooseAiCard", () => {
  it("returns the first playable card in the hand", () => {
    // Arrange
    const hand: Card[] = [
      { id: "1", color: "blue", value: "7" },
      { id: "2", color: "red", value: "4" },
    ];
    const topDiscard: Card = { id: "0", color: "red", value: "3" };

    // Act
    const result = chooseAiCard(hand, topDiscard, "red");

    // Assert
    expect(result?.id).toBe("2");
  });

  it("returns null when no card in the hand is playable", () => {
    // Arrange
    const hand: Card[] = [
      { id: "1", color: "blue", value: "7" },
      { id: "2", color: "green", value: "5" },
    ];
    const topDiscard: Card = { id: "0", color: "red", value: "3" };

    // Act
    const result = chooseAiCard(hand, topDiscard, "red");

    // Assert
    expect(result).toBeNull();
  });
});

describe("chooseAiColor", () => {
  it("returns the most frequent non-wild color in the hand", () => {
    // Arrange
    const hand: Card[] = [
      { id: "1", color: "red", value: "1" },
      { id: "2", color: "red", value: "2" },
      { id: "3", color: "blue", value: "1" },
      { id: "4", color: "wild", value: "wild" },
    ];

    // Act
    const color = chooseAiColor(hand, "4");

    // Assert
    expect(color).toBe("red");
  });

  it("defaults to red when the hand contains only wilds", () => {
    // Arrange
    const hand: Card[] = [{ id: "1", color: "wild", value: "wild" }];

    // Act
    const color = chooseAiColor(hand, "1");

    // Assert
    expect(color).toBe("red");
  });
});

describe("drawCards", () => {
  it("adds the given number of cards to the specified player hand", () => {
    // Arrange
    const state = makeState();
    const before = state.hands.human.length;

    // Act
    const newState = drawCards(state, "human", 3);

    // Assert
    expect(newState.hands.human).toHaveLength(before + 3);
  });

  it("removes the drawn cards from the deck", () => {
    // Arrange
    const state = makeState();
    const deckBefore = state.deck.length;

    // Act
    const newState = drawCards(state, "human", 3);

    // Assert
    expect(newState.deck).toHaveLength(deckBefore - 3);
  });

  it("does not mutate the original state", () => {
    // Arrange
    const state = makeState();
    const originalHandLength = state.hands.human.length;

    // Act
    drawCards(state, "human", 2);

    // Assert
    expect(state.hands.human).toHaveLength(originalHandLength);
  });
});

describe("playCard", () => {
  it("removes the played card from the player hand", () => {
    // Arrange
    const state = makeState();
    const cardId = "h1";

    // Act
    const newState = playCard(state, cardId);

    // Assert
    expect(newState.hands.human.find((c) => c.id === cardId)).toBeUndefined();
  });

  it("places the played card on top of the discard pile", () => {
    // Arrange
    const state = makeState();
    const cardId = "h1";

    // Act
    const newState = playCard(state, cardId);

    // Assert
    expect(newState.discardPile[newState.discardPile.length - 1].id).toBe(cardId);
  });

  it("advances turn to AI after human plays a normal card", () => {
    // Arrange
    const state = makeState();

    // Act
    const newState = playCard(state, "h1");

    // Assert
    expect(newState.currentPlayer).toBe("ai");
  });

  it("keeps current player's turn after playing skip (2-player rule)", () => {
    // Arrange
    const state = makeState({
      hands: {
        human: [{ id: "h1", color: "red", value: "skip" }],
        ai: [{ id: "a1", color: "green", value: "5" }],
      },
    });

    // Act
    const newState = playCard(state, "h1");

    // Assert
    expect(newState.currentPlayer).toBe("human");
  });

  it("keeps current player's turn after playing reverse (2-player rule)", () => {
    // Arrange
    const state = makeState({
      hands: {
        human: [{ id: "h1", color: "red", value: "reverse" }],
        ai: [{ id: "a1", color: "green", value: "5" }],
      },
    });

    // Act
    const newState = playCard(state, "h1");

    // Assert
    expect(newState.currentPlayer).toBe("human");
  });

  it("sets pendingDraw to 2 and advances turn after draw_two", () => {
    // Arrange
    const state = makeState({
      hands: {
        human: [{ id: "h1", color: "red", value: "draw_two" }],
        ai: [{ id: "a1", color: "green", value: "5" }],
      },
    });

    // Act
    const newState = playCard(state, "h1");

    // Assert
    expect(newState.pendingDraw).toBe(2);
    expect(newState.currentPlayer).toBe("ai");
  });

  it("sets pendingDraw to 4 and advances turn after wild_draw_four", () => {
    // Arrange
    const state = makeState({
      hands: {
        human: [{ id: "h1", color: "wild", value: "wild_draw_four" }],
        ai: [{ id: "a1", color: "green", value: "5" }],
      },
    });

    // Act
    const newState = playCard(state, "h1", "blue");

    // Assert
    expect(newState.pendingDraw).toBe(4);
    expect(newState.currentPlayer).toBe("ai");
  });

  it("sets currentColor to the chosen color when playing a wild", () => {
    // Arrange
    const state = makeState({
      hands: {
        human: [{ id: "h1", color: "wild", value: "wild" }],
        ai: [{ id: "a1", color: "green", value: "5" }],
      },
    });

    // Act
    const newState = playCard(state, "h1", "blue");

    // Assert
    expect(newState.currentColor).toBe("blue");
  });

  it("throws DomainError when the card is not in the player hand", () => {
    // Arrange
    const state = makeState();

    // Act + Assert
    expect(() => playCard(state, "nonexistent")).toThrow(DomainError);
  });

  it("throws DomainError when the card is not valid to play", () => {
    // Arrange
    const state = makeState({
      hands: {
        human: [{ id: "h1", color: "blue", value: "3" }],
        ai: [{ id: "a1", color: "green", value: "5" }],
      },
    });

    // Act + Assert
    expect(() => playCard(state, "h1")).toThrow(DomainError);
  });

  it("throws DomainError for wild without a chosen color", () => {
    // Arrange
    const state = makeState({
      hands: {
        human: [{ id: "h1", color: "wild", value: "wild" }],
        ai: [{ id: "a1", color: "green", value: "5" }],
      },
    });

    // Act + Assert
    expect(() => playCard(state, "h1")).toThrow(DomainError);
  });

  it("sets phase to finished and records winner when player plays last card", () => {
    // Arrange
    const state = makeState({
      hands: {
        human: [{ id: "h1", color: "red", value: "7" }],
        ai: [{ id: "a1", color: "green", value: "5" }],
      },
    });

    // Act
    const newState = playCard(state, "h1");

    // Assert
    expect(newState.phase).toBe("finished");
    expect(newState.winner).toBe("human");
  });
});

describe("drawAndPass", () => {
  it("draws one card and advances turn when pendingDraw is 0", () => {
    // Arrange
    const state = makeState();
    const handBefore = state.hands.human.length;
    const deckBefore = state.deck.length;

    // Act
    const newState = drawAndPass(state);

    // Assert
    expect(newState.hands.human).toHaveLength(handBefore + 1);
    expect(newState.deck).toHaveLength(deckBefore - 1);
    expect(newState.currentPlayer).toBe("ai");
  });

  it("draws pendingDraw cards and resets pendingDraw to 0", () => {
    // Arrange
    const state = makeState({ pendingDraw: 2 });
    const handBefore = state.hands.human.length;

    // Act
    const newState = drawAndPass(state);

    // Assert
    expect(newState.hands.human).toHaveLength(handBefore + 2);
    expect(newState.pendingDraw).toBe(0);
    expect(newState.currentPlayer).toBe("ai");
  });
});

describe("initGame", () => {
  it("deals exactly 7 cards to each player", () => {
    // Arrange
    const seededRng = () => 0.5;

    // Act
    const state = initGame(seededRng);

    // Assert
    expect(state.hands.human).toHaveLength(7);
    expect(state.hands.ai).toHaveLength(7);
  });

  it("starts with a non-wild card on top of the discard pile", () => {
    // Arrange
    const seededRng = () => 0.5;

    // Act
    const state = initGame(seededRng);
    const topCard = state.discardPile[state.discardPile.length - 1];

    // Assert
    expect(topCard.color).not.toBe("wild");
  });

  it("sets the current player to human", () => {
    // Arrange + Act
    const state = initGame(() => 0.5);

    // Assert
    expect(state.currentPlayer).toBe("human");
  });

  it("starts with phase set to playing", () => {
    // Arrange + Act
    const state = initGame(() => 0.5);

    // Assert
    expect(state.phase).toBe("playing");
  });

  it("sets currentColor to match the top discard card color", () => {
    // Arrange + Act
    const state = initGame(() => 0.5);
    const topCard = state.discardPile[state.discardPile.length - 1];

    // Assert
    expect(state.currentColor).toBe(topCard.color);
  });
});

describe("runAiTurn", () => {
  it("plays a valid card from the AI hand and removes it", () => {
    // Arrange
    const state = makeState({
      currentPlayer: "ai",
      discardPile: [{ id: "top", color: "green", value: "5" }],
      currentColor: "green",
      hands: {
        human: [{ id: "h1", color: "red", value: "7" }],
        ai: [{ id: "a1", color: "green", value: "3" }],
      },
    });

    // Act
    const newState = runAiTurn(state);

    // Assert
    expect(newState.hands.ai.find((c) => c.id === "a1")).toBeUndefined();
  });

  it("draws a card and passes when AI has no valid play", () => {
    // Arrange
    const state = makeState({
      currentPlayer: "ai",
      discardPile: [{ id: "top", color: "green", value: "5" }],
      currentColor: "green",
      hands: {
        human: [{ id: "h1", color: "red", value: "7" }],
        ai: [
          { id: "a1", color: "red", value: "3" },
          { id: "a2", color: "blue", value: "1" },
        ],
      },
    });
    const aiHandBefore = state.hands.ai.length;

    // Act
    const newState = runAiTurn(state);

    // Assert
    expect(newState.hands.ai).toHaveLength(aiHandBefore + 1);
    expect(newState.currentPlayer).toBe("human");
  });

  it("draws the pending cards when forced (draw_two / wild_draw_four)", () => {
    // Arrange
    const state = makeState({
      currentPlayer: "ai",
      pendingDraw: 2,
    });
    const aiHandBefore = state.hands.ai.length;

    // Act
    const newState = runAiTurn(state);

    // Assert
    expect(newState.hands.ai).toHaveLength(aiHandBefore + 2);
    expect(newState.pendingDraw).toBe(0);
  });

  it("returns the same state reference when it is not the AI turn", () => {
    // Arrange
    const state = makeState({ currentPlayer: "human" });

    // Act
    const newState = runAiTurn(state);

    // Assert
    expect(newState).toBe(state);
  });
});
