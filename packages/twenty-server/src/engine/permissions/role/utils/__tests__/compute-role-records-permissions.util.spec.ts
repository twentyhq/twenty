import {
  RowLevelPermissionPredicateGroupLogicalOperator,
  RowLevelPermissionPredicateOperand,
} from 'twenty-shared/types';

import { computeRoleRecordsPermissions } from 'src/engine/permissions/role/utils/compute-role-records-permissions.util';

const OBJECT_METADATA_ID = 'object-id';
const RLS_RULE_ID = 'rule-id';
const OTHER_RLS_RULE_ID = 'other-rule-id';
const LABEL_FIELD_ID = 'label-field-id';

const predicateGroup = ({
  id,
  parentId,
}: {
  id: string;
  parentId: string | null;
}) => ({
  id,
  roleId: 'role-id',
  objectMetadataId: OBJECT_METADATA_ID,
  parentRowLevelPermissionPredicateGroupId: parentId,
  logicalOperator: RowLevelPermissionPredicateGroupLogicalOperator.AND,
  positionInRowLevelPermissionPredicateGroup: null,
  canCreateRecords: true,
  canReadRecords: true,
  canUpdateRecords: true,
  canSoftDeleteRecords: true,
  canDestroyRecords: true,
});

const computeObjectPermissions = (
  fieldPermissions: {
    fieldMetadataId: string;
    rowLevelPermissionPredicateGroupId: string | null;
    canReadFieldValue?: boolean | null;
    canUpdateFieldValue?: boolean | null;
  }[],
) =>
  computeRoleRecordsPermissions({
    roleDefinition: {
      canCreateAllObjectRecords: true,
      canReadAllObjectRecords: true,
      canUpdateAllObjectRecords: true,
      canSoftDeleteAllObjectRecords: true,
      canDestroyAllObjectRecords: true,
      isPermissionFlagGranted: () => true,
      objectPermissions: [],
      fieldPermissions: fieldPermissions.map((fieldPermission) => ({
        ...fieldPermission,
        objectMetadataId: OBJECT_METADATA_ID,
      })),
      rowLevelPermissionPredicates: [
        {
          id: 'predicate-id',
          roleId: 'role-id',
          objectMetadataId: OBJECT_METADATA_ID,
          fieldMetadataId: 'filtered-field-id',
          operand: RowLevelPermissionPredicateOperand.CONTAINS,
          value: 'value',
          subFieldName: null,
          rowLevelPermissionPredicateGroupId: RLS_RULE_ID,
          workspaceMemberFieldMetadataId: null,
          workspaceMemberSubFieldName: null,
        },
      ],
      rowLevelPermissionPredicateGroups: [
        predicateGroup({ id: RLS_RULE_ID, parentId: null }),
        predicateGroup({ id: OTHER_RLS_RULE_ID, parentId: null }),
        predicateGroup({ id: 'child-group-id', parentId: RLS_RULE_ID }),
      ],
    },
    objectMetadataCollection: [
      {
        id: OBJECT_METADATA_ID,
        isSystem: false,
        universalIdentifier: 'object-universal-identifier',
        labelIdentifierFieldMetadataId: LABEL_FIELD_ID,
      },
    ],
    resolveMorphRelationPermissionFieldIds: (fieldMetadataId) => [
      fieldMetadataId,
    ],
  }).objects[OBJECT_METADATA_ID];

describe('computeRoleRecordsPermissions', () => {
  it('should keep RLS rule field permissions out of the object level lists', () => {
    const objectPermissions = computeObjectPermissions([
      {
        fieldMetadataId: 'rls-rule-field-id',
        rowLevelPermissionPredicateGroupId: RLS_RULE_ID,
        canReadFieldValue: false,
      },
      {
        fieldMetadataId: 'object-field-id',
        rowLevelPermissionPredicateGroupId: null,
        canReadFieldValue: false,
      },
    ]);

    expect(objectPermissions?.unreadableFields).toEqual(['object-field-id']);
    expect(
      objectPermissions?.rowLevelRecordsPermissions?.unreadableFields,
    ).toEqual(['rls-rule-field-id']);
  });

  it('should make a field the RLS rule cannot read uneditable too', () => {
    const rowLevelRecordsPermissions = computeObjectPermissions([
      {
        fieldMetadataId: 'hidden-field-id',
        rowLevelPermissionPredicateGroupId: RLS_RULE_ID,
        canReadFieldValue: false,
      },
      {
        fieldMetadataId: 'locked-field-id',
        rowLevelPermissionPredicateGroupId: RLS_RULE_ID,
        canUpdateFieldValue: false,
      },
    ])?.rowLevelRecordsPermissions;

    expect(rowLevelRecordsPermissions?.unreadableFields).toEqual([
      'hidden-field-id',
    ]);
    expect(rowLevelRecordsPermissions?.uneditableFields).toEqual([
      'hidden-field-id',
      'locked-field-id',
    ]);
  });

  it('should keep the label identifier readable on an RLS rule', () => {
    expect(
      computeObjectPermissions([
        {
          fieldMetadataId: LABEL_FIELD_ID,
          rowLevelPermissionPredicateGroupId: RLS_RULE_ID,
          canReadFieldValue: false,
        },
      ])?.rowLevelRecordsPermissions?.unreadableFields,
    ).toEqual([]);
  });

  it('should apply the lists of every root group of the role', () => {
    expect(
      computeObjectPermissions([
        {
          fieldMetadataId: 'first-rls-rule-field-id',
          rowLevelPermissionPredicateGroupId: RLS_RULE_ID,
          canReadFieldValue: false,
        },
        {
          fieldMetadataId: 'other-rls-rule-field-id',
          rowLevelPermissionPredicateGroupId: OTHER_RLS_RULE_ID,
          canReadFieldValue: false,
        },
      ])?.rowLevelRecordsPermissions?.unreadableFields,
    ).toEqual(['first-rls-rule-field-id', 'other-rls-rule-field-id']);
  });

  it('should ignore a field permission that targets another group than the RLS rule', () => {
    expect(
      computeObjectPermissions([
        {
          fieldMetadataId: 'field-id',
          rowLevelPermissionPredicateGroupId: 'child-group-id',
          canReadFieldValue: false,
        },
      ])?.rowLevelRecordsPermissions?.unreadableFields,
    ).toEqual([]);
  });
});
