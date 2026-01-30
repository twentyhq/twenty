import { type ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';

export const OBJECT_METADATA_TRANSLATABLE_PROPERTIES = [
  'labelSingular',
  'labelPlural',
  'description',
] as const satisfies (keyof ObjectMetadataEntity)[];

export type ObjectMetadataTranslatableProperty =
  (typeof OBJECT_METADATA_TRANSLATABLE_PROPERTIES)[number];
