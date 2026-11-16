import {
  RowLevelPermissionPredicateGroupLogicalOperator,
  RowLevelPermissionPredicateOperand,
} from 'twenty-shared/types';

import { computeRoleRecordsPermissions } from 'src/engine/permissions/role/utils/compute-role-records-permissions.util';

const OBJECT_METADATA_ID = 'object-id';
const RLS_RULE_ID = 'rule-id';
const OTHER_RLS_RULE_ID = 'other-rule-id';
const RULE_WITHOUT_PREDICATES_ID = 'rule-without-predicates-id';
const LABEL_FIELD_ID = 'label-field-id';

type RoleDefinition = Parameters<
  typeof computeRoleRecordsPermissions
>[0]['roleDefinition'];

const buildRule = ({
  id,
  canReadRecords = true,
  canUpdateRecords = false,
}: {
  id: string;
  canReadRecords?: boolean;
  canUpdateRecords?: boolean;
}): RoleDefinition['rowLevelPermissionRules'][number] => ({
  id,
  objectMetadataId: OBJECT_METADATA_ID,
  canCreateRecords: false,
  canReadRecords,
  canUpdateRecords,
  canSoftDeleteRecords: false,
  canDestroyRecords: false,
});

const buildPredicate = ({
  id,
  rowLevelPermissionRuleId,
}: {
  id: string;
  rowLevelPermissionRuleId: string;
}): RoleDefinition['rowLevelPermissionPredicates'][number] => ({
  id,
  roleId: 'role-id',
  objectMetadataId: OBJECT_METADATA_ID,
  fieldMetadataId: 'filtered-field-id',
  operand: RowLevelPermissionPredicateOperand.CONTAINS,
  value: 'value',
  subFieldName: null,
  rowLevelPermissionPredicateGroupId: null,
  workspaceMemberFieldMetadataId: null,
  workspaceMemberSubFieldName: null,
  rowLevelPermissionRuleId,
});

const buildPredicateGroup = ({
  id,
  parentId,
  rowLevelPermissionRuleId,
}: {
  id: string;
  parentId: string | null;
  rowLevelPermissionRuleId: string;
}): RoleDefinition['rowLevelPermissionPredicateGroups'][number] => ({
  id,
  roleId: 'role-id',
  objectMetadataId: OBJECT_METADATA_ID,
  parentRowLevelPermissionPredicateGroupId: parentId,
  logicalOperator: RowLevelPermissionPredicateGroupLogicalOperator.AND,
  positionInRowLevelPermissionPredicateGroup: null,
  canReadRecords: true,
  canUpdateRecords: true,
  canSoftDeleteRecords: true,
  canDestroyRecords: true,
  rowLevelPermissionRuleId,
});

