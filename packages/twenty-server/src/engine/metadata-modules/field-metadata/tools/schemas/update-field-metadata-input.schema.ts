import { z } from 'zod';

import { SELECT_OPTIONS_DESCRIPTION } from 'src/engine/metadata-modules/field-metadata/tools/constants/select-options-description.constant';

export const updateFieldMetadataInputSchema = z.object({
  id: z.string().uuid().describe('Field ID'),
  name: z.string().optional().describe('Field name'),
  label: z.string().optional().describe('Display label'),
  description: z.string().optional().describe('Description'),
  icon: z
    .string()
    .optional()
    .describe('Tabler icon name (e.g. IconCurrencyDollar)'),
  isActive: z.boolean().optional().describe('Active state'),
  isNullable: z.boolean().optional().describe('Nullable'),
  isUnique: z.boolean().optional().describe('Unique constraint'),
  defaultValue: z.unknown().optional().describe('Default value'),
  options: z.unknown().optional().describe(SELECT_OPTIONS_DESCRIPTION),
  settings: z.unknown().optional().describe('Field settings'),
  isLabelSyncedWithName: z
    .boolean()
    .optional()
    .describe('Sync label with name'),
});
