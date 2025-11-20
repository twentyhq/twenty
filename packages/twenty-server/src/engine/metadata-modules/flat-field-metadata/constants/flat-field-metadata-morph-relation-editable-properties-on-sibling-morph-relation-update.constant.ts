import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';

export const FLAT_FIELD_METADATA_MORPH_RELATION_EDITABLE_PROPERTIES_ON_SIBLING_MORPH_RELATION_UPDATE_CONSTANT =
  {
    custom: [
      'defaultValue',
      'description',
      'icon',
      'isActive',
      'isLabelSyncedWithName',
      'isUnique',
      'label',
      'options',
    ],
    standard: [
      'defaultValue',
      'description',
      'icon',
      'isActive',
      'label',
      'options',
    ],
  } as const satisfies Record<
    'standard' | 'custom',
    (keyof FlatFieldMetadata)[]
  >;
