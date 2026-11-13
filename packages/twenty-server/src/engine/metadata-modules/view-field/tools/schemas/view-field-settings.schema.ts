import { QUERY_MAX_RECORDS_FROM_RELATION } from 'twenty-shared/constants';
import { IDENTIFIER_MAX_CHAR_LENGTH } from 'twenty-shared/metadata';
import { z } from 'zod';

export const viewFieldSettingsSchema = z
  .object({
    label: z
      .string()
      .min(1)
      .max(IDENTIFIER_MAX_CHAR_LENGTH)
      .nullable()
      .optional()
      .describe(
        'Column name shown in this view instead of the field label. Null restores the field label.',
      ),
    recordLimit: z
      .number()
      .int()
      .min(1)
      .max(QUERY_MAX_RECORDS_FROM_RELATION)
      .nullable()
      .optional()
      .describe(
        'Maximum number of related records shown in the cell. Only for one-to-many relation fields.',
      ),
  })
  .describe(
    'Display settings for an extra (non-canonical) column. Must be null on canonical columns.',
  );
