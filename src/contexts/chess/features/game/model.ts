import { z } from "zod";

export const DifficultyLevelSchema = z.enum([
  "easy",
  "medium",
  "hard",
  "master",
]);
export type DifficultyLevel = z.infer<typeof DifficultyLevelSchema>;

export const PieceColorSchema = z.enum(["white", "black"]);
export type PieceColor = z.infer<typeof PieceColorSchema>;

export const GameStatusSchema = z.enum([
  "waiting",
  "playing",
  "check",
  "checkmate",
  "draw",
  "stalemate",
  "finished",
]);
export type GameStatus = z.infer<typeof GameStatusSchema>;

export const BoardSquareSchema = z.string().regex(/^[a-h][1-8]$/);
export type BoardSquare = z.infer<typeof BoardSquareSchema>;

export const PieceTypeSchema = z.enum(["p", "n", "b", "r", "q", "k"]);
export type PieceType = z.infer<typeof PieceTypeSchema>;

export const GameMoveSchema = z.object({
  from: BoardSquareSchema,
  to: BoardSquareSchema,
  piece: PieceTypeSchema,
  color: PieceColorSchema,
  san: z.string(),
  isCapture: z.boolean(),
  promotion: PieceTypeSchema.optional(),
  isCheck: z.boolean(),
  isCheckmate: z.boolean(),
});
export type GameMove = z.infer<typeof GameMoveSchema>;

export const ClockSchema = z.object({
  white: z.number().nonnegative(),
  black: z.number().nonnegative(),
  active: PieceColorSchema.nullable(),
});
export type Clock = z.infer<typeof ClockSchema>;

export const GameConfigSchema = z.object({
  difficulty: DifficultyLevelSchema,
  timePerPlayer: z.number().positive(),
});
export type GameConfig = z.infer<typeof GameConfigSchema>;

export const SKILL_LEVEL: Record<DifficultyLevel, number> = {
  easy: 3,
  medium: 8,
  hard: 15,
  master: 20,
};

export const DIFFICULTY_LABELS: Record<DifficultyLevel, string> = {
  easy: "Fácil",
  medium: "Médio",
  hard: "Difícil",
  master: "Mestre",
};

export const DIFFICULTY_DESCRIPTIONS: Record<DifficultyLevel, string> = {
  easy: "Ideal para aprender. A IA comete erros.",
  medium: "Jogo equilibrado. Bom para treino.",
  hard: "IA agressiva e precisa. Bom desafio.",
  master: "Nível máximo. Quase imbatível.",
};

export const PIECE_UNICODE: Record<PieceType, string> = {
  k: "♚",
  q: "♛",
  r: "♜",
  b: "♝",
  n: "♞",
  p: "♟",
};
