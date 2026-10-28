import { type FlatIndexMetadata } from 'src/engine/metadata-modules/flat-index-metadata/types/flat-index-metadata.type';
import { type IndexMetadataDTO } from 'src/engine/metadata-modules/index-metadata/dtos/index-metadata.dto';

export const fromFlatIndexMetadataToIndexMetadataDto = (
  flatIndexMetadata: FlatIndexMetadata,
): IndexMetadataDTO => {
  return {
    id: flatIndexMetadata.id,
    name: flatIndexMetadata.name,
    isUnique: flatIndexMetadata.isUnique,
    applicationId: flatIndexMetadata.applicationId,
    isSystemSideEffect: flatIndexMetadata.isSystemSideEffect,
    indexWhereClause: flatIndexMetadata.indexWhereClause ?? undefined,
    indexType: flatIndexMetadata.indexType,
    objectMetadataId: flatIndexMetadata.objectMetadataId,
    workspaceId: flatIndexMetadata.workspaceId,
    createdAt: new Date(flatIndexMetadata.createdAt),
    updatedAt: new Date(flatIndexMetadata.updatedAt),
  };
};
