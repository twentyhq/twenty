import {
  RowLevelPermissionPredicateGroupLogicalOperator,
  RowLevelPermissionPredicateOperand,
  type RowLevelPermissionPredicate,
  type RowLevelPermissionPredicateGroup,
} from 'twenty-shared/types';

import { computeRoleRecordsPermissions } from 'src/engine/permissions/role/utils/compute-role-records-permissions.util';
import { fromRoleRecordsPermissionsToObjectsPermissions } from 'src/engine/permissions/role/utils/from-role-records-permissions-to-objects-permissions.util';

const ROLE_ID = 'role-id';
const COMPANY_ID = 'company-id';
const OPPORTUNITY_ID = 'opportunity-id';

const PREDICATE_GROUP: RowLevelPermissionPredicateGroup = {
  id: 'group-id',
  roleId: ROLE_ID,
  objectMetadataId: OPPORTUNITY_ID,
  logicalOperator: RowLevelPermissionPredicateGroupLogicalOperator.AND,
  parentRowLevelPermissionPredicateGroupId: null,
  positionInRowLevelPermissionPredicateGroup: 0,
  canReadRecords: false,
  canUpdateRecords: false,
  canSoftDeleteRecords: false,
  canDestroyRecords: false,
};

const PREDICATE: RowLevelPermissionPredicate = {
  id: 'predicate-id',
  roleId: ROLE_ID,
  objectMetadataId: OPPORTUNITY_ID,
  fieldMetadataId: 'owner-field-id',
  operand: RowLevelPermissionPredicateOperand.IS,
  value: null,
  subFieldName: null,
  rowLevelPermissionPredicateGroupId: PREDICATE_GROUP.id,
  workspaceMemberFieldMetadataId: 'workspace-member-id-field-id',
  workspaceMemberSubFieldName: null,
};

const computeObjectsPermissions = () =>
  fromRoleRecordsPermissionsToObjectsPermissions({
    roleRecordsPermissions: computeRoleRecordsPermissions({
      roleDefinition: {
        canReadAllObjectRecords: true,
        canUpdateAllObjectRecords: false,
        canSoftDeleteAllObjectRecords: false,
        canDestroyAllObjectRecords: false,
        isPermissionFlagGranted: () => false,
        objectPermissions: [
          {
            objectMetadataId: COMPANY_ID,
            canReadObjectRecords: true,
            canUpdateObjectRecords: true,
            canSoftDeleteObjectRecords: false,
            canDestroyObjectRecords: false,
          },
          {
            objectMetadataId: OPPORTUNITY_ID,
            canReadObjectRecords: true,
            canUpdateObjectRecords: true,
            canSoftDeleteObjectRecords: true,
            canDestroyObjectRecords: false,
          },
        ],
        fieldPermissions: [
          {
            objectMetadataId: COMPANY_ID,
            fieldMetadataId: 'revenue-field-id',
            canReadFieldValue: false,
            canUpdateFieldValue: false,
          },
        ],
        rowLevelPermissionPredicates: [PREDICATE],
        rowLevelPermissionPredicateGroups: [PREDICATE_GROUP],
      },
      objectMetadataCollection: [
        {
          id: COMPANY_ID,
          isSystem: false,
          universalIdentifier: 'company-universal-identifier',
          labelIdentifierFieldMetadataId: 'name-field-id',
        },
        {
          id: OPPORTUNITY_ID,
          isSystem: false,
          universalIdentifier: 'opportunity-universal-identifier',
          labelIdentifierFieldMetadataId: 'name-field-id',
        },
      ],
      resolveMorphRelationPermissionFieldIds: (fieldMetadataId) => [
        fieldMetadataId,
      ],
    }),
  });

describe('fromRoleRecordsPermissionsToObjectsPermissions', () => {
  it('gives back the API shape for an object without predicates', () => {
    expect(computeObjectsPermissions()[COMPANY_ID]).toEqual({
      canReadObjectRecords: true,
      canUpdateObjectRecords: true,
      canSoftDeleteObjectRecords: false,
      canDestroyObjectRecords: false,
      restrictedFields: {
        'revenue-field-id': { canRead: false, canUpdate: false },
      },
      rowLevelPermissionPredicates: [],
      rowLevelPermissionPredicateGroups: [],
    });
  });

  it('gives back the role flags and predicates for an object with predicates', () => {
    expect(computeObjectsPermissions()[OPPORTUNITY_ID]).toEqual({
      canReadObjectRecords: true,
      canUpdateObjectRecords: true,
      canSoftDeleteObjectRecords: true,
      canDestroyObjectRecords: false,
      restrictedFields: {},
      rowLevelPermissionPredicates: [PREDICATE],
      rowLevelPermissionPredicateGroups: [PREDICATE_GROUP],
    });
  });
});
