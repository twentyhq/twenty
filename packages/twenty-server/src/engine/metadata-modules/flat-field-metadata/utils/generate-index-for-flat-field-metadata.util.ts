import { v4 } from 'uuid';

import { IndexType } from 'src/engine/metadata-modules/index-metadata/types/indexType.types';
import { generateFlatIndexMetadataWithNameOrThrow } from 'src/engine/metadata-modules/index-metadata/utils/generate-flat-index.util';
import { type UniversalFlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-metadata.type';
import { type UniversalFlatIndexMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-index-metadata.type';
import { type UniversalFlatObjectMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-object-metadata.type';

type GenerateIndexForFlatFieldMetadataArgs = {
  flatFieldMetadata: UniversalFlatFieldMetadata;
  flatObjectMetadata: UniversalFlatObjectMetadata;
};

export const generateIndexForFlatFieldMetadata = ({
  flatFieldMetadata,
  flatObjectMetadata,
}: GenerateIndexForFlatFieldMetadataArgs): UniversalFlatIndexMetadata => {
  const indexMetadataUniversalIdentifier = v4();
  const createdAt = new Date().toISOString();

  const flatIndex: UniversalFlatIndexMetadata =
    generateFlatIndexMetadataWithNameOrThrow({
      objectFlatFieldMetadatas: [flatFieldMetadata],
      flatIndex: {
        createdAt,
        universalFlatIndexFieldMetadatas: [
          {
            createdAt,
            fieldMetadataUniversalIdentifier:
              flatFieldMetadata.universalIdentifier,
            indexMetadataUniversalIdentifier,
            order: 0,
            updatedAt: createdAt,
          },
        ],
        indexType: IndexType.BTREE,
        indexWhereClause: null,
        isCustom: true,
        isUnique: flatFieldMetadata.isUnique ?? false,
        objectMetadataUniversalIdentifier:
          flatObjectMetadata.universalIdentifier,
        universalIdentifier: indexMetadataUniversalIdentifier,
        updatedAt: createdAt,
        applicationUniversalIdentifier:
          flatFieldMetadata.applicationUniversalIdentifier,
      },
      flatObjectMetadata,
    });

  return flatIndex;
};
