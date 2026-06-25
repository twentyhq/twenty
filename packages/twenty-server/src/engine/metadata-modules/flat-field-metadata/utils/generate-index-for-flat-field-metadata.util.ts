import { IndexType } from 'src/engine/metadata-modules/index-metadata/types/indexType.types';
import { buildFlatIndexSideEffect } from 'src/engine/metadata-modules/index-metadata/utils/build-flat-index-side-effect.util';
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
}: GenerateIndexForFlatFieldMetadataArgs): UniversalFlatIndexMetadata =>
  buildFlatIndexSideEffect({
    flatObjectMetadata,
    objectFlatFieldMetadatas: [flatFieldMetadata],
    indexFieldDescriptors: [
      {
        fieldMetadataUniversalIdentifier: flatFieldMetadata.universalIdentifier,
        subFieldName: null,
        order: 0,
      },
    ],
    indexType: IndexType.BTREE,
    isUnique: flatFieldMetadata.isUnique ?? false,
    isCustom: true,
    indexWhereClause: null,
    applicationUniversalIdentifier:
      flatFieldMetadata.applicationUniversalIdentifier,
  });
