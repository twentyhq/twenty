import { FieldMetadataType, RelationType } from 'twenty-shared/types';
import { z } from 'zod';

import { RELATION_TYPE_DESCRIPTION } from 'src/engine/metadata-modules/field-metadata/tools/constants/relation-type-description.constant';
import { SELECT_OPTIONS_DESCRIPTION } from 'src/engine/metadata-modules/field-metadata/tools/constants/select-options-description.constant';

const relationCreationPayloadSchema = z.object({
  type: z.nativeEnum(RelationType).describe(RELATION_TYPE_DESCRIPTION),
  targetObjectMetadataId: z.string().uuid().describe('Target object ID'),
  targetFieldLabel: z
    .string()
    .describe(
      'Display label of the inverse relation field created on the target object',
    ),
  targetFieldIcon: z
    .string()
    .optional()
    .describe(
      'Tabler icon name for the inverse field (e.g. IconBuildingSkyscraper). Falls back to the relation default.',
    ),
});

export const createFieldMetadataInputSchema = z.object({
  objectMetadataId: z.string().uuid().describe('Target object ID'),
  type: z.nativeEnum(FieldMetadataType).describe('Field type'),
  name: z.string().describe('Field name (camelCase)'),
  label: z.string().describe('Display label'),
  description: z.string().optional().describe('Description'),
  icon: z
    .string()
    .optional()
    .describe(
      'Tabler icon name, PascalCase with "Icon" prefix (e.g. IconCurrencyDollar, IconCalendarTime, IconPaw). Set one matching the field meaning; falls back to a type-based default.',
    ),
  isNullable: z.boolean().optional().describe('Nullable'),
  isUnique: z.boolean().optional().describe('Unique constraint'),
  defaultValue: z.unknown().optional().describe('Default value'),
  options: z.unknown().optional().describe(SELECT_OPTIONS_DESCRIPTION),
  settings: z.unknown().optional().describe('Field settings'),
  isLabelSyncedWithName: z
    .boolean()
    .optional()
    .describe('Sync label with name'),
  isRemoteCreation: z.boolean().optional().describe('Remote field creation'),
  relationCreationPayload: relationCreationPayloadSchema
    .optional()
    .describe(
      'Required when type is RELATION. Defines the relation direction and the inverse field created on the target object.',
    ),
});
