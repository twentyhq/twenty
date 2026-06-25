import { getIndexUniversalIdentifier } from 'twenty-shared/application';

import { type IndexType } from 'src/engine/metadata-modules/index-metadata/types/indexType.types';
import {
  computeIndexName,
  type IndexFieldNameDescriptor,
} from 'src/engine/metadata-modules/index-metadata/utils/compute-index-name.util';
import { type UniversalFlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-metadata.type';
import { type UniversalFlatIndexMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-index-metadata.type';
import { type UniversalFlatObjectMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-object-metadata.type';

export const buildFlatIndexSideEffect = ({
  flatObjectMetadata,
  objectFlatFieldMetadatas,
  indexFieldDescriptors,
  indexType,
  isUnique,
  isCustom,
  indexWhereClause,
  applicationUniversalIdentifier,
}: {
  flatObjectMetadata: UniversalFlatObjectMetadata;
  objectFlatFieldMetadatas: UniversalFlatFieldMetadata[];
  indexFieldDescriptors: IndexFieldNameDescriptor[];
  indexType: IndexType;
  isUnique: boolean;
  isCustom: boolean;
  indexWhereClause: string | null;
  applicationUniversalIdentifier: string;
}): UniversalFlatIndexMetadata => {
  const name = computeIndexName({
    flatObjectMetadata,
    objectFlatFieldMetadatas,
    indexFieldDescriptors,
    isUnique,
    indexWhereClause,
  });

  const universalIdentifier = getIndexUniversalIdentifier({
    applicationUniversalIdentifier,
    objectUniversalIdentifier: flatObjectMetadata.universalIdentifier,
    name,
  });

  const createdAt = new Date().toISOString();

  return {
    name,
    universalIdentifier,
    indexType,
    isUnique,
    isCustom,
    indexWhereClause,
    isSystemSideEffect: true,
    objectMetadataUniversalIdentifier: flatObjectMetadata.universalIdentifier,
    applicationUniversalIdentifier,
    createdAt,
    updatedAt: createdAt,
    universalFlatIndexFieldMetadatas: indexFieldDescriptors.map(
      (indexFieldDescriptor) => ({
        fieldMetadataUniversalIdentifier:
          indexFieldDescriptor.fieldMetadataUniversalIdentifier,
        subFieldName: indexFieldDescriptor.subFieldName,
        order: indexFieldDescriptor.order,
        indexMetadataUniversalIdentifier: universalIdentifier,
        createdAt,
        updatedAt: createdAt,
      }),
    ),
  };
};
