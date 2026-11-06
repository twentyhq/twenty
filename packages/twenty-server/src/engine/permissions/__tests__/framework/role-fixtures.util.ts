import {
  type ObjectRecordsPermissions,
  RowLevelPermissionPredicateGroupLogicalOperator,
  RowLevelPermissionPredicateOperand,
} from 'twenty-shared/types';

import { type FlatRowLevelPermissionPredicateGroup } from 'src/engine/metadata-modules/row-level-permission-predicate/types/flat-row-level-permission-predicate-group.type';
import { type FlatRowLevelPermissionPredicate } from 'src/engine/metadata-modules/row-level-permission-predicate/types/flat-row-level-permission-predicate.type';
import { FLAT_ENTITY_DEFAULTS } from 'src/engine/permissions/__tests__/framework/object-metadata-fixtures.util';
import { OBJECT_ID } from 'src/engine/permissions/__tests__/framework/permission-test-ids.constant';
import { type RoleGrant } from 'src/engine/permissions/__tests__/framework/record-access-scenario.type';
import { type RoleFilter } from 'src/engine/permissions/__tests__/framework/role-filters.constant';
import { NO_ROLE_RECORDS_PERMISSIONS } from 'src/engine/permissions/constants/no-role-records-permissions.constant';
import { type RoleRecordsPermissions } from 'src/engine/permissions/types/role-records-permissions.type';

const buildObjectPermissions = ({
  grant,
  restrictedFields = {},
}: {
  grant: RoleGrant;
  restrictedFields?: ObjectRecordsPermissions['restrictedFields'];
}): ObjectRecordsPermissions => ({
  canReadAllRecords: grant === 'allRecords',
  canUpdateAllRecords: grant === 'allRecords',
  canSoftDeleteAllRecords: grant === 'allRecords',
  canDestroyAllRecords: grant === 'allRecords',
  restrictedFields,
  ...(grant === 'rowLevel' && {
    rowLevelRecordsPermissions: {
      canReadRecords: true,
      canUpdateRecords: true,
      canSoftDeleteRecords: true,
      canDestroyRecords: true,
      predicates: [],
      predicateGroups: [],
    },
  }),
});

export const buildRoleRecordsPermissions = ({
  grant,
  restrictedFields,
}: {
  grant: RoleGrant;
  restrictedFields?: ObjectRecordsPermissions['restrictedFields'];
}): RoleRecordsPermissions => ({
  ...NO_ROLE_RECORDS_PERMISSIONS,
  objects: { [OBJECT_ID]: buildObjectPermissions({ grant, restrictedFields }) },
});

export const buildRowLevelFixtures = (roleFilters: RoleFilter[]) => ({
  predicateGroups: roleFilters.map(
    ({ roleId }) =>
      ({
        ...FLAT_ENTITY_DEFAULTS,
        id: `group-${roleId}`,
        universalIdentifier: `group-${roleId}`,
        roleId,
        roleUniversalIdentifier: roleId,
        objectMetadataId: OBJECT_ID,
        objectMetadataUniversalIdentifier: OBJECT_ID,
        logicalOperator: RowLevelPermissionPredicateGroupLogicalOperator.AND,
        parentRowLevelPermissionPredicateGroupId: null,
        parentRowLevelPermissionPredicateGroupUniversalIdentifier: null,
        positionInRowLevelPermissionPredicateGroup: null,
        deletedAt: null,
      }) as FlatRowLevelPermissionPredicateGroup,
  ),
  predicates: roleFilters.map(
    ({ roleId, fieldMetadataId, matchingValue }) =>
      ({
        ...FLAT_ENTITY_DEFAULTS,
        id: `predicate-${roleId}`,
        universalIdentifier: `predicate-${roleId}`,
        roleId,
        roleUniversalIdentifier: roleId,
        objectMetadataId: OBJECT_ID,
        objectMetadataUniversalIdentifier: OBJECT_ID,
        fieldMetadataId,
        fieldMetadataUniversalIdentifier: fieldMetadataId,
        relationFieldMetadataId: null,
        relationFieldMetadataUniversalIdentifier: null,
        workspaceMemberFieldMetadataId: null,
        workspaceMemberFieldMetadataUniversalIdentifier: null,
        workspaceMemberSubFieldName: null,
        subFieldName: null,
        operand: RowLevelPermissionPredicateOperand.IS,
        value: matchingValue,
        rowLevelPermissionPredicateGroupId: `group-${roleId}`,
        rowLevelPermissionPredicateGroupUniversalIdentifier: `group-${roleId}`,
        positionInRowLevelPermissionPredicateGroup: 0,
        deletedAt: null,
      }) as FlatRowLevelPermissionPredicate,
  ),
});

export const buildAiRunScope = (grant: 'none' | 'allRecords') => ({
  recordsPermissions: buildRoleRecordsPermissions({ grant }),
  permissionFlags: {},
});
