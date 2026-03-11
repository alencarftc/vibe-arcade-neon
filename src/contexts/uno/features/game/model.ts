import { z } from "zod";

export const CardColorSchema = z.enum(["red", "blue", "green", "yellow", "wild"]);
export type CardColor = z.infer<typeof CardColorSchema>;

export const PlayableColorSchema = z.enum(["red", "blue", "green", "yellow"]);
export type PlayableColor = z.infer<typeof PlayableColorSchema>;

export const CardValueSchema = z.enum([
  "0", "1", "2", "3", "4", "5", "6", "7", "8", "9",
  "skip", "reverse", "draw_two", "wild", "wild_draw_four",
]);
export type CardValue = z.infer<typeof CardValueSchema>;

export const CardSchema = z.object({
  id: z.string(),
  color: CardColorSchema,
  value: CardValueSchema,
});
export type Card = z.infer<typeof CardSchema>;

export const PlayerSeatSchema = z.enum(["human", "ai"]);
export type PlayerSeat = z.infer<typeof PlayerSeatSchema>;

export const GameDirectionSchema = z.enum(["clockwise", "counterclockwise"]);
export type GameDirection = z.infer<typeof GameDirectionSchema>;

export const GamePhaseSchema = z.enum(["idle", "playing", "finished"]);
export type GamePhase = z.infer<typeof GamePhaseSchema>;

export const GameStateSchema = z.object({
  deck: z.array(CardSchema),
  discardPile: z.array(CardSchema),
  hands: z.object({
    human: z.array(CardSchema),
    ai: z.array(CardSchema),
  }),
  currentPlayer: PlayerSeatSchema,
  direction: GameDirectionSchema,
  phase: GamePhaseSchema,
  currentColor: CardColorSchema,
  pendingDraw: z.number().int().nonnegative(),
  winner: PlayerSeatSchema.nullable(),
});
export type GameState = z.infer<typeof GameStateSchema>;

export const STARTING_HAND_SIZE = 7;

export const CARD_COLOR_LABEL: Record<CardColor, string> = {
  red: "Vermelho",
  blue: "Azul",
  green: "Verde",
  yellow: "Amarelo",
  wild: "Curinga",
};

export const CARD_VALUE_LABEL: Record<CardValue, string> = {
  "0": "0", "1": "1", "2": "2", "3": "3", "4": "4",
  "5": "5", "6": "6", "7": "7", "8": "8", "9": "9",
  skip: "Bloqueio",
  reverse: "Inverter",
  draw_two: "+2",
  wild: "Muda Cor",
  wild_draw_four: "+4",
};
