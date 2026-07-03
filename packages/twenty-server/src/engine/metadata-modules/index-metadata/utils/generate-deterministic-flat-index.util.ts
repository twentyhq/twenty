import { getIndexUniversalIdentifier } from 'twenty-shared/application';

import { computeFlatIndexNameOrThrow } from 'src/engine/metadata-modules/index-metadata/utils/compute-flat-index-name.util';
import { type UniversalFlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-metadata.type';
import {
  type UniversalFlatIndexFieldMetadata,
  type UniversalFlatIndexMetadata,
} from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-index-metadata.type';
import { type UniversalFlatObjectMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-object-metadata.type';

type GenerateDeterministicFlatIndexArgs = {
  flatObjectMetadata: UniversalFlatObjectMetadata;
  objectFlatFieldMetadatas: UniversalFlatFieldMetadata[];
  flatIndex: Omit<
    UniversalFlatIndexMetadata,
    'name' | 'universalIdentifier' | 'universalFlatIndexFieldMetadatas'
  > & {
    universalFlatIndexFieldMetadatas: Omit<
      UniversalFlatIndexFieldMetadata,
      'indexMetadataUniversalIdentifier'
    >[];
  };
};

export const generateDeterministicFlatIndexMetadataOrThrow = ({
  flatObjectMetadata,
  objectFlatFieldMetadatas,
  flatIndex,
}: GenerateDeterministicFlatIndexArgs): UniversalFlatIndexMetadata => {
  const name = computeFlatIndexNameOrThrow({
    flatObjectMetadata,
    objectFlatFieldMetadatas,
    indexFields: flatIndex.universalFlatIndexFieldMetadatas,
    isUnique: flatIndex.isUnique,
    indexWhereClause: flatIndex.indexWhereClause,
  });

  const universalIdentifier = getIndexUniversalIdentifier({
    applicationUniversalIdentifier: flatIndex.applicationUniversalIdentifier,
    objectUniversalIdentifier: flatObjectMetadata.universalIdentifier,
    name,
  });

  return {
    ...flatIndex,
    name,
    universalIdentifier,
    universalFlatIndexFieldMetadatas:
      flatIndex.universalFlatIndexFieldMetadatas.map(
        (universalFlatIndexFieldMetadata) => ({
          ...universalFlatIndexFieldMetadata,
          indexMetadataUniversalIdentifier: universalIdentifier,
        }),
      ),
  };
};
