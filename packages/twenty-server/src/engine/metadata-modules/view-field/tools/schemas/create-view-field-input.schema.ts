import { AggregateOperations } from 'twenty-shared/types';
import { z } from 'zod';

import { viewFieldRelationScopeSchema } from 'src/engine/metadata-modules/view-field/tools/schemas/view-field-relation-scope.schema';

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
  isCanonical: z
    .boolean()
    .optional()
    .default(true)
    .describe(
      'False adds an extra column for a field the view already shows, e.g. to show a field of a related record.',
    ),
  relationTargetFieldMetadataId: z
    .uuid()
    .optional()
    .describe(
      'On an extra (non-canonical) column of a many-to-one relation field, or of a one-to-many relation field with a relationScope, show this field of the related records instead of the records. Must be a non-relation field of the related object.',
    ),
  relationScope: viewFieldRelationScopeSchema.optional(),
  label: z
    .string()
    .optional()
    .describe(
      'Column header shown instead of the default one. Leave it out to show the default header.',
    ),
});
