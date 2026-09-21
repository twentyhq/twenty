import { z } from 'zod';

import { AI_MODEL_EFFORTS } from 'twenty-shared/ai';

// One publisher's reading of a model, taken on one date. An index is only
// meaningful against models scored the same way, so whoever fills this must use
// the same publisher throughout rather than filling gaps from a second. The
// generated catalog uses Artificial Analysis.
export const aiModelBenchmarkSchema = z.object({
  intelligenceIndex: z.number().optional(),
  outputTokensPerSecond: z.number().positive().optional(),
  costPerTask: z.number().positive().optional(),
  // The publisher scores a model once per reasoning effort, so a reading is
  // only comparable with others taken at the same effort. Unset when the
  // publisher's row names none.
  effort: z.enum(AI_MODEL_EFFORTS).optional(),
  measuredAt: z.string().date(),
});
