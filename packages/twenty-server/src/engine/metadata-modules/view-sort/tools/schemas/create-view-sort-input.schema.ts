import { ViewSortDirection } from 'twenty-shared/types';
import { z } from 'zod';

export const createViewSortInputSchema = z.object({
  viewId: z.string().uuid().describe('ID of the view to add the sort to'),
  fieldMetadataId: z
    .uuid()
    .describe(
      'ID of the field to sort by. Use get_field_metadata to find field IDs.',
    ),
  direction: z
    .enum(ViewSortDirection)
    .default(ViewSortDirection.ASC)
    .describe('Sort direction: ASC (ascending) or DESC (descending)'),
});
