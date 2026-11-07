import {
  type PageLayoutFilterValue,
  ViewFilterOperand,
} from 'twenty-shared/types';
import { z } from 'zod';

export const PAGE_LAYOUT_FILTER_VALUE_SCHEMA = z.strictObject({
  conditions: z.array(
    z.strictObject({
      operand: z.enum(ViewFilterOperand),
      value: z.string(),
    }),
  ),
}) satisfies z.ZodType<PageLayoutFilterValue>;
