import { isNonEmptyString } from '@sniptt/guards';
import { isNonEmptyArray } from 'twenty-shared/utils';
import { RelationType } from 'twenty-shared/types';

import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { isMorphOrRelationFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-morph-or-relation-flat-field-metadata.util';
import { type FlatIndexMetadata } from 'src/engine/metadata-modules/flat-index-metadata/types/flat-index-metadata.type';

export const isIndexCreationDeferrable = ({
  flatIndexMetadata,
  indexedFlatFieldMetadatas,
}: {
  flatIndexMetadata: Pick<
    FlatIndexMetadata,
    'isUnique' | 'indexWhereClause' | 'flatIndexFieldMetadatas'
  >;
  indexedFlatFieldMetadatas: FlatFieldMetadata[];
}): boolean => {
  if (
    flatIndexMetadata.isUnique ||
    isNonEmptyString(flatIndexMetadata.indexWhereClause)
  ) {
    return false;
  }

  if (
    !isNonEmptyArray(indexedFlatFieldMetadatas) ||
    indexedFlatFieldMetadatas.length !==
      flatIndexMetadata.flatIndexFieldMetadatas.length
  ) {
    return false;
  }

  return indexedFlatFieldMetadatas.every(
    (flatFieldMetadata) =>
      isMorphOrRelationFlatFieldMetadata(flatFieldMetadata) &&
      flatFieldMetadata.settings?.relationType === RelationType.MANY_TO_ONE,
  );
};
