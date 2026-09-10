import { z } from 'zod';

// One publisher's reading of a model, taken on one date. An index is only
// meaningful against models scored the same way, so whoever fills this must use
// the same publisher throughout rather than filling gaps from a second. The
// generated catalog uses Artificial Analysis.
export const aiModelBenchmarkSchema = z.object({
  intelligenceIndex: z.number().optional(),
  outputTokensPerSecond: z.number().positive().optional(),
  costPerTask: z.number().positive().optional(),
  measuredAt: z.string().date(),
});
