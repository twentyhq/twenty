import { z } from 'zod';

// Every figure here comes from Artificial Analysis, deliberately from one
// publisher: an index is only meaningful against models scored the same way, so
// a second source would have to replace these rather than fill their gaps.
export const aiModelBenchmarksSchema = z.object({
  intelligenceIndex: z.number().optional(),
  outputTokensPerSecond: z.number().positive().optional(),
  timeToFirstTokenSeconds: z.number().positive().optional(),
  costPerTask: z.number().positive().optional(),
  measuredAt: z.string().date(),
});
