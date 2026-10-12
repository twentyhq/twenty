import { z } from 'zod';

import {
  AI_EVALUATION_QUESTION_TYPES,
  AI_MODEL_EFFORTS,
  DATA_RESIDENCY_KEYS,
} from 'twenty-shared/ai';
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
    // unset means the provider default only
    efforts: z.array(z.enum(AI_MODEL_EFFORTS)).nonempty().optional(),
    // contractual per route, so undefined means unasserted rather than false; per model since one Bedrock provider serves eu.* and global.*
    dataResidency: z.enum(DATA_RESIDENCY_KEYS).optional(),
    zeroDataRetention: z.boolean().optional(),
    benchmark: aiModelBenchmarkSchema.optional(),
    benchmarkByEffort: z
      .partialRecord(z.enum(AI_MODEL_EFFORTS), aiModelBenchmarkSchema)
      .optional(),
    supportedQuestionTypes: z
      .array(z.enum(AI_EVALUATION_QUESTION_TYPES))
      .nonempty()
      .optional(),
    maxCriteriaPerQuestion: z.number().int().positive().optional(),
    maxScoreLevels: z.number().int().min(2).optional(),
    medianLatencyMs: z.number().positive().optional(),
    isDeprecated: z.boolean().optional(),
  })
  .refine(
    (model) =>
      model.kind !== 'transcription' || model.costPerMinute !== undefined,
    {
      // an omitted price bills nothing while the provider still charges, so a free model states 0
      message: 'costPerMinute is required for transcription models',
      path: ['costPerMinute'],
    },
  )
  .refine(
    (model) =>
      model.kind !== 'evaluation' || model.supportedQuestionTypes !== undefined,
    {
      message: 'supportedQuestionTypes is required for evaluation models',
      path: ['supportedQuestionTypes'],
    },
  )
  .refine(
    (model) =>
      model.kind === 'evaluation' || model.supportedQuestionTypes === undefined,
    {
      message: 'supportedQuestionTypes is only valid on evaluation models',
      path: ['supportedQuestionTypes'],
    },
  )
  .refine(
    (model) =>
      model.kind !== 'evaluation' ||
      (model.inputCostPerMillionTokens !== undefined &&
        model.outputCostPerMillionTokens !== undefined),
    {
      // same rule as transcription models: an omitted price bills nothing, so free output states 0
      message:
        'inputCostPerMillionTokens and outputCostPerMillionTokens are required for evaluation models',
      path: ['inputCostPerMillionTokens'],
    },
  )
  .superRefine((model, context) => {
    // a variant reads this map by its own effort, so a misfiled reading would hand it a foreign figure
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
