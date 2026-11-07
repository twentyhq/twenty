/* @license Enterprise */

import {
  type ObjectRecordsOperationType,
  type ObjectRecordsPermissions,
  type RowLevelPermissionPredicate,
  type RowLevelPermissionPredicateGroup,
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

const findRootPredicateGroupId = ({
  predicate,
  predicateGroups,
}: {
  predicate: RowLevelPermissionPredicate;
  predicateGroups: RowLevelPermissionPredicateGroup[];
}): string | null => {
  const visitedGroupIds = new Set<string>();
  let groupId = predicate.rowLevelPermissionPredicateGroupId;

  while (isDefined(groupId) && !visitedGroupIds.has(groupId)) {
    visitedGroupIds.add(groupId);

    const parentGroupId = predicateGroups.find(
      ({ id }) => id === groupId,
    )?.parentRowLevelPermissionPredicateGroupId;

    if (!isDefined(parentGroupId)) {
      return groupId;
    }

    groupId = parentGroupId;
  }

  return null;
};

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

  const rootPredicateGroupIds = predicateGroups
    .filter(
      ({ parentRowLevelPermissionPredicateGroupId }) =>
        !isDefined(parentRowLevelPermissionPredicateGroupId),
    )
    .map(({ id }) => id);
  // The API accepts predicates without a group, and the RLS filter still enforces them
  const hasUngroupedPredicates = predicates.some(
    (predicate) =>
      findRootPredicateGroupId({ predicate, predicateGroups }) === null,
  );

  return [
    ...rootPredicateGroupIds,
    ...(hasUngroupedPredicates ? [null] : []),
  ].flatMap((rowLevelPermissionPredicateGroupId) => {
    const workspaceMemberBoundPredicates = predicates.filter(
      (predicate) =>
        isDefined(predicate.workspaceMemberFieldMetadataId) &&
        findRootPredicateGroupId({ predicate, predicateGroups }) ===
          rowLevelPermissionPredicateGroupId,
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
  });
};
