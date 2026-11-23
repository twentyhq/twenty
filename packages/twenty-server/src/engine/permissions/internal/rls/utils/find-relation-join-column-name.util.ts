/* @license Enterprise */

import { computeMorphOrRelationFieldJoinColumnName } from 'src/engine/metadata-modules/field-metadata/utils/compute-morph-or-relation-field-join-column-name.util';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { isMorphOrRelationFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-morph-or-relation-flat-field-metadata.util';

export const findRelationJoinColumnName = (
  flatFieldMetadata: OrmFlatFieldMetadata,
): string | null => {
  if (!isMorphOrRelationFlatFieldMetadata(flatFieldMetadata)) {
    return null;
  }

  return (
    flatFieldMetadata.settings?.joinColumnName ??
    computeMorphOrRelationFieldJoinColumnName({ name: flatFieldMetadata.name })
  );
};
