import { type MetadataEntityPropertyName } from 'src/engine/metadata-modules/flat-entity/constant/all-entity-properties-configuration-by-metadata-name.constant';

export const FLAT_OBJECT_METADATA_EDITABLE_PROPERTIES = {
  custom: [
    'color',
    'openRecordIn',
    'description',
    'icon',
    'isActive',
    'isLabelSyncedWithName',
    'isSearchable',
    'labelPlural',
    'labelSingular',
    'namePlural',
    'nameSingular',
    'labelIdentifierFieldMetadataId',
    'imageIdentifierFieldMetadataId',
  ],
  standard: [
    'color',
    'openRecordIn',
    'description',
    'icon',
    'isActive',
    'isSearchable',
    'labelPlural',
    'labelSingular',
    'imageIdentifierFieldMetadataId',
  ],
} as const satisfies Record<
  'standard' | 'custom',
  MetadataEntityPropertyName<'objectMetadata'>[]
>;
