/* @license Enterprise */

import { isDefined } from 'twenty-shared/utils';

import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';
import { computeMorphOrRelationFieldJoinColumnName } from 'src/engine/metadata-modules/field-metadata/utils/compute-morph-or-relation-field-join-column-name.util';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { isMorphOrRelationFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-morph-or-relation-flat-field-metadata.util';
import {
  PermissionsException,
  PermissionsExceptionCode,
} from 'src/engine/permissions/permissions.exception';

const findJoinColumnName = (
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

export const findRelationJoinColumnsOrThrow = ({
  relationFieldMetadata,
  flatFieldMetadataMaps,
}: {
  relationFieldMetadata: OrmFlatFieldMetadata;
  flatFieldMetadataMaps: FlatEntityMaps<OrmFlatFieldMetadata>;
}): { sourceColumnName: string; targetColumnName: string } => {
  const isManyToOne =
    isMorphOrRelationFlatFieldMetadata(relationFieldMetadata) &&
    relationFieldMetadata.settings?.relationType === RelationType.MANY_TO_ONE;
  const joinColumnFieldMetadata = isManyToOne
    ? relationFieldMetadata
    : findFlatEntityByIdInFlatEntityMaps({
        flatEntityId: relationFieldMetadata.relationTargetFieldMetadataId ?? '',
        flatEntityMaps: flatFieldMetadataMaps,
      });
  const joinColumnName = isDefined(joinColumnFieldMetadata)
    ? findJoinColumnName(joinColumnFieldMetadata)
    : null;

  if (!isDefined(joinColumnName)) {
    throw new PermissionsException(
      `Cannot find the join column of relation "${relationFieldMetadata.name}"`,
      PermissionsExceptionCode.RLS_PREDICATE_FIELD_NOT_FOUND,
    );
  }

  return isManyToOne
    ? { sourceColumnName: joinColumnName, targetColumnName: 'id' }
    : { sourceColumnName: 'id', targetColumnName: joinColumnName };
};
