import { type IndexMetadataRelationProperties } from 'src/engine/metadata-modules/flat-index-metadata/types/flat-index-metadata.type';

export const INDEX_METADATA_ENTITY_RELATION_PROPERTIES = [
  'objectMetadata',
  'indexFieldMetadatas',
] as const satisfies readonly IndexMetadataRelationProperties[];