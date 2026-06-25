import { IndexType } from 'src/engine/metadata-modules/index-metadata/types/indexType.types';
import { buildFlatIndexSideEffect } from 'src/engine/metadata-modules/index-metadata/utils/build-flat-index-side-effect.util';
import { type UniversalFlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-metadata.type';
import { type UniversalFlatIndexMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-index-metadata.type';
import { type UniversalFlatObjectMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-object-metadata.type';

export const buildDefaultIndexesForCustomObject = ({
  flatObjectMetadata,
  searchVectorFieldUniversalIdentifier,
  objectFlatFieldMetadatas,
}: {
  flatObjectMetadata: UniversalFlatObjectMetadata;
  objectFlatFieldMetadatas: UniversalFlatFieldMetadata[];
  searchVectorFieldUniversalIdentifier: string;
}) => {
  const tsVectorFlatIndex = buildFlatIndexSideEffect({
    flatObjectMetadata,
    objectFlatFieldMetadatas,
    indexFieldDescriptors: [
      {
        fieldMetadataUniversalIdentifier: searchVectorFieldUniversalIdentifier,
        subFieldName: null,
        order: 0,
      },
    ],
    indexType: IndexType.GIN,
    isUnique: false,
    isCustom: false,
    indexWhereClause: null,
    applicationUniversalIdentifier:
      flatObjectMetadata.applicationUniversalIdentifier,
  });

  return {
    indexes: {
      tsVectorFlatIndex,
    },
  } as const satisfies { indexes: Record<string, UniversalFlatIndexMetadata> };
};
