/* @license Enterprise */

import {
  type ObjectRecordsOperationType,
  type ObjectRecordsPermissions,
} from 'twenty-shared/types';
import { canReachSomeRecords, isDefined } from 'twenty-shared/utils';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { type AccessGroupDefinition } from 'src/engine/permissions/internal/access-group/types/access-group-definition.type';
import { buildAccessGroupMemberFieldValuesOrThrow } from 'src/engine/permissions/internal/access-group/utils/build-access-group-member-field-values-or-throw.util';
import { computeAccessGroupHash } from 'src/engine/permissions/internal/access-group/utils/compute-access-group-hash.util';
import { type RowLevelPermissionWorkspaceMember } from 'src/engine/permissions/internal/rls/types/row-level-permission-workspace-member.type';

const ALL_OPERATION_TYPES: ObjectRecordsOperationType[] = [
  'create',
  'read',
  'update',
  'softDelete',
  'destroy',
];

export const buildRoleAccessGroupDefinitionsOrThrow = ({
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

  const buildDefinition = ({
    rowLevelPermissionPredicateGroupId,
    memberFieldValues,
  }: Pick<
    AccessGroupDefinition,
    'rowLevelPermissionPredicateGroupId' | 'memberFieldValues'
  >): AccessGroupDefinition => ({
    groupHash: computeAccessGroupHash({
      roleId,
      objectMetadataId,
      rowLevelPermissionPredicateGroupId,
      memberFieldValues,
    }),
    roleId,
    objectMetadataId,
    rowLevelPermissionPredicateGroupId,
    memberFieldValues,
  });

  const { rowLevelRecordsPermissions } = objectRecordsPermissions;

  if (!isDefined(rowLevelRecordsPermissions)) {
    return [
      buildDefinition({
        rowLevelPermissionPredicateGroupId: null,
        memberFieldValues: null,
      }),
    ];
  }

  const { predicates, predicateGroups } = rowLevelRecordsPermissions;
  // The RLS filter reads one root group and ANDs ungrouped predicates onto it, so a role has one rule per object
  const rowLevelPermissionPredicateGroupId =
    predicateGroups.find(
      ({ parentRowLevelPermissionPredicateGroupId }) =>
        !isDefined(parentRowLevelPermissionPredicateGroupId),
    )?.id ?? null;
  const workspaceMemberBoundPredicates = predicates.filter(
    ({ workspaceMemberFieldMetadataId }) =>
      isDefined(workspaceMemberFieldMetadataId),
  );

  if (workspaceMemberBoundPredicates.length === 0) {
    return [
      buildDefinition({
        rowLevelPermissionPredicateGroupId,
        memberFieldValues: null,
      }),
    ];
  }

  return workspaceMembers.flatMap((workspaceMember) =>
    buildAccessGroupMemberFieldValuesOrThrow({
      workspaceMemberBoundPredicates,
      workspaceMember,
      flatFieldMetadataMaps,
    }).map((memberFieldValues) =>
      buildDefinition({
        rowLevelPermissionPredicateGroupId,
        memberFieldValues,
      }),
    ),
  );
};
