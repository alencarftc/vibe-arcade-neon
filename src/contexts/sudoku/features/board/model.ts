import { z } from "zod";

export const PositionSchema = z.object({
  row: z.number().int().min(0).max(8),
  col: z.number().int().min(0).max(8),
});
export type Position = z.infer<typeof PositionSchema>;

export const CellSchema = z.object({
  value: z.number().int().min(1).max(9).nullable(),
  isInitial: z.boolean(),
});
export type Cell = z.infer<typeof CellSchema>;

export type Board = Cell[][];
