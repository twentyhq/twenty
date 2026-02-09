import { type MetadataEntityPropertyName } from 'src/engine/metadata-modules/flat-entity/constant/all-entity-properties-configuration-by-metadata-name.constant';

export const FLAT_OBJECT_METADATA_EDITABLE_PROPERTIES = {
  custom: [
    'description',
    'icon',
    'isActive',
    'isLabelSyncedWithName',
    'labelPlural',
    'labelSingular',
    'namePlural',
    'nameSingular',
    'labelIdentifierFieldMetadataId',
  ],
  standard: ['description', 'icon', 'isActive', 'labelPlural', 'labelSingular'],
} as const satisfies Record<
  'standard' | 'custom',
  MetadataEntityPropertyName<'objectMetadata'>[]
>;
