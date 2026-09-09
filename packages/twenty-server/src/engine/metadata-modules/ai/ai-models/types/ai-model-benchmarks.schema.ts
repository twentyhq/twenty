import { z } from 'zod';

// An index is only meaningful against models scored the same way, so whoever
// fills these must use one publisher throughout rather than filling gaps from a
// second. The generated catalog uses Artificial Analysis.
export const aiModelBenchmarksSchema = z.object({
  intelligenceIndex: z.number().optional(),
  outputTokensPerSecond: z.number().positive().optional(),
  timeToFirstTokenSeconds: z.number().positive().optional(),
  costPerTask: z.number().positive().optional(),
  measuredAt: z.string().date(),
});
