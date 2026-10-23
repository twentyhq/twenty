import { AggregateOperations } from 'twenty-shared/types';
import { z } from 'zod';

export const createViewFieldInputSchema = z.object({
  viewId: z.string().uuid().describe('The ID of the view to add the field to.'),
  fieldMetadataId: z
    .uuid()
    .describe(
      'The ID of the field metadata to add. Use get_field_metadata to find available fields.',
    ),
  isVisible: z
    .boolean()
    .optional()
    .default(true)
    .describe('Whether the field is visible in the view.'),
  size: z
    .number()
    .int()
    .optional()
    .default(150)
    .describe('Column width in pixels.'),
  position: z
    .number()
    .optional()
    .default(0)
    .describe('Position of the field in the view (0-based).'),
  aggregateOperation: z
    .enum(AggregateOperations)
    .optional()
    .describe(
      'Aggregate operation for this field (e.g., "SUM", "AVG", "COUNT").',
    ),
});
