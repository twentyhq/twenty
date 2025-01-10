import { FieldMetadataType } from 'twenty-shared';

const SEARCHABLE_FIELD_TYPES = [
  FieldMetadataType.TEXT,
  FieldMetadataType.FULL_NAME,
  FieldMetadataType.EMAILS,
  FieldMetadataType.ADDRESS,
  FieldMetadataType.LINKS,
  FieldMetadataType.RICH_TEXT,
] as const;

export type SearchableFieldType = (typeof SEARCHABLE_FIELD_TYPES)[number];

export const isSearchableFieldType = (
  type: FieldMetadataType,
): type is SearchableFieldType => {
  return SEARCHABLE_FIELD_TYPES.includes(type as SearchableFieldType);
};
