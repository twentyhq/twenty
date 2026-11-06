import { z } from 'zod';

import { ViewSortDirection } from '../../types/ViewSortDirection';

export const recordSortSchema = z.object({
  id: z.string(),
  fieldMetadataId: z.string(),
  direction: z.enum(ViewSortDirection),
  subFieldName: z.string().nullable().optional(),
});
