/* @license Enterprise */

import {
  type ObjectRecordsOperationType,
  type ObjectRecordsPermissions,
  type RowLevelRecordsPermissions,
} from 'twenty-shared/types';
import {
  canReachAllRecords,
  isDefined,
  isRowLevelRecordsPermissionsRuleGrantingOperation,
} from 'twenty-shared/utils';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { type AccessGroupWithoutCompactId } from 'src/engine/permissions/internal/access-group/types/access-group.type';
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

export const buildRoleAccessGroupsOrThrow = ({
  roleId,
  objectMetadataId,
  objectRecordsPermissions,
  operationTypes = ALL_OPERATION_TYPES,
  workspaceMembers,
  flatFieldMetadataMaps,
  isRelationHopEnabled,
}: {
  roleId: string;
  objectMetadataId: string;
  objectRecordsPermissions: ObjectRecordsPermissions | undefined;
  operationTypes?: ObjectRecordsOperationType[];
  workspaceMembers: RowLevelPermissionWorkspaceMember[];
  flatFieldMetadataMaps: FlatEntityMaps<OrmFlatFieldMetadata>;
  isRelationHopEnabled: boolean;
}): AccessGroupWithoutCompactId[] => {
  if (!isDefined(objectRecordsPermissions)) {
    return [];
  }

  const isReachingAllRecords = operationTypes.some((operationType) =>
    canReachAllRecords({ objectRecordsPermissions, operationType }),
  );
  const rowLevelPermissionRules = (
    objectRecordsPermissions.rowLevelRecordsPermissions ?? []
  ).filter((rule) =>
    operationTypes.some((operationType) =>
      isRowLevelRecordsPermissionsRuleGrantingOperation({
        rule,
        operationType,
      }),
    ),
  );

  const buildAccessGroup = ({
    rowLevelPermissionRule,
    memberFieldValues,
  }: {
    rowLevelPermissionRule: RowLevelRecordsPermissions | null;
    memberFieldValues: AccessGroupWithoutCompactId['memberFieldValues'];
  }): AccessGroupWithoutCompactId => {
    const rowLevelPermissionPredicateGroupId =
      rowLevelPermissionRule?.ruleId ?? null;

    return {
      groupHash: computeAccessGroupHash({
        roleId,
        objectMetadataId,
        rowLevelPermissionRule,
        rowLevelPermissionPredicateGroupId,
        memberFieldValues,
        isRelationHopEnabled,
      }),
      roleId,
      objectMetadataId,
      rowLevelPermissionPredicateGroupId,
      memberFieldValues,
    };
  };

  const buildRuleAccessGroups = (
    rowLevelPermissionRule: RowLevelRecordsPermissions,
  ): AccessGroupWithoutCompactId[] => {
    const workspaceMemberBoundPredicates =
      rowLevelPermissionRule.predicates.filter(
        ({ workspaceMemberFieldMetadataId }) =>
          isDefined(workspaceMemberFieldMetadataId),
      );

    if (workspaceMemberBoundPredicates.length === 0) {
      return [
        buildAccessGroup({ rowLevelPermissionRule, memberFieldValues: null }),
      ];
    }

    return workspaceMembers.flatMap((workspaceMember) =>
      buildAccessGroupMemberFieldValuesOrThrow({
        workspaceMemberBoundPredicates,
        workspaceMember,
        flatFieldMetadataMaps,
      }).map((memberFieldValues) =>
        buildAccessGroup({ rowLevelPermissionRule, memberFieldValues }),
      ),
    );
  };

  return [
    ...(isReachingAllRecords
      ? [
          buildAccessGroup({
            rowLevelPermissionRule: null,
            memberFieldValues: null,
          }),
        ]
      : []),
    ...rowLevelPermissionRules.flatMap(buildRuleAccessGroups),
  ];
};
