import { z } from 'zod';

import { AI_MODEL_KINDS } from 'src/engine/metadata-modules/ai/ai-models/constants/ai-model-kinds.const';
import { ModelFamily } from 'src/engine/metadata-modules/ai/ai-models/types/model-family.enum';
import { longContextCostSchema } from 'src/engine/metadata-modules/ai/ai-models/types/long-context-cost.schema';

export const aiProviderModelConfigSchema = z
  .object({
    name: z.string(),
    label: z.string(),
    kind: z.enum(AI_MODEL_KINDS).optional(),
    description: z.string().optional(),
    modelFamily: z.nativeEnum(ModelFamily).optional(),
    costPerMinute: z.number().nonnegative().optional(),
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
  })
  .refine(
    (model) =>
      model.kind !== 'transcription' || model.costPerMinute !== undefined,
    {
      // An omitted price bills nothing while the provider still charges, so a
      // free model has to say so with an explicit 0.
      message: 'costPerMinute is required for transcription models',
      path: ['costPerMinute'],
    },
  );
