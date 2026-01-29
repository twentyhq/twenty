export const OBJECT_METADATA_TRANSLATABLE_PROPERTIES = [
  'labelSingular',
  'labelPlural',
  'description',
] as const;

export type ObjectMetadataTranslatableProperty =
  (typeof OBJECT_METADATA_TRANSLATABLE_PROPERTIES)[number];
