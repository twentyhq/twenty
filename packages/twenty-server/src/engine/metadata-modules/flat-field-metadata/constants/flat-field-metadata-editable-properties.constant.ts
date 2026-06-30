import { type MetadataEntityPropertyName } from 'src/engine/metadata-modules/flat-entity/constant/all-entity-properties-configuration-by-metadata-name.constant';

export const FLAT_FIELD_METADATA_EDITABLE_PROPERTIES = {
  custom: [
    'defaultValue',
    'description',
    'icon',
    'isActive',
    'isLabelSyncedWithName',
    'isUnique',
    'label',
    'name',
    'options',
    'settings',
  ],
  standard: [
    'defaultValue',
    'description',
    'icon',
    'isActive',
    'label',
    'options',
    'settings',
    'isUnique',
  ],
} as const satisfies Record<
  'standard' | 'custom',
  MetadataEntityPropertyName<'fieldMetadata'>[]
>;
