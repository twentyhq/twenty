import { z } from 'zod';

import { SELECT_OPTIONS_DESCRIPTION } from 'src/engine/metadata-modules/field-metadata/tools/constants/select-options-description.constant';

const fieldMetadataOptionInputSchema = z.looseObject({
  id: z.string().optional().describe('Option ID, keep it when updating'),
  label: z.string().describe('Display label'),
  value: z.string().describe('Stored value (SCREAMING_SNAKE_CASE)'),
  position: z.number().optional().describe('Position in the list'),
  color: z.string().nullable().optional().describe('Tag color'),
  isActive: z.boolean().optional().describe('Whether it can still be picked'),
});

export const fieldMetadataDefaultValueInputSchema = z
  .union([
    z.string(),
    z.number(),
    z.boolean(),
    z.array(z.unknown()),
    z.record(z.string(), z.unknown()),
    z.null(),
  ])
  .meta({ type: ['string', 'number', 'boolean', 'array', 'object', 'null'] })
  .optional()
  .describe(
    'Default value. Text and select values are quoted strings (e.g. "\'OPTION_A\'"), multi-select an array of them, composite fields an object of subfields.',
  );

export const fieldMetadataOptionsInputSchema = z
  .array(fieldMetadataOptionInputSchema)
  .nullable()
  .meta({ type: ['array', 'null'] })
  .optional()
  .describe(SELECT_OPTIONS_DESCRIPTION);

export const fieldMetadataSettingsInputSchema = z
  .record(z.string(), z.unknown())
  .nullable()
  .meta({ type: ['object', 'null'] })
  .optional()
  .describe('Field settings');
