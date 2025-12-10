import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';

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
    //TODO :  uncomment once universal identifier on standard fields is migrated
    // 'isUnique', // not editable for standard fields with standard unique constraint
  ],
} as const satisfies Record<'standard' | 'custom', (keyof FlatFieldMetadata)[]>;
