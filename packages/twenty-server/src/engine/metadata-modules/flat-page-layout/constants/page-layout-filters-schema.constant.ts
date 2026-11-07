import {
  type PageLayoutFilter,
  PageLayoutFilterType,
} from 'twenty-shared/types';
import { z } from 'zod';

import { PAGE_LAYOUT_FILTER_VALUE_SCHEMA } from 'src/engine/metadata-modules/flat-page-layout/constants/page-layout-filter-value-schema.constant';

export const PAGE_LAYOUT_FILTERS_SCHEMA = z.array(
  z.strictObject({
    id: z.string(),
    label: z.string(),
    type: z.enum(PageLayoutFilterType),
    position: z.number(),
    defaultValue: PAGE_LAYOUT_FILTER_VALUE_SCHEMA.nullable(),
  }),
) satisfies z.ZodType<PageLayoutFilter[]>;
