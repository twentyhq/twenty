import { PageLayoutFilterType, ViewFilterOperand } from 'twenty-shared/types';
import { z } from 'zod';

export const PAGE_LAYOUT_FILTERS_SCHEMA = z.array(
  z.object({
    id: z.string(),
    label: z.string(),
    type: z.enum(PageLayoutFilterType),
    position: z.number(),
    defaultValue: z
      .object({
        conditions: z.array(
          z.object({
            operand: z.enum(ViewFilterOperand),
            value: z.string(),
          }),
        ),
      })
      .nullable(),
  }),
);
