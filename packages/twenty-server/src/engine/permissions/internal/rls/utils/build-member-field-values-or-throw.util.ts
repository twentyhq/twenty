/* @license Enterprise */

import { type RowLevelPermissionPredicate } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { type RowLevelPermissionMemberFieldValues } from 'src/engine/permissions/internal/rls/types/row-level-permission-member-field-values.type';
import { type RowLevelPermissionWorkspaceMember } from 'src/engine/permissions/internal/rls/types/row-level-permission-workspace-member.type';
import { buildMemberFieldKey } from 'src/engine/permissions/internal/rls/utils/build-member-field-key.util';
import { resolveWorkspaceMemberPredicateValue } from 'src/engine/permissions/internal/rls/utils/resolve-workspace-member-predicate-value.util';
import {
  PermissionsException,
  PermissionsExceptionCode,
} from 'src/engine/permissions/permissions.exception';

export const buildMemberFieldValuesOrThrow = ({
  workspaceMember,
  predicates,
  flatFieldMetadataMaps,
}: {
  workspaceMember: RowLevelPermissionWorkspaceMember | undefined;
  predicates: Pick<
    RowLevelPermissionPredicate,
    'id' | 'workspaceMemberFieldMetadataId' | 'workspaceMemberSubFieldName'
  >[];
  flatFieldMetadataMaps: FlatEntityMaps<OrmFlatFieldMetadata>;
}): RowLevelPermissionMemberFieldValues => {
  const memberFieldValues: RowLevelPermissionMemberFieldValues = {};

  if (!isDefined(workspaceMember)) {
    return memberFieldValues;
  }

  for (const predicate of predicates) {
    const { workspaceMemberFieldMetadataId } = predicate;

    if (!isDefined(workspaceMemberFieldMetadataId)) {
      continue;
    }

    const workspaceMemberFieldMetadata = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: workspaceMemberFieldMetadataId,
      flatEntityMaps: flatFieldMetadataMaps,
    });

    if (!isDefined(workspaceMemberFieldMetadata)) {
      throw new PermissionsException(
        `Workspace member field metadata not found for row level predicate ${predicate.id}`,
        PermissionsExceptionCode.FIELD_METADATA_NOT_FOUND,
      );
    }

    memberFieldValues[buildMemberFieldKey(predicate)] =
      resolveWorkspaceMemberPredicateValue({
        workspaceMember,
        workspaceMemberFieldMetadata,
        workspaceMemberSubFieldName: predicate.workspaceMemberSubFieldName,
      });
  }

  return memberFieldValues;
};
