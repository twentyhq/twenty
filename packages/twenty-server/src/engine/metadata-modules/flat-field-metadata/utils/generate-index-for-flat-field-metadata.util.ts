import { v4 } from 'uuid';

import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatIndexMetadata } from 'src/engine/metadata-modules/flat-index-metadata/types/flat-index-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { IndexType } from 'src/engine/metadata-modules/index-metadata/types/indexType.types';
import { generateFlatIndexMetadataWithNameOrThrow } from 'src/engine/metadata-modules/index-metadata/utils/generate-flat-index.util';

type GenerateIndexForFlatFieldMetadataArgs = {
  flatFieldMetadata: FlatFieldMetadata;
  flatObjectMetadata: FlatObjectMetadata;
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
        universalIdentifier: indexId,
        updatedAt: createdAt,
        workspaceId,
        applicationId: flatFieldMetadata.applicationId,
      },
      flatObjectMetadata,
    },
  );

  return flatIndex;
};
