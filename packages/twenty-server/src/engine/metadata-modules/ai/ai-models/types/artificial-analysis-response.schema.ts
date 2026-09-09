import { z } from 'zod';

const benchmarkValueSchema = z.number().finite().nonnegative().nullish();

export const artificialAnalysisResponseSchema = z.object({
  intelligence_index_version: z.number().finite(),
  pagination: z.object({
    page: z.number().int().positive(),
    has_more: z.boolean(),
  }),
  data: z.array(
    z.object({
      id: z.string().min(1),
      name: z.string().min(1),
      slug: z.string().min(1),
      model_creator: z.object({ id: z.string(), name: z.string() }).nullish(),
      evaluations: z
        .object({
          artificial_analysis_intelligence_index: benchmarkValueSchema,
        })
        .nullish(),
      artificial_analysis_intelligence_index_cost: z
        .object({
          cost_per_task: z
            .object({ total_cost: benchmarkValueSchema })
            .nullish(),
        })
        .nullish(),
      performance: z
        .object({
          median_output_tokens_per_second: benchmarkValueSchema,
        })
        .nullish(),
    }),
  ),
});

export type ArtificialAnalysisModel = z.infer<
  typeof artificialAnalysisResponseSchema
>['data'][number];
