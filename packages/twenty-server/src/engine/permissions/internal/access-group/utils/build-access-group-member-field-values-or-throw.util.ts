/* @license Enterprise */

import { type RowLevelPermissionPredicate } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import {
  type AccessGroupMemberFieldValue,
  type AccessGroupMemberFieldValues,
} from 'src/engine/permissions/internal/access-group/types/access-group.type';
import {
  PermissionsException,
  PermissionsExceptionCode,
} from 'src/engine/permissions/permissions.exception';
import { type RowLevelPermissionWorkspaceMember } from 'src/engine/permissions/internal/rls/types/row-level-permission-workspace-member.type';
import { resolveWorkspaceMemberPredicateValue } from 'src/engine/permissions/internal/rls/utils/resolve-workspace-member-predicate-value.util';

const resolveMemberFieldValuesOrThrow = ({
  predicate,
  workspaceMember,
  flatFieldMetadataMaps,
}: {
  predicate: RowLevelPermissionPredicate;
  workspaceMember: RowLevelPermissionWorkspaceMember;
  flatFieldMetadataMaps: FlatEntityMaps<OrmFlatFieldMetadata>;
}): AccessGroupMemberFieldValue[] => {
  const workspaceMemberFieldMetadata = findFlatEntityByIdInFlatEntityMaps({
    flatEntityId: predicate.workspaceMemberFieldMetadataId ?? '',
    flatEntityMaps: flatFieldMetadataMaps,
  });

  if (!isDefined(workspaceMemberFieldMetadata)) {
    throw new PermissionsException(
      `Workspace member field metadata not found for row level predicate ${predicate.id}`,
      PermissionsExceptionCode.FIELD_METADATA_NOT_FOUND,
    );
  }

  const value = resolveWorkspaceMemberPredicateValue({
    workspaceMember,
    workspaceMemberFieldMetadata,
    workspaceMemberSubFieldName: predicate.workspaceMemberSubFieldName ?? null,
  });

  const values = Array.isArray(value) ? value : [value];

  return values.length > 0 ? values : [null];
};

export const buildAccessGroupMemberFieldValuesOrThrow = ({
  workspaceMemberBoundPredicates,
  workspaceMember,
  flatFieldMetadataMaps,
}: {
  workspaceMemberBoundPredicates: RowLevelPermissionPredicate[];
  workspaceMember: RowLevelPermissionWorkspaceMember;
  flatFieldMetadataMaps: FlatEntityMaps<OrmFlatFieldMetadata>;
}): AccessGroupMemberFieldValues[] => {
  let combinations: AccessGroupMemberFieldValues[] = [{}];

  for (const predicate of workspaceMemberBoundPredicates) {
    const memberFieldKey = `${predicate.workspaceMemberFieldMetadataId}:${predicate.workspaceMemberSubFieldName ?? ''}`;

    if (memberFieldKey in combinations[0]) {
      continue;
    }

    const memberFieldValues = resolveMemberFieldValuesOrThrow({
      predicate,
      workspaceMember,
      flatFieldMetadataMaps,
    });

    combinations = combinations.flatMap((combination) =>
      memberFieldValues.map((memberFieldValue) => ({
        ...combination,
        [memberFieldKey]: memberFieldValue,
      })),
    );
  }

  return combinations;
};
