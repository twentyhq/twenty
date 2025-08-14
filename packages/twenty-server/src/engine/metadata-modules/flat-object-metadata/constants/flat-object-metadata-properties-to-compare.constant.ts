import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

export const FLAT_OBJECT_METADATA_PROPERTIES_TO_COMPARE = [
  'description',
  'icon',
  'isActive',
  'isLabelSyncedWithName',
  'labelPlural',
  'labelSingular',
  'namePlural',
  'nameSingular',
  'standardOverrides', // Only if standard
] as const satisfies (keyof FlatObjectMetadata)[];
