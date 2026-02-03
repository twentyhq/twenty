import { MetadataUniversalFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/metadata-universal-flat-entity.type';

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
    // TODO prastoin
    'labelIdentifierFieldMetadataUniversalIdentifier',
  ],
  standard: ['description', 'icon', 'isActive', 'labelPlural', 'labelSingular'],
} as const satisfies Record<
  'standard' | 'custom',
  (keyof MetadataUniversalFlatEntity<'objectMetadata'>)[]
>;
