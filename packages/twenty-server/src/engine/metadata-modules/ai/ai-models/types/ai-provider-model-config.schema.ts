import { z } from 'zod';

import { AI_MODEL_EFFORTS, DATA_RESIDENCY_KEYS } from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';

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
    // Keyed by effort so a pinned variant carries the reading taken at its own
    // effort instead of the base model's ceiling.
    benchmarkByEffort: z
      .partialRecord(z.enum(AI_MODEL_EFFORTS), aiModelBenchmarkSchema)
      .optional(),
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
  )
  .superRefine((model, context) => {
    // A variant reads this map by its own effort, so a reading filed under
    // another effort's key, or under an effort no variant can pin, would hand
    // it a figure measured elsewhere.
    for (const [effort, reading] of Object.entries(
      model.benchmarkByEffort ?? {},
    )) {
      if (!(model.efforts ?? []).some((declared) => declared === effort)) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: `benchmarkByEffort.${effort} scores an effort the model does not declare`,
          path: ['benchmarkByEffort', effort],
        });
      }

      if (isDefined(reading?.effort) && reading.effort !== effort) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: `benchmarkByEffort.${effort} carries a reading measured at ${reading.effort}`,
          path: ['benchmarkByEffort', effort, 'effort'],
        });
      }
    }
  });
