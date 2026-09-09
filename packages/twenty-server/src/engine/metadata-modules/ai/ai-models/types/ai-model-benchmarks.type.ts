import { z } from 'zod';

import { aiModelBenchmarksSchema } from 'src/engine/metadata-modules/ai/ai-models/types/ai-model-benchmarks.schema';

export type BenchmarkSource = 'epoch-ai' | 'artificial-analysis';

export type AiModelBenchmarks = z.infer<typeof aiModelBenchmarksSchema>;
