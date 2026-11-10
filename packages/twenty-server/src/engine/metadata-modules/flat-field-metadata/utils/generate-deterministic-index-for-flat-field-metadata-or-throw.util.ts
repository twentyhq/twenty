import { IndexType } from 'twenty-shared/types';
import { NON_DELETED_RECORDS_INDEX_WHERE_CLAUSE } from 'src/engine/metadata-modules/index-metadata/constants/non-deleted-records-index-where-clause.constant';
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
  const isUnique = flatFieldMetadata.isUnique ?? false;

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
      indexWhereClause: isUnique
        ? NON_DELETED_RECORDS_INDEX_WHERE_CLAUSE
        : null,
      isUnique,
      isSystemSideEffect: true,
      objectMetadataUniversalIdentifier: flatObjectMetadata.universalIdentifier,
      updatedAt: createdAt,
      applicationUniversalIdentifier:
        flatFieldMetadata.applicationUniversalIdentifier,
    },
  });
};
