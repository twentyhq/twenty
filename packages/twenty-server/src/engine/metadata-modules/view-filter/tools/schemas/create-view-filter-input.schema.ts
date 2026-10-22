import { ViewFilterOperand } from 'twenty-shared/types';
import { z } from 'zod';

export const createViewFilterInputSchema = z.object({
  viewId: z.string().uuid().describe('ID of the view to add the filter to'),
  fieldMetadataId: z
    .string()
    .uuid()
    .describe(
      'ID of the field to filter on. Use get_field_metadata to find field IDs.',
    ),
  operand: z
    .enum(ViewFilterOperand)
    .describe(
      'Filter operator. Valid operators per field type — TEXT/EMAILS/FULL_NAME: CONTAINS, DOES_NOT_CONTAIN, IS_EMPTY, IS_NOT_EMPTY. NUMBER/NUMERIC: IS, IS_NOT, GREATER_THAN_OR_EQUAL, LESS_THAN_OR_EQUAL, IS_EMPTY, IS_NOT_EMPTY. CURRENCY: GREATER_THAN_OR_EQUAL, LESS_THAN_OR_EQUAL, IS_EMPTY, IS_NOT_EMPTY. DATE/DATE_TIME: IS, IS_RELATIVE, IS_IN_PAST, IS_IN_FUTURE, IS_TODAY, IS_BEFORE, IS_AFTER, IS_EMPTY, IS_NOT_EMPTY. SELECT: IS, IS_NOT, IS_EMPTY, IS_NOT_EMPTY. MULTI_SELECT/ARRAY: CONTAINS, DOES_NOT_CONTAIN, IS_EMPTY, IS_NOT_EMPTY. RELATION: IS, IS_NOT, IS_EMPTY, IS_NOT_EMPTY. BOOLEAN: IS.',
    ),
  value: z
    .union([
      z.string(),
      z.number(),
      z.boolean(),
      z.array(z.string()),
      z.record(z.string(), z.unknown()),
    ])
    .describe(
      'Filter value. Format depends on operand and field type: string for TEXT, array of option values for SELECT/MULTI_SELECT (e.g. ["OPTION_1", "OPTION_2"]), number for NUMBER/CURRENCY, empty string "" for IS_EMPTY/IS_NOT_EMPTY operators.',
    ),
  subFieldName: z
    .string()
    .optional()
    .describe(
      'Required for composite fields — e.g. "amountMicros" for CURRENCY, "addressCity" for ADDRESS, "firstName" or "lastName" for FULL_NAME.',
    ),
});
