import { IndexType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { generateDeterministicFlatIndexMetadataOrThrow } from 'src/engine/metadata-modules/index-metadata/utils/generate-deterministic-flat-index.util';
import { type UniversalFlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-metadata.type';
import { type UniversalFlatIndexMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-index-metadata.type';
import { type UniversalFlatObjectMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-object-metadata.type';

export const POSITION_ID_INDEX_FIELD_NAMES = ['position', 'id'];

// Serves the default list order, position then id, without sorting the table.
// System objects are read through filters rather than browsed, so they skip it
export const buildPositionIdIndexForObject = ({
  flatObjectMetadata,
  objectFlatFieldMetadatas,
  now,
}: {
  flatObjectMetadata: UniversalFlatObjectMetadata;
  objectFlatFieldMetadatas: UniversalFlatFieldMetadata[];
  now: string;
}): UniversalFlatIndexMetadata | undefined => {
  const indexedFlatFieldMetadatas = POSITION_ID_INDEX_FIELD_NAMES.map(
    (fieldName) =>
      objectFlatFieldMetadatas.find(
        (flatFieldMetadata) => flatFieldMetadata.name === fieldName,
      ),
  );

  if (
    flatObjectMetadata.isRemote ||
    flatObjectMetadata.isSystem ||
    !indexedFlatFieldMetadatas.every(isDefined)
  ) {
    return undefined;
  }

  return generateDeterministicFlatIndexMetadataOrThrow({
    flatObjectMetadata,
    objectFlatFieldMetadatas: indexedFlatFieldMetadatas,
    flatIndex: {
      createdAt: now,
      updatedAt: now,
      universalFlatIndexFieldMetadatas: indexedFlatFieldMetadatas.map(
        ({ universalIdentifier }, order) => ({
          createdAt: now,
          updatedAt: now,
          fieldMetadataUniversalIdentifier: universalIdentifier,
          order,
          subFieldName: null,
        }),
      ),
      indexType: IndexType.BTREE,
      indexWhereClause: null,
      isCustom: false,
      isUnique: false,
      isSystemSideEffect: true,
      objectMetadataUniversalIdentifier: flatObjectMetadata.universalIdentifier,
      applicationUniversalIdentifier:
        flatObjectMetadata.applicationUniversalIdentifier,
    },
  });
};
