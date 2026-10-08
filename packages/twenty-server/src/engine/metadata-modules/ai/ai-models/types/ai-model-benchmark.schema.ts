import { z } from 'zod';

import { AI_MODEL_EFFORTS } from 'twenty-shared/ai';

// indexes are only comparable from one publisher, so never fill gaps from a second (we use Artificial Analysis)
export const aiModelBenchmarkSchema = z.object({
  intelligenceIndex: z.number().optional(),
  outputTokensPerSecond: z.number().positive().optional(),
  costPerTask: z.number().positive().optional(),
  // readings are only comparable at the same effort
  effort: z.enum(AI_MODEL_EFFORTS).optional(),
  measuredAt: z.string().date(),
});