const computeObjectPermissions = ({
  fieldPermissions = [],
  rowLevelPermissionRules = [
    buildRule({ id: RLS_RULE_ID }),
    buildRule({ id: OTHER_RLS_RULE_ID }),
    buildRule({ id: RULE_WITHOUT_PREDICATES_ID }),
  ],
  canReadAllObjectRecords = false,
}: {
  fieldPermissions?: {
    fieldMetadataId: string;
    rowLevelPermissionRuleId: string | null;
    canReadFieldValue?: boolean | null;
    canUpdateFieldValue?: boolean | null;
  }[];
  rowLevelPermissionRules?: RoleDefinition['rowLevelPermissionRules'];
  canReadAllObjectRecords?: boolean;
}) =>
  computeRoleRecordsPermissions({
    roleDefinition: {
      canCreateAllObjectRecords: false,
      canReadAllObjectRecords,
      canUpdateAllObjectRecords: false,
      canSoftDeleteAllObjectRecords: false,
      canDestroyAllObjectRecords: false,
      isPermissionFlagGranted: () => true,
      objectPermissions: [],
      fieldPermissions: fieldPermissions.map((fieldPermission) => ({
        ...fieldPermission,
        objectMetadataId: OBJECT_METADATA_ID,
      })),
      rowLevelPermissionRules,
      rowLevelPermissionPredicates: [
        buildPredicate({
          id: 'predicate-id',
          rowLevelPermissionRuleId: RLS_RULE_ID,
        }),
        buildPredicate({
          id: 'other-predicate-id',
          rowLevelPermissionRuleId: OTHER_RLS_RULE_ID,
        }),
      ],
      rowLevelPermissionPredicateGroups: [
        buildPredicateGroup({
          id: 'root-group-id',
          parentId: null,
          rowLevelPermissionRuleId: RLS_RULE_ID,
        }),
        buildPredicateGroup({
          id: 'child-group-id',
          parentId: 'root-group-id',
          rowLevelPermissionRuleId: RLS_RULE_ID,
        }),
        buildPredicateGroup({
          id: 'other-root-group-id',
          parentId: null,
          rowLevelPermissionRuleId: OTHER_RLS_RULE_ID,
        }),
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

const findRule = ({
  objectPermissions,
  ruleId,
}: {
  objectPermissions: ReturnType<typeof computeObjectPermissions>;
  ruleId: string;
}) =>
  objectPermissions?.rowLevelRecordsPermissions?.find(
    (rule) => rule.ruleId === ruleId,
  );

describe('computeRoleRecordsPermissions', () => {
  it('should make one entry per rule with predicates, carrying its own groups', () => {
    const objectPermissions = computeObjectPermissions({});

    expect(
      objectPermissions?.rowLevelRecordsPermissions?.map(
        ({ ruleId, predicates, predicateGroups }) => [
          ruleId,
          predicates.map(({ id }) => id),
          predicateGroups.map(({ id }) => id),
        ],
      ),
    ).toEqual([
      [RLS_RULE_ID, ['predicate-id'], ['root-group-id', 'child-group-id']],
      [OTHER_RLS_RULE_ID, ['other-predicate-id'], ['other-root-group-id']],
    ]);
  });

  it('should take the operations of each rule from the rule', () => {
    const rule = findRule({
      objectPermissions: computeObjectPermissions({
        rowLevelPermissionRules: [
          buildRule({
            id: RLS_RULE_ID,
            canReadRecords: false,
            canUpdateRecords: true,
          }),
        ],
      }),
      ruleId: RLS_RULE_ID,
    });

    expect(rule).toMatchObject({
      canReadRecords: false,
      canUpdateRecords: true,
    });
  });

  it('should keep the all records access of the object next to its rules', () => {
    const objectPermissions = computeObjectPermissions({
      canReadAllObjectRecords: true,
    });

    expect(objectPermissions?.canReadAllRecords).toBe(true);
    expect(objectPermissions?.rowLevelRecordsPermissions).toHaveLength(2);
  });

  it('should leave out the rules when none has predicates', () => {
    expect(
      computeObjectPermissions({
        rowLevelPermissionRules: [
          buildRule({ id: RULE_WITHOUT_PREDICATES_ID }),
        ],
      })?.rowLevelRecordsPermissions,
    ).toBeUndefined();
  });

  it('should keep RLS rule field permissions out of the object level lists', () => {
    const objectPermissions = computeObjectPermissions({
      fieldPermissions: [
        {
          fieldMetadataId: 'rls-rule-field-id',
          rowLevelPermissionRuleId: RLS_RULE_ID,
          canReadFieldValue: false,
        },
        {
          fieldMetadataId: 'object-field-id',
          rowLevelPermissionRuleId: null,
          canReadFieldValue: false,
        },
      ],
    });

    expect(objectPermissions?.unreadableFields).toEqual(['object-field-id']);
    expect(
      findRule({ objectPermissions, ruleId: RLS_RULE_ID })?.unreadableFields,
    ).toEqual(['rls-rule-field-id']);
  });

  it('should make a field the RLS rule cannot read uneditable too', () => {
    const rule = findRule({
      objectPermissions: computeObjectPermissions({
        fieldPermissions: [
          {
            fieldMetadataId: 'hidden-field-id',
            rowLevelPermissionRuleId: RLS_RULE_ID,
            canReadFieldValue: false,
          },
          {
            fieldMetadataId: 'locked-field-id',
            rowLevelPermissionRuleId: RLS_RULE_ID,
            canUpdateFieldValue: false,
          },
        ],
      }),
      ruleId: RLS_RULE_ID,
    });

    expect(rule?.unreadableFields).toEqual(['hidden-field-id']);
    expect(rule?.uneditableFields).toEqual([
      'hidden-field-id',
      'locked-field-id',
    ]);
  });

  it('should keep the label identifier readable on an RLS rule', () => {
    expect(
      findRule({
        objectPermissions: computeObjectPermissions({
          fieldPermissions: [
            {
              fieldMetadataId: LABEL_FIELD_ID,
              rowLevelPermissionRuleId: RLS_RULE_ID,
              canReadFieldValue: false,
            },
          ],
        }),
        ruleId: RLS_RULE_ID,
      })?.unreadableFields,
    ).toEqual([]);
  });

  it('should give each rule the field lists of its own field permissions', () => {
    const objectPermissions = computeObjectPermissions({
      fieldPermissions: [
        {
          fieldMetadataId: 'first-rls-rule-field-id',
          rowLevelPermissionRuleId: RLS_RULE_ID,
          canReadFieldValue: false,
        },
        {
          fieldMetadataId: 'other-rls-rule-field-id',
          rowLevelPermissionRuleId: OTHER_RLS_RULE_ID,
          canReadFieldValue: false,
        },
        {
          fieldMetadataId: 'dropped-rule-field-id',
          rowLevelPermissionRuleId: RULE_WITHOUT_PREDICATES_ID,
          canReadFieldValue: false,
        },
      ],
    });

    expect(objectPermissions?.unreadableFields).toEqual([]);
    expect(
      objectPermissions?.rowLevelRecordsPermissions?.map(
        ({ ruleId, unreadableFields }) => [ruleId, unreadableFields],
      ),
    ).toEqual([
      [RLS_RULE_ID, ['first-rls-rule-field-id']],
      [OTHER_RLS_RULE_ID, ['other-rls-rule-field-id']],
    ]);
  });
});
