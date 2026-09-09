import { z } from 'zod';

import { artificialAnalysisResponseSchema } from 'src/engine/metadata-modules/ai/ai-models/types/artificial-analysis-response.schema';

export const artificialAnalysisSnapshotSchema = z.object({
  schemaVersion: z.literal(1),
  fetchedAt: z.string().datetime(),
  intelligenceIndexVersion: z.number().finite().positive(),
  models: artificialAnalysisResponseSchema.shape.data
    .min(1)
    .refine(
      (models) =>
        new Set(models.map((model) => model.id)).size === models.length,
      'Duplicate benchmark model IDs',
    ),
});
