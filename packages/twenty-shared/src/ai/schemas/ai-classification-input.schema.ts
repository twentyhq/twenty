import { z } from 'zod';

export const aiClassificationInputSchema = z.object({
  modelId: z.string().trim().min(1),
  text: z.string().trim().min(1),
  instructions: z.string().trim().min(1),
  categories: z
    .array(
      z.object({
        label: z.string().trim().min(1),
        description: z.string(),
      }),
    )
    .min(2)
    .refine(
      (categories) =>
        new Set(categories.map(({ label }) => label)).size ===
        categories.length,
      'Category labels must be unique',
    ),
});

export type AiClassificationInput = z.infer<typeof aiClassificationInputSchema>;
