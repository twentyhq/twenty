/* @license Enterprise */

import { isDefined } from 'twenty-shared/utils';

import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';
import { computeMorphOrRelationFieldJoinColumnName } from 'src/engine/metadata-modules/field-metadata/utils/compute-morph-or-relation-field-join-column-name.util';
import { isCompositeFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/utils/is-composite-field-metadata-type.util';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { isMorphOrRelationFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-morph-or-relation-flat-field-metadata.util';

export const findWorkspaceMemberRelationColumnName = (
  flatFieldMetadata: OrmFlatFieldMetadata | undefined,
): string | null => {
  if (
    !isDefined(flatFieldMetadata) ||
    isCompositeFieldMetadataType(flatFieldMetadata.type)
  ) {
    return null;
  }

  if (!isMorphOrRelationFlatFieldMetadata(flatFieldMetadata)) {
    return flatFieldMetadata.name;
  }

  if (flatFieldMetadata.settings?.relationType !== RelationType.MANY_TO_ONE) {
    return null;
  }

  return (
    flatFieldMetadata.settings.joinColumnName ??
    computeMorphOrRelationFieldJoinColumnName({ name: flatFieldMetadata.name })
  );
};
