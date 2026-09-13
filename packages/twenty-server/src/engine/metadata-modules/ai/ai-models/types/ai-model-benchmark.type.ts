import { z } from 'zod';

import { aiModelBenchmarkSchema } from 'src/engine/metadata-modules/ai/ai-models/types/ai-model-benchmark.schema';

export type AiModelBenchmark = z.infer<typeof aiModelBenchmarkSchema>;
