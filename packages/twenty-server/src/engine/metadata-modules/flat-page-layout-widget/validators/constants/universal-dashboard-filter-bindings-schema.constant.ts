import { type UniversalDashboardFilterBinding } from 'twenty-shared/types';
import { z } from 'zod';

export const UNIVERSAL_DASHBOARD_FILTER_BINDINGS_SCHEMA = z.array(
  z.strictObject({
    pageLayoutFilterId: z.string(),
    fieldMetadataUniversalIdentifier: z.string().nullable(),
  }),
) satisfies z.ZodType<UniversalDashboardFilterBinding[]>;
