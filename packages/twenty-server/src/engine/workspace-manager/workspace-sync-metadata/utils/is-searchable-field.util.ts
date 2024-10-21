import { FieldMetadataType } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';

const SEARCHABLE_FIELD_TYPES = [
  FieldMetadataType.TEXT,
  FieldMetadataType.FULL_NAME,
  FieldMetadataType.EMAILS,
  FieldMetadataType.ADDRESS,
  FieldMetadataType.LINKS,
] as const;

export type SearchableFieldType = (typeof SEARCHABLE_FIELD_TYPES)[number];

export const isSearchableFieldType = (
  type: FieldMetadataType,
): type is SearchableFieldType => {
  return SEARCHABLE_FIELD_TYPES.includes(type as SearchableFieldType);
};
