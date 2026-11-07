/* @license Enterprise */

import {
  type ObjectRecordsOperationType,
  type ObjectRecordsPermissions,
} from 'twenty-shared/types';
import { canReachSomeRecords, isDefined } from 'twenty-shared/utils';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { type AccessGroupDefinition } from 'src/engine/permissions/internal/access-group/types/access-group-definition.type';
import { buildAccessGroupMemberFieldValues } from 'src/engine/permissions/internal/access-group/utils/build-access-group-member-field-values.util';
import { computeAccessGroupHash } from 'src/engine/permissions/internal/access-group/utils/compute-access-group-hash.util';
import { type RowLevelPermissionWorkspaceMember } from 'src/engine/permissions/internal/rls/types/row-level-permission-workspace-member.type';

const ALL_OPERATION_TYPES: ObjectRecordsOperationType[] = [
  'create',
  'read',
  'update',
  'softDelete',
  'destroy',
];

export const buildRoleAccessGroupDefinitions = ({
  roleId,
  objectMetadataId,
  objectRecordsPermissions,
  operationTypes = ALL_OPERATION_TYPES,
  workspaceMembers,
  flatFieldMetadataMaps,
}: {
  roleId: string;
  objectMetadataId: string;
  objectRecordsPermissions: ObjectRecordsPermissions | undefined;
  operationTypes?: ObjectRecordsOperationType[];
  workspaceMembers: RowLevelPermissionWorkspaceMember[];
  flatFieldMetadataMaps: FlatEntityMaps<OrmFlatFieldMetadata>;
}): AccessGroupDefinition[] => {
  const isReachable = operationTypes.some((operationType) =>
    canReachSomeRecords({ objectRecordsPermissions, operationType }),
  );

  if (!isDefined(objectRecordsPermissions) || !isReachable) {
    return [];
  }

  const buildDefinition = (
    rowLevelPermissionPredicateGroupId: AccessGroupDefinition['rowLevelPermissionPredicateGroupId'],
    memberFieldValues: AccessGroupDefinition['memberFieldValues'],
  ): AccessGroupDefinition => ({
    groupHash: computeAccessGroupHash({
      roleId,
      objectMetadataId,
      rowLevelPermissionPredicateGroupId,
      memberFieldValues,
    }),
    roleId,
    rowLevelPermissionPredicateGroupId,
    memberFieldValues,
  });

  const { rowLevelRecordsPermissions } = objectRecordsPermissions;

  if (!isDefined(rowLevelRecordsPermissions)) {
    return [buildDefinition(null, null)];
  }

  const rootPredicateGroups = rowLevelRecordsPermissions.predicateGroups.filter(
    ({ parentRowLevelPermissionPredicateGroupId }) =>
      !isDefined(parentRowLevelPermissionPredicateGroupId),
  );
  const workspaceMemberBoundPredicates =
    rowLevelRecordsPermissions.predicates.filter(
      ({ workspaceMemberFieldMetadataId }) =>
        isDefined(workspaceMemberFieldMetadataId),
    );

  return rootPredicateGroups.flatMap(({ id }) =>
    workspaceMemberBoundPredicates.length === 0
      ? [buildDefinition(id, null)]
      : workspaceMembers.flatMap((workspaceMember) =>
          buildAccessGroupMemberFieldValues({
            workspaceMemberBoundPredicates,
            workspaceMember,
            flatFieldMetadataMaps,
          }).map((memberFieldValues) => buildDefinition(id, memberFieldValues)),
        ),
  );
};
