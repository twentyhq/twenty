import {
  type PageLayoutFilter,
  PageLayoutFilterType,
  ViewFilterOperand,
} from 'twenty-shared/types';
import { z } from 'zod';

export const PAGE_LAYOUT_FILTERS_SCHEMA = z.array(
  z.strictObject({
    id: z.string(),
    label: z.string(),
    type: z.enum(PageLayoutFilterType),
    position: z.number(),
    defaultValue: z
      .strictObject({
        conditions: z.array(
          z.strictObject({
            operand: z.enum(ViewFilterOperand),
            value: z.string(),
          }),
        ),
      })
      .nullable(),
  }),
) satisfies z.ZodType<PageLayoutFilter[]>;
