/* @license Enterprise */

import {
  type ObjectRecordsOperationType,
  type ObjectRecordsPermissions,
  type RowLevelRecordsPermissions,
} from 'twenty-shared/types';
import {
  canAccessThroughAllRecordsPermission,
  isDefined,
  canRlsRuleAccessOperation,
} from 'twenty-shared/utils';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { type AccessGroupWithoutCompactId } from 'src/engine/permissions/internal/access-group/types/access-group.type';
import { buildAccessGroupMemberFieldValuesOrThrow } from 'src/engine/permissions/internal/access-group/utils/build-access-group-member-field-values-or-throw.util';
import { ACCESS_GROUP_SHARED_PREDICATE_KEY } from 'src/engine/permissions/internal/access-group/constants/access-group-shared-predicate-key.constant';
import {
  computeAccessGroupHash,
  computeSharedAccessGroupHash,
} from 'src/engine/permissions/internal/access-group/utils/compute-access-group-hash.util';
import { findRlsRuleSharedPredicateValues } from 'src/engine/permissions/internal/access-group/utils/find-rls-rule-shared-predicate-values.util';
import { type RlsWorkspaceMember } from 'src/engine/permissions/internal/rls/types/rls-workspace-member.type';

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
  workspaceMembers: RlsWorkspaceMember[];
  flatFieldMetadataMaps: FlatEntityMaps<OrmFlatFieldMetadata>;
  isRelationHopEnabled: boolean;
}): AccessGroupWithoutCompactId[] => {
  if (!isDefined(objectRecordsPermissions)) {
    return [];
  }

  const isReachingAllRecords = operationTypes.some((operationType) =>
    canAccessThroughAllRecordsPermission({
      objectRecordsPermissions,
      operationType,
    }),
  );
  const rowLevelPermissionRules = (
    objectRecordsPermissions.rowLevelRecordsPermissions ?? []
  ).filter((rule) =>
    operationTypes.some((operationType) =>
      canRlsRuleAccessOperation({
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

  const buildSharedRuleAccessGroups = (
    rowLevelPermissionRule: RowLevelRecordsPermissions,
  ): AccessGroupWithoutCompactId[] | undefined => {
    const sharedPredicateValues = findRlsRuleSharedPredicateValues(
      rowLevelPermissionRule,
    );

    if (!isDefined(sharedPredicateValues)) {
      return undefined;
    }

    // the fields a group cannot read are part of it, so paths can stop at its unreadable relations
    const unreadableFieldIds = [
      ...new Set([
        ...objectRecordsPermissions.unreadableFields,
        ...rowLevelPermissionRule.unreadableFields,
      ]),
    ].sort();

    return sharedPredicateValues.values.map((value) => {
      const sharedPredicate = {
        ...sharedPredicateValues.sharedPredicate,
        value,
        unreadableFieldIds,
      };

      return {
        groupHash: computeSharedAccessGroupHash({
          sharedPredicate,
          isRelationHopEnabled,
        }),
        roleId,
        objectMetadataId,
        rowLevelPermissionPredicateGroupId: rowLevelPermissionRule.ruleId,
        memberFieldValues: {
          [ACCESS_GROUP_SHARED_PREDICATE_KEY]: sharedPredicate,
        },
      };
    });
  };

  const buildRuleAccessGroups = (
    rowLevelPermissionRule: RowLevelRecordsPermissions,
  ): AccessGroupWithoutCompactId[] => {
    const sharedRuleAccessGroups = buildSharedRuleAccessGroups(
      rowLevelPermissionRule,
    );

    if (isDefined(sharedRuleAccessGroups)) {
      return sharedRuleAccessGroups;
    }

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
