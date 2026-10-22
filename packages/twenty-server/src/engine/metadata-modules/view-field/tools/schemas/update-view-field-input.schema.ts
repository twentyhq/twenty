import { AggregateOperations } from 'twenty-shared/types';
import { z } from 'zod';

export const updateViewFieldInputSchema = z.object({
  id: z
    .string()
    .uuid()
    .describe(
      'The ID of the view field to update. Obtain this from get_view_fields.',
    ),
  isVisible: z.boolean().optional().describe('Whether the field is visible.'),
  size: z.number().int().optional().describe('Column width in pixels.'),
  position: z.number().optional().describe('Position of the field.'),
  aggregateOperation: z
    .enum(AggregateOperations)
    .optional()
    .describe('Aggregate operation for this field.'),
});
