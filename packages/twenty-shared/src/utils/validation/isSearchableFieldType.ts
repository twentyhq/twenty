import { FieldMetadataType } from '@/types';

// UUID has no fuzzy full-text value, but it is kept here because an object's label
// identifier can be a UUID (see LABEL_IDENTIFIER_FIELD_METADATA_TYPES) and the search
// vector is built from the label identifier. Excluding it would leave records whose
// displayed identifier is a UUID unfindable (even by pasting their full id). In practice
// the only UUID ever fed into a search vector is the label identifier itself.
const SEARCHABLE_FIELD_TYPES = [
  FieldMetadataType.TEXT,
  FieldMetadataType.FULL_NAME,
  FieldMetadataType.EMAILS,
  FieldMetadataType.ADDRESS,
  FieldMetadataType.LINKS,
  FieldMetadataType.PHONES,
  FieldMetadataType.RICH_TEXT,
  FieldMetadataType.UUID,
] as const;

export type SearchableFieldType = (typeof SEARCHABLE_FIELD_TYPES)[number];

export const isSearchableFieldType = (
  type: FieldMetadataType,
): type is SearchableFieldType => {
  return SEARCHABLE_FIELD_TYPES.includes(type as SearchableFieldType);
};
