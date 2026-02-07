import { v4 } from 'uuid';

import { type FlatIndexMetadata } from 'src/engine/metadata-modules/flat-index-metadata/types/flat-index-metadata.type';
import { IndexType } from 'src/engine/metadata-modules/index-metadata/types/indexType.types';
import { generateFlatIndexMetadataWithNameOrThrow } from 'src/engine/metadata-modules/index-metadata/utils/generate-flat-index.util';
import { UniversalFlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-metadata.type';
import { type UniversalFlatObjectMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-object-metadata.type';

type GenerateIndexForFlatFieldMetadataArgs = {
  flatFieldMetadata: UniversalFlatFieldMetadata;
  flatObjectMetadata: UniversalFlatObjectMetadata;
  workspaceId: string;
};

export const generateIndexForFlatFieldMetadata = ({
  flatFieldMetadata,
  flatObjectMetadata,
  workspaceId,
}: GenerateIndexForFlatFieldMetadataArgs): FlatIndexMetadata => {
  const indexId = v4();
  const createdAt = new Date().toISOString();

  const flatIndex: FlatIndexMetadata = generateFlatIndexMetadataWithNameOrThrow(
    {
      objectFlatFieldMetadatas: [flatFieldMetadata],
      flatIndex: {
        createdAt,
        flatIndexFieldMetadatas: [
          {
            createdAt,
            fieldMetadataId: flatFieldMetadata.id,
            id: v4(),
            indexMetadataId: indexId,
            order: 0,
            updatedAt: createdAt,
          },
        ],
        id: indexId,
        indexType: IndexType.BTREE,
        indexWhereClause: null,
        isCustom: true,
        isUnique: flatFieldMetadata.isUnique ?? false,
        objectMetadataId: flatObjectMetadata.id,
        objectMetadataUniversalIdentifier:
          flatObjectMetadata.universalIdentifier,
        universalIdentifier: indexId,
        updatedAt: createdAt,
        workspaceId,
        applicationId: flatFieldMetadata.applicationId,
        applicationUniversalIdentifier:
          flatFieldMetadata.applicationUniversalIdentifier,
      },
      flatObjectMetadata,
    },
  );

  return flatIndex;
};
