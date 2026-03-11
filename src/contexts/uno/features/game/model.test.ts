import { CardSchema, GameStateSchema } from "./model";

describe("CardSchema", () => {
  it("accepts a valid colored number card", () => {
    // Arrange
    const card = { id: "1", color: "red", value: "5" };

    // Act
    const result = CardSchema.safeParse(card);

    // Assert
    expect(result.success).toBe(true);
  });

  it("accepts a wild card", () => {
    // Arrange
    const card = { id: "1", color: "wild", value: "wild" };

    // Act
    const result = CardSchema.safeParse(card);

    // Assert
    expect(result.success).toBe(true);
  });

  it("accepts a wild_draw_four card", () => {
    // Arrange
    const card = { id: "1", color: "wild", value: "wild_draw_four" };

    // Act
    const result = CardSchema.safeParse(card);

    // Assert
    expect(result.success).toBe(true);
  });

  it("accepts all action card types", () => {
    // Arrange
    const actionCards = [
      { id: "1", color: "red", value: "skip" },
      { id: "2", color: "blue", value: "reverse" },
      { id: "3", color: "green", value: "draw_two" },
    ];

    // Act + Assert
    for (const card of actionCards) {
      expect(CardSchema.safeParse(card).success).toBe(true);
    }
  });

  it("rejects a card with an unknown color", () => {
    // Arrange
    const card = { id: "1", color: "purple", value: "5" };

    // Act
    const result = CardSchema.safeParse(card);

    // Assert
    expect(result.success).toBe(false);
  });

  it("rejects a card with a value above 9 (invalid number)", () => {
    // Arrange
    const card = { id: "1", color: "red", value: "10" };

    // Act
    const result = CardSchema.safeParse(card);

    // Assert
    expect(result.success).toBe(false);
  });

  it("rejects a card missing required fields", () => {
    // Arrange
    const card = { color: "red", value: "5" };

    // Act
    const result = CardSchema.safeParse(card);

    // Assert
    expect(result.success).toBe(false);
  });
});

describe("GameStateSchema", () => {
  it("accepts a valid minimal game state", () => {
    // Arrange
    const state = {
      deck: [],
      discardPile: [{ id: "top", color: "red", value: "5" }],
      hands: { human: [], ai: [] },
      currentPlayer: "human",
      direction: "clockwise",
      phase: "playing",
      currentColor: "red",
      pendingDraw: 0,
      winner: null,
    };

    // Act
    const result = GameStateSchema.safeParse(state);

    // Assert
    expect(result.success).toBe(true);
  });

  it("rejects a state with negative pendingDraw", () => {
    // Arrange
    const state = {
      deck: [],
      discardPile: [{ id: "top", color: "red", value: "5" }],
      hands: { human: [], ai: [] },
      currentPlayer: "human",
      direction: "clockwise",
      phase: "playing",
      currentColor: "red",
      pendingDraw: -1,
      winner: null,
    };

    // Act
    const result = GameStateSchema.safeParse(state);

    // Assert
    expect(result.success).toBe(false);
  });

  it("accepts a finished state with a winner", () => {
    // Arrange
    const state = {
      deck: [],
      discardPile: [{ id: "top", color: "red", value: "5" }],
      hands: { human: [], ai: [] },
      currentPlayer: "human",
      direction: "clockwise",
      phase: "finished",
      currentColor: "red",
      pendingDraw: 0,
      winner: "human",
    };

    // Act
    const result = GameStateSchema.safeParse(state);

    // Assert
    expect(result.success).toBe(true);
  });
});
