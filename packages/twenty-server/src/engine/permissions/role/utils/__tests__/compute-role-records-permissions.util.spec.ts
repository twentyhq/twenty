import {
  type RowLevelPermissionPredicate,
  RowLevelPermissionPredicateGroupLogicalOperator,
} from 'twenty-shared/types';

import { computeRoleRecordsPermissions } from 'src/engine/permissions/role/utils/compute-role-records-permissions.util';

const OBJECT_METADATA_ID = 'object-id';
const RULE_ID = 'rule-id';
const OTHER_RULE_ID = 'other-rule-id';
const LABEL_FIELD_ID = 'label-field-id';

const predicateGroup = (id: string, parentId: string | null) => ({
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
        } as RowLevelPermissionPredicate,
      ],
      rowLevelPermissionPredicateGroups: [
        predicateGroup(RULE_ID, null),
        predicateGroup(OTHER_RULE_ID, null),
        predicateGroup('child-group-id', RULE_ID),
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
  it('should keep rule field permissions out of the object level restrictions', () => {
    const objectPermissions = computeObjectPermissions([
      {
        fieldMetadataId: 'rule-field-id',
        rowLevelPermissionPredicateGroupId: RULE_ID,
        canReadFieldValue: false,
      },
      {
        fieldMetadataId: 'object-field-id',
        rowLevelPermissionPredicateGroupId: null,
        canReadFieldValue: false,
      },
    ]);

    expect(Object.keys(objectPermissions?.restrictedFields ?? {})).toEqual([
      'object-field-id',
    ]);
    expect(
      objectPermissions?.rowLevelRecordsPermissions?.unreadableFields,
    ).toEqual(['rule-field-id']);
  });

  it('should make a field the rule cannot read uneditable too', () => {
    const rowLevelRecordsPermissions = computeObjectPermissions([
      {
        fieldMetadataId: 'hidden-field-id',
        rowLevelPermissionPredicateGroupId: RULE_ID,
        canReadFieldValue: false,
      },
      {
        fieldMetadataId: 'locked-field-id',
        rowLevelPermissionPredicateGroupId: RULE_ID,
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

  it('should keep the label identifier readable on a rule', () => {
    expect(
      computeObjectPermissions([
        {
          fieldMetadataId: LABEL_FIELD_ID,
          rowLevelPermissionPredicateGroupId: RULE_ID,
          canReadFieldValue: false,
        },
      ])?.rowLevelRecordsPermissions?.unreadableFields,
    ).toEqual([]);
  });

  it('should apply the lists of every root group of the role', () => {
    expect(
      computeObjectPermissions([
        {
          fieldMetadataId: 'first-rule-field-id',
          rowLevelPermissionPredicateGroupId: RULE_ID,
          canReadFieldValue: false,
        },
        {
          fieldMetadataId: 'other-rule-field-id',
          rowLevelPermissionPredicateGroupId: OTHER_RULE_ID,
          canReadFieldValue: false,
        },
      ])?.rowLevelRecordsPermissions?.unreadableFields,
    ).toEqual(['first-rule-field-id', 'other-rule-field-id']);
  });

  it('should ignore a field permission that targets another group than the rule', () => {
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
