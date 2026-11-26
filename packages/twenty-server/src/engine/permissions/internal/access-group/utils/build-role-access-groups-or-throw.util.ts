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
import { type AccessGroupWithoutCompactId } from 'src/engine/permissions/internal/access-group/types/access-group-without-compact-id.type';
import { buildAccessGroupMemberFieldValuesOrThrow } from 'src/engine/permissions/internal/access-group/utils/build-access-group-member-field-values-or-throw.util';
import { computeAccessGroupHash } from 'src/engine/permissions/internal/access-group/utils/compute-access-group-hash.util';
import { resolveAccessGroupRuleShape } from 'src/engine/permissions/internal/access-group/utils/resolve-access-group-rule-shape.util';
import { type RlsWorkspaceMember } from 'src/engine/permissions/internal/rls/types/rls-workspace-member.type';

const ALL_OPERATION_TYPES: ObjectRecordsOperationType[] = [
  'create',
  'read',
  'update',
  'softDelete',
  'destroy',
];

export const buildRoleAccessGroupsOrThrow = ({
  objectMetadataId,
  objectRecordsPermissions,
  operationTypes = ALL_OPERATION_TYPES,
  workspaceMembers,
  flatFieldMetadataMaps,
}: {
  objectMetadataId: string;
  objectRecordsPermissions: ObjectRecordsPermissions | undefined;
  operationTypes?: ObjectRecordsOperationType[];
  workspaceMembers: RlsWorkspaceMember[];
  flatFieldMetadataMaps: FlatEntityMaps<OrmFlatFieldMetadata>;
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

  const unreadableFieldIdsOfObject = objectRecordsPermissions.unreadableFields;

  const buildAllRecordsAccessGroup = (): AccessGroupWithoutCompactId => {
    const { ruleShapeHash, unreadableFieldIds } = resolveAccessGroupRuleShape({
      objectMetadataId,
      objectUnreadableFieldIds: unreadableFieldIdsOfObject,
      rowLevelPermissionRule: null,
    });

    return {
      type: 'ALL_RECORDS',
      groupHash: computeAccessGroupHash({
        ruleShapeHash,
        accessGroupSplitValue: { type: 'ALL_RECORDS' },
      }),
      objectMetadataId,
      ruleShapeHash,
      unreadableFieldIds,
    };
  };

  const buildRuleAccessGroups = (
    rowLevelPermissionRule: RowLevelRecordsPermissions,
  ): AccessGroupWithoutCompactId[] => {
    const { ruleShapeHash, unreadableFieldIds, splitPredicate } =
      resolveAccessGroupRuleShape({
        objectMetadataId,
        objectUnreadableFieldIds: unreadableFieldIdsOfObject,
        rowLevelPermissionRule,
      });
    const groupShape = { objectMetadataId, ruleShapeHash, unreadableFieldIds };

    if (isDefined(splitPredicate)) {
      return [...new Set(splitPredicate.value)].map((value) => ({
        ...groupShape,
        type: 'RLS_LITERAL_VALUE',
        groupHash: computeAccessGroupHash({
          ruleShapeHash,
          accessGroupSplitValue: { type: 'RLS_LITERAL_VALUE', value },
        }),
        value,
      }));
    }

    const workspaceMemberBoundPredicates =
      rowLevelPermissionRule.predicates.filter(
        ({ workspaceMemberFieldMetadataId }) =>
          isDefined(workspaceMemberFieldMetadataId),
      );

    if (workspaceMemberBoundPredicates.length === 0) {
      return [
        {
          ...groupShape,
          type: 'RLS_RULE',
          groupHash: computeAccessGroupHash({
            ruleShapeHash,
            accessGroupSplitValue: { type: 'RLS_RULE' },
          }),
        },
      ];
    }

    return workspaceMembers.flatMap((workspaceMember) =>
      buildAccessGroupMemberFieldValuesOrThrow({
        workspaceMemberBoundPredicates,
        workspaceMember,
        flatFieldMetadataMaps,
      }).map((memberFieldValues) => ({
        ...groupShape,
        type: 'RLS_MEMBER_VALUE' as const,
        groupHash: computeAccessGroupHash({
          ruleShapeHash,
          accessGroupSplitValue: {
            type: 'RLS_MEMBER_VALUE',
            memberFieldValues,
          },
        }),
        memberFieldValues,
      })),
    );
  };

  return [
    ...(isReachingAllRecords ? [buildAllRecordsAccessGroup()] : []),
    ...rowLevelPermissionRules.flatMap(buildRuleAccessGroups),
  ];
};
