import { IndexType } from 'src/engine/metadata-modules/index-metadata/types/indexType.types';
import { generateDeterministicFlatIndexMetadataOrThrow } from 'src/engine/metadata-modules/index-metadata/utils/generate-deterministic-flat-index.util';
import { type UniversalFlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-metadata.type';
import { type UniversalFlatIndexMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-index-metadata.type';
import { type UniversalFlatObjectMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-object-metadata.type';

export const buildSearchVectorGinIndexForCustomObject = ({
  flatObjectMetadata,
  searchVectorFlatFieldMetadata,
}: {
  flatObjectMetadata: UniversalFlatObjectMetadata;
  searchVectorFlatFieldMetadata: UniversalFlatFieldMetadata;
}): UniversalFlatIndexMetadata => {
  const createdAt = new Date().toISOString();

  return generateDeterministicFlatIndexMetadataOrThrow({
    objectFlatFieldMetadatas: [searchVectorFlatFieldMetadata],
    flatIndex: {
      createdAt,
      universalFlatIndexFieldMetadatas: [
        {
          createdAt,
          fieldMetadataUniversalIdentifier:
            searchVectorFlatFieldMetadata.universalIdentifier,
          order: 0,
          subFieldName: null,
          updatedAt: createdAt,
        },
      ],
      indexType: IndexType.GIN,
      indexWhereClause: null,
      isCustom: false,
      isUnique: false,
      isSystemSideEffect: true,
      objectMetadataUniversalIdentifier: flatObjectMetadata.universalIdentifier,
      updatedAt: createdAt,
      applicationUniversalIdentifier:
        flatObjectMetadata.applicationUniversalIdentifier,
    },
    flatObjectMetadata,
  });
};
