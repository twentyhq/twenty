import { z } from 'zod';

import { ViewSortDirection } from '../../types/ViewSortDirection';

export const recordSortSchema = z.object({
  fieldMetadataId: z.string(),
  direction: z.enum(ViewSortDirection),
  subFieldName: z.string().nullable().optional(),
});
