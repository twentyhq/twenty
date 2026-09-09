import { z } from 'zod';

export const BENCHMARK_SOURCES = ['epoch-ai', 'artificial-analysis'] as const;

export const aiModelBenchmarksSchema = z.object({
  // Epoch Capabilities Index, scaled so Claude 3.5 Sonnet is 130 and GPT-5 is
  // 150. Not a percentage and not comparable across index revisions.
  intelligenceIndex: z.number().optional(),
  outputTokensPerSecond: z.number().positive().optional(),
  timeToFirstTokenSeconds: z.number().nonnegative().optional(),
  costPerTask: z.number().nonnegative().optional(),
  sources: z.array(z.enum(BENCHMARK_SOURCES)).nonempty(),
  measuredAt: z.string(),
});
