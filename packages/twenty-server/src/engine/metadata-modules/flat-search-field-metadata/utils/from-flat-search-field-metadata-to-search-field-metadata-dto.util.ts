import { type FlatSearchFieldMetadata } from 'src/engine/metadata-modules/flat-search-field-metadata/types/flat-search-field-metadata.type';
import { type SearchFieldMetadataDTO } from 'src/engine/metadata-modules/search-field-metadata/dtos/search-field-metadata.dto';

export const fromFlatSearchFieldMetadataToSearchFieldMetadataDto = (
  flatSearchFieldMetadata: FlatSearchFieldMetadata,
): SearchFieldMetadataDTO => ({
  id: flatSearchFieldMetadata.id,
  objectMetadataId: flatSearchFieldMetadata.objectMetadataId,
  fieldMetadataId: flatSearchFieldMetadata.fieldMetadataId,
  tsVectorFieldMetadataId: flatSearchFieldMetadata.tsVectorFieldMetadataId,
  position: flatSearchFieldMetadata.position,
  createdAt: new Date(flatSearchFieldMetadata.createdAt),
  updatedAt: new Date(flatSearchFieldMetadata.updatedAt),
  workspaceId: flatSearchFieldMetadata.workspaceId,
});
