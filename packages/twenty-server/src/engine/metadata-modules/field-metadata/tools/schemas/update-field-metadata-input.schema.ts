import { z } from 'zod';

import {
  fieldMetadataDefaultValueInputSchema,
  fieldMetadataOptionsInputSchema,
  fieldMetadataSettingsInputSchema,
} from 'src/engine/metadata-modules/field-metadata/tools/schemas/field-metadata-configuration-input.schema';

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
  defaultValue: fieldMetadataDefaultValueInputSchema,
  options: fieldMetadataOptionsInputSchema,
  settings: fieldMetadataSettingsInputSchema,
  isLabelSyncedWithName: z
    .boolean()
    .optional()
    .describe('Sync label with name'),
});
