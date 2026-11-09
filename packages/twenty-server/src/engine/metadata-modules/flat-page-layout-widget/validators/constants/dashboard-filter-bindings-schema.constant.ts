import { type DashboardFilterBinding } from 'twenty-shared/types';
import { z } from 'zod';

// Not strict: the front sends the bindings back with their __typename
export const DASHBOARD_FILTER_BINDINGS_SCHEMA = z
  .array(
    z.object({
      pageLayoutFilterId: z.string(),
      fieldMetadataId: z.string().nullable(),
    }),
  )
  .nullish() satisfies z.ZodType<DashboardFilterBinding[] | null | undefined>;
