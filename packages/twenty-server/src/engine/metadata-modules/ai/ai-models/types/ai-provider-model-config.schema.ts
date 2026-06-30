import { z } from 'zod';

import { ModelFamily } from 'src/engine/metadata-modules/ai/ai-models/types/model-family.enum';
import { longContextCostSchema } from 'src/engine/metadata-modules/ai/ai-models/types/long-context-cost.schema';

export const aiProviderModelConfigSchema = z.object({
  name: z.string(),
  label: z.string(),
  description: z.string().optional(),
  modelFamily: z.nativeEnum(ModelFamily).optional(),
  inputCostPerMillionTokens: z.number().optional(),
  outputCostPerMillionTokens: z.number().optional(),
  cachedInputCostPerMillionTokens: z.number().optional(),
  cacheCreationCostPerMillionTokens: z.number().optional(),
  longContextCost: longContextCostSchema.optional(),
  contextWindowTokens: z.number().int().positive().optional(),
  maxOutputTokens: z.number().int().positive().optional(),
  modalities: z.array(z.string()).optional(),
  supportsReasoning: z.boolean().optional(),
  isDeprecated: z.boolean().optional(),
});
