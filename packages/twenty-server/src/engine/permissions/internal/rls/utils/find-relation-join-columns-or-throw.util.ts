/* @license Enterprise */

import { isDefined } from 'twenty-shared/utils';

import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { isMorphOrRelationFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-morph-or-relation-flat-field-metadata.util';
import {
  PermissionsException,
  PermissionsExceptionCode,
} from 'src/engine/permissions/permissions.exception';
import { findRelationJoinColumnName } from 'src/engine/permissions/internal/rls/utils/find-relation-join-column-name.util';

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
    ? findRelationJoinColumnName(joinColumnFieldMetadata)
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
