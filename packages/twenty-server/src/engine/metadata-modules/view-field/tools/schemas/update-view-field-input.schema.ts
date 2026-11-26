import { AggregateOperations } from 'twenty-shared/types';
import { z } from 'zod';

import { viewFieldRelationScopeSchema } from 'src/engine/metadata-modules/view-field/tools/schemas/view-field-relation-scope.schema';

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
  relationTargetFieldMetadataId: z
    .uuid()
    .nullable()
    .optional()
    .describe(
      'On an extra (non-canonical) column of a many-to-one relation field, or of a one-to-many relation field with a relationScope, show this field of the related records instead of the records. Null shows the related records again.',
    ),
  relationScope: viewFieldRelationScopeSchema
    .nullable()
    .optional()
    .describe('Null shows every related record again.'),
  label: z
    .string()
    .nullable()
    .optional()
    .describe(
      'Column header shown instead of the default one. Null or an empty string shows the default header again.',
    ),
});
