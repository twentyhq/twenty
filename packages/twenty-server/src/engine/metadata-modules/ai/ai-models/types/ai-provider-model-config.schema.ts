import { z } from 'zod';

import { AI_MODEL_EFFORTS, DATA_RESIDENCY_KEYS } from 'twenty-shared/ai';

import { AI_MODEL_KINDS } from 'src/engine/metadata-modules/ai/ai-models/constants/ai-model-kinds.const';
import { aiModelBenchmarkSchema } from 'src/engine/metadata-modules/ai/ai-models/types/ai-model-benchmark.schema';
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
    // In the provider's own vocabulary; a model without a list runs at the
    // provider default only.
    efforts: z.array(z.enum(AI_MODEL_EFFORTS)).nonempty().optional(),
    // Contractual per route rather than published anywhere, so an operator
    // declares them and undefined means unasserted, not false. One Bedrock
    // provider serves both eu.* and global.* models, hence per model.
    dataResidency: z.enum(DATA_RESIDENCY_KEYS).optional(),
    zeroDataRetention: z.boolean().optional(),
    benchmark: aiModelBenchmarkSchema.optional(),
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
