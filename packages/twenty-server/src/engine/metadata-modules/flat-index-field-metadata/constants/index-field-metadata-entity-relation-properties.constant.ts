import { type IndexFieldMetadataRelationProperties } from 'src/engine/metadata-modules/flat-index-field-metadata/types/flat-index-field-metadata.type';

export const INDEX_FIELD_METADATA_ENTITY_RELATION_PROPERTIES = [
  'indexMetadata',
  'fieldMetadata',
] as const satisfies readonly IndexFieldMetadataRelationProperties[];