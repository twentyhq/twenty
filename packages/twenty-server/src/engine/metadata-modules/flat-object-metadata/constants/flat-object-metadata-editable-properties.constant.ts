import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

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
  (keyof FlatObjectMetadata)[]
>;
