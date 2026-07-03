import { IndexType } from 'src/engine/metadata-modules/index-metadata/types/indexType.types';
import { generateDeterministicFlatIndexMetadataOrThrow } from 'src/engine/metadata-modules/index-metadata/utils/generate-deterministic-flat-index.util';
import { type UniversalFlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-metadata.type';
import { type UniversalFlatIndexMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-index-metadata.type';
import { type UniversalFlatObjectMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-object-metadata.type';

type GenerateDeterministicIndexForFlatFieldMetadataOrThrowArgs = {
  flatFieldMetadata: UniversalFlatFieldMetadata;
  flatObjectMetadata: UniversalFlatObjectMetadata;
};

export const generateDeterministicIndexForFlatFieldMetadataOrThrow = ({
  flatFieldMetadata,
  flatObjectMetadata,
}: GenerateDeterministicIndexForFlatFieldMetadataOrThrowArgs): UniversalFlatIndexMetadata => {
  const createdAt = new Date().toISOString();

  return generateDeterministicFlatIndexMetadataOrThrow({
    flatObjectMetadata,
    objectFlatFieldMetadatas: [flatFieldMetadata],
    flatIndex: {
      createdAt,
      universalFlatIndexFieldMetadatas: [
        {
          createdAt,
          fieldMetadataUniversalIdentifier:
            flatFieldMetadata.universalIdentifier,
          order: 0,
          subFieldName: null,
          updatedAt: createdAt,
        },
      ],
      indexType: IndexType.BTREE,
      indexWhereClause: null,
      isCustom: true,
      isUnique: flatFieldMetadata.isUnique ?? false,
      isSystemSideEffect: true,
      objectMetadataUniversalIdentifier: flatObjectMetadata.universalIdentifier,
      updatedAt: createdAt,
      applicationUniversalIdentifier:
        flatFieldMetadata.applicationUniversalIdentifier,
    },
  });
};
