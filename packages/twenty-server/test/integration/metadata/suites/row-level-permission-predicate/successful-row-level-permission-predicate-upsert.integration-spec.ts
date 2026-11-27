import { findManyObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/find-many-object-metadata.util';
import { createOneRole } from 'test/integration/metadata/suites/role/utils/create-one-role.util';
import { deleteOneRole } from 'test/integration/metadata/suites/role/utils/delete-one-role.util';
import { upsertRowLevelPermissionRules } from 'test/integration/metadata/suites/row-level-permission-predicate/utils/upsert-row-level-permission-rules.util';
import { jestExpectToBeDefined } from 'test/utils/jest-expect-to-be-defined.util.test';
import {
  RowLevelPermissionPredicateGroupLogicalOperator,
  RowLevelPermissionPredicateOperand,
} from 'twenty-shared/types';
import { v4 } from 'uuid';

import { type UpsertRowLevelPermissionRulesInput } from 'src/engine/metadata-modules/row-level-permission-predicate/dtos/inputs/upsert-row-level-permission-rules.input';

describe('Row Level Permission Predicate upsert should succeed', () => {
  let companyObjectMetadataId: string;
  let companyNameFieldMetadataId: string;
  let personObjectMetadataId: string;
  let personCompanyFieldMetadataId: string;
  let createdRoleId: string;

  beforeAll(async () => {
    const { objects } = await findManyObjectMetadata({
      expectToFail: false,
      input: {
        filter: {},
        paging: { first: 1000 },
      },
      gqlFields: `
        id
        nameSingular
        fieldsList {
          id
          name
        }
      `,
    });

    jestExpectToBeDefined(objects);

    const companyObjectMetadata = objects.find(
      (object: { nameSingular: string }) => object.nameSingular === 'company',
    );

    jestExpectToBeDefined(companyObjectMetadata);
    companyObjectMetadataId = companyObjectMetadata.id;

    jestExpectToBeDefined(companyObjectMetadata.fieldsList);
    const nameField = companyObjectMetadata.fieldsList.find(
      (field: { name: string }) => field.name === 'name',
    );

    jestExpectToBeDefined(nameField);
    companyNameFieldMetadataId = nameField.id;

    const personObjectMetadata = objects.find(
      (object: { nameSingular: string }) => object.nameSingular === 'person',
    );

    jestExpectToBeDefined(personObjectMetadata);
    jestExpectToBeDefined(personObjectMetadata.fieldsList);
    personObjectMetadataId = personObjectMetadata.id;

    const personCompanyField = personObjectMetadata.fieldsList.find(
      (field: { name: string }) => field.name === 'company',
    );

    jestExpectToBeDefined(personCompanyField);
    personCompanyFieldMetadataId = personCompanyField.id;

    const { data: roleData } = await createOneRole({
      expectToFail: false,
      input: {
        label: 'Test Role For RLS Predicates',
        description: 'A role for RLS predicate testing',
        icon: 'IconSettings',
        canUpdateAllSettings: false,
        canAccessAllTools: true,
        canReadAllObjectRecords: true,
        canUpdateAllObjectRecords: false,
        canSoftDeleteAllObjectRecords: false,
        canDestroyAllObjectRecords: false,
        canBeAssignedToUsers: true,
        canBeAssignedToAgents: false,
        canBeAssignedToApiKeys: false,
      },
    });

    createdRoleId = roleData?.createOneRole?.id;
    jestExpectToBeDefined(createdRoleId);
  });

  afterAll(async () => {
    if (createdRoleId) {
      await deleteOneRole({
        expectToFail: false,
        input: { idToDelete: createdRoleId },
      });
    }
  });

  it('should upsert a rule with a predicate and minimal input', async () => {
    const input: UpsertRowLevelPermissionRulesInput = {
      roleId: createdRoleId,
      objectMetadataId: companyObjectMetadataId,
      rules: [
        {
          predicates: [
            {
              fieldMetadataId: companyNameFieldMetadataId,
              operand: RowLevelPermissionPredicateOperand.CONTAINS,
            },
          ],
        },
      ],
    };

    const { data } = await upsertRowLevelPermissionRules({
      expectToFail: false,
      input,
    });

    expect(data.upsertRowLevelPermissionRules.rules).toHaveLength(1);
    expect(data.upsertRowLevelPermissionRules.predicates).toHaveLength(1);
    expect(data.upsertRowLevelPermissionRules.predicateGroups).toHaveLength(0);

    const [rule] = data.upsertRowLevelPermissionRules.rules;

    expect(rule).toMatchObject({
      id: expect.any(String),
      objectMetadataId: companyObjectMetadataId,
      canReadRecords: false,
      canCreateRecords: false,
      canUpdateRecords: false,
      canSoftDeleteRecords: false,
      canDestroyRecords: false,
    });
    expect(data.upsertRowLevelPermissionRules.predicates[0]).toMatchObject({
      id: expect.any(String),
      fieldMetadataId: companyNameFieldMetadataId,
      objectMetadataId: companyObjectMetadataId,
      operand: RowLevelPermissionPredicateOperand.CONTAINS,
      roleId: createdRoleId,
      rowLevelPermissionPredicateGroupId: null,
      rowLevelPermissionRuleId: rule.id,
    });
  });

  it('should upsert a predicate reaching a field through a relation', async () => {
    const input: UpsertRowLevelPermissionRulesInput = {
      roleId: createdRoleId,
      objectMetadataId: personObjectMetadataId,
      rules: [
        {
          predicates: [
            {
              relationFieldMetadataId: personCompanyFieldMetadataId,
              fieldMetadataId: companyNameFieldMetadataId,
              operand: RowLevelPermissionPredicateOperand.CONTAINS,
              value: 'Acme',
            },
          ],
        },
      ],
    };

    const { data } = await upsertRowLevelPermissionRules({
      expectToFail: false,
      input,
    });

    expect(data.upsertRowLevelPermissionRules.predicates).toHaveLength(1);
    expect(data.upsertRowLevelPermissionRules.predicates[0]).toMatchObject({
      objectMetadataId: personObjectMetadataId,
      relationFieldMetadataId: personCompanyFieldMetadataId,
      fieldMetadataId: companyNameFieldMetadataId,
      value: 'Acme',
    });
  });

  it('should upsert predicates with all fields', async () => {
    const input: UpsertRowLevelPermissionRulesInput = {
      roleId: createdRoleId,
      objectMetadataId: companyObjectMetadataId,
      rules: [
        {
          predicates: [
            {
              fieldMetadataId: companyNameFieldMetadataId,
              operand: RowLevelPermissionPredicateOperand.CONTAINS,
              value: 'Test Company',
              subFieldName: null,
              workspaceMemberFieldMetadataId: null,
              workspaceMemberSubFieldName: null,
              position: 0,
            },
          ],
        },
      ],
    };

    const { data } = await upsertRowLevelPermissionRules({
      expectToFail: false,
      input,
    });

    expect(data.upsertRowLevelPermissionRules.predicates).toHaveLength(1);
    expect(data.upsertRowLevelPermissionRules.predicates[0]).toMatchObject({
      id: expect.any(String),
      fieldMetadataId: companyNameFieldMetadataId,
      objectMetadataId: companyObjectMetadataId,
      operand: RowLevelPermissionPredicateOperand.CONTAINS,
      value: 'Test Company',
      roleId: createdRoleId,
      positionInRowLevelPermissionPredicateGroup: 0,
    });
  });

  it('should upsert predicate groups with logical operators', async () => {
    const input: UpsertRowLevelPermissionRulesInput = {
      roleId: createdRoleId,
      objectMetadataId: companyObjectMetadataId,
      rules: [
        {
          predicateGroups: [
            {
              logicalOperator:
                RowLevelPermissionPredicateGroupLogicalOperator.AND,
              position: 0,
            },
          ],
        },
      ],
    };

    const { data } = await upsertRowLevelPermissionRules({
      expectToFail: false,
      input,
    });

    expect(data.upsertRowLevelPermissionRules.predicateGroups).toHaveLength(1);
    expect(data.upsertRowLevelPermissionRules.predicateGroups[0]).toMatchObject(
      {
        id: expect.any(String),
        objectMetadataId: companyObjectMetadataId,
        logicalOperator: RowLevelPermissionPredicateGroupLogicalOperator.AND,
        roleId: createdRoleId,
        parentRowLevelPermissionPredicateGroupId: null,
        rowLevelPermissionRuleId:
          data.upsertRowLevelPermissionRules.rules[0].id,
      },
    );
  });

  it('should upsert nested predicate groups', async () => {
    const { data: parentData } = await upsertRowLevelPermissionRules({
      expectToFail: false,
      input: {
        roleId: createdRoleId,
        objectMetadataId: companyObjectMetadataId,
        rules: [
          {
            predicateGroups: [
              {
                logicalOperator:
                  RowLevelPermissionPredicateGroupLogicalOperator.AND,
              },
            ],
          },
        ],
      },
    });

    const ruleId = parentData.upsertRowLevelPermissionRules.rules[0]?.id;
    const parentGroupId =
      parentData.upsertRowLevelPermissionRules.predicateGroups[0]?.id;

    jestExpectToBeDefined(ruleId);
    jestExpectToBeDefined(parentGroupId);

    const { data: nestedData } = await upsertRowLevelPermissionRules({
      expectToFail: false,
      input: {
        roleId: createdRoleId,
        objectMetadataId: companyObjectMetadataId,
        rules: [
          {
            id: ruleId,
            predicateGroups: [
              {
                id: parentGroupId,
                logicalOperator:
                  RowLevelPermissionPredicateGroupLogicalOperator.AND,
                predicateGroups: [
                  {
                    logicalOperator:
                      RowLevelPermissionPredicateGroupLogicalOperator.OR,
                  },
                ],
              },
            ],
          },
        ],
      },
    });

    expect(
      nestedData.upsertRowLevelPermissionRules.predicateGroups,
    ).toHaveLength(2);

    const childGroup =
      nestedData.upsertRowLevelPermissionRules.predicateGroups.find(
        (group) =>
          group.parentRowLevelPermissionPredicateGroupId === parentGroupId,
      );

    expect(childGroup).toBeDefined();
    expect(childGroup?.logicalOperator).toBe(
      RowLevelPermissionPredicateGroupLogicalOperator.OR,
    );
  });

  it('should update existing predicates and groups', async () => {
    const { data: createData } = await upsertRowLevelPermissionRules({
      expectToFail: false,
      input: {
        roleId: createdRoleId,
        objectMetadataId: companyObjectMetadataId,
        rules: [
          {
            predicates: [
              {
                fieldMetadataId: companyNameFieldMetadataId,
                operand: RowLevelPermissionPredicateOperand.CONTAINS,
              },
            ],
            predicateGroups: [
              {
                logicalOperator:
                  RowLevelPermissionPredicateGroupLogicalOperator.AND,
              },
            ],
          },
        ],
      },
    });

    const createdRuleId = createData.upsertRowLevelPermissionRules.rules[0]?.id;
    const createdPredicateId =
      createData.upsertRowLevelPermissionRules.predicates[0]?.id;
    const createdGroupId =
      createData.upsertRowLevelPermissionRules.predicateGroups[0]?.id;

    jestExpectToBeDefined(createdRuleId);
    jestExpectToBeDefined(createdPredicateId);
    jestExpectToBeDefined(createdGroupId);

    const { data: updateData } = await upsertRowLevelPermissionRules({
      expectToFail: false,
      input: {
        roleId: createdRoleId,
        objectMetadataId: companyObjectMetadataId,
        rules: [
          {
            id: createdRuleId,
            predicates: [
              {
                id: createdPredicateId,
                fieldMetadataId: companyNameFieldMetadataId,
                operand: RowLevelPermissionPredicateOperand.DOES_NOT_CONTAIN,
                value: 'Updated Value',
              },
            ],
            predicateGroups: [
              {
                id: createdGroupId,
                logicalOperator:
                  RowLevelPermissionPredicateGroupLogicalOperator.OR,
              },
            ],
          },
        ],
      },
    });

    expect(updateData.upsertRowLevelPermissionRules.rules).toEqual([
      expect.objectContaining({ id: createdRuleId }),
    ]);
    expect(updateData.upsertRowLevelPermissionRules.predicates).toHaveLength(1);
    expect(
      updateData.upsertRowLevelPermissionRules.predicates[0],
    ).toMatchObject({
      id: createdPredicateId,
      operand: RowLevelPermissionPredicateOperand.DOES_NOT_CONTAIN,
      value: 'Updated Value',
    });
    expect(
      updateData.upsertRowLevelPermissionRules.predicateGroups,
    ).toHaveLength(1);
    expect(
      updateData.upsertRowLevelPermissionRules.predicateGroups[0],
    ).toMatchObject({
      id: createdGroupId,
      logicalOperator: RowLevelPermissionPredicateGroupLogicalOperator.OR,
    });
  });

  it('should clear the rule operations an update omits and default create to update', async () => {
    const ruleId = v4();
    const upsertRule = async (
      ruleOperations: Omit<
        UpsertRowLevelPermissionRulesInput['rules'][number],
        'id' | 'predicates' | 'predicateGroups'
      >,
    ) => {
      const { data } = await upsertRowLevelPermissionRules({
        expectToFail: false,
        input: {
          roleId: createdRoleId,
          objectMetadataId: companyObjectMetadataId,
          rules: [
            {
              id: ruleId,
              ...ruleOperations,
              predicateGroups: [
                {
                  logicalOperator:
                    RowLevelPermissionPredicateGroupLogicalOperator.AND,
                },
              ],
            },
          ],
        },
      });

      return data.upsertRowLevelPermissionRules.rules[0];
    };

    expect(
      await upsertRule({
        canReadRecords: true,
        canUpdateRecords: true,
        canSoftDeleteRecords: true,
        canDestroyRecords: true,
      }),
    ).toMatchObject({
      id: ruleId,
      canReadRecords: true,
      canCreateRecords: true,
      canUpdateRecords: true,
      canSoftDeleteRecords: true,
      canDestroyRecords: true,
    });

    expect(await upsertRule({ canReadRecords: true })).toMatchObject({
      id: ruleId,
      canReadRecords: true,
      canCreateRecords: false,
      canUpdateRecords: false,
      canSoftDeleteRecords: false,
      canDestroyRecords: false,
    });
  });

  it('should delete rules, predicates and groups by not including them', async () => {
    const predicateInput = {
      fieldMetadataId: companyNameFieldMetadataId,
      operand: RowLevelPermissionPredicateOperand.CONTAINS,
    };
    const predicateGroupInput = {
      logicalOperator: RowLevelPermissionPredicateGroupLogicalOperator.AND,
    };
    const createInput: UpsertRowLevelPermissionRulesInput = {
      roleId: createdRoleId,
      objectMetadataId: companyObjectMetadataId,
      rules: [
        {
          predicates: [predicateInput],
          predicateGroups: [predicateGroupInput],
        },
      ],
    };

    const { data: createData } = await upsertRowLevelPermissionRules({
      expectToFail: false,
      input: createInput,
    });

    const createdRuleId = createData.upsertRowLevelPermissionRules.rules[0].id;
    const createdPredicateId =
      createData.upsertRowLevelPermissionRules.predicates[0].id;
    const createdPredicateGroupId =
      createData.upsertRowLevelPermissionRules.predicateGroups[0].id;

    const { data: deleteData } = await upsertRowLevelPermissionRules({
      expectToFail: false,
      input: {
        roleId: createdRoleId,
        objectMetadataId: companyObjectMetadataId,
        rules: [],
      },
    });

    expect(deleteData.upsertRowLevelPermissionRules.rules).toHaveLength(0);
    expect(deleteData.upsertRowLevelPermissionRules.predicates).toHaveLength(0);
    expect(
      deleteData.upsertRowLevelPermissionRules.predicateGroups,
    ).toHaveLength(0);

    const { data: recreateData } = await upsertRowLevelPermissionRules({
      expectToFail: false,
      input: {
        ...createInput,
        rules: [
          {
            id: createdRuleId,
            predicates: [{ ...predicateInput, id: createdPredicateId }],
            predicateGroups: [
              { ...predicateGroupInput, id: createdPredicateGroupId },
            ],
          },
        ],
      },
    });

    expect(
      recreateData.upsertRowLevelPermissionRules.rules.map(({ id }) => id),
    ).toEqual([createdRuleId]);
    expect(
      recreateData.upsertRowLevelPermissionRules.predicates.map(({ id }) => id),
    ).toEqual([createdPredicateId]);
    expect(
      recreateData.upsertRowLevelPermissionRules.predicateGroups.map(
        ({ id }) => id,
      ),
    ).toEqual([createdPredicateGroupId]);
  });

  it('should add a predicate to an existing predicate group', async () => {
    const { data: groupData } = await upsertRowLevelPermissionRules({
      expectToFail: false,
      input: {
        roleId: createdRoleId,
        objectMetadataId: companyObjectMetadataId,
        rules: [
          {
            predicateGroups: [
              {
                logicalOperator:
                  RowLevelPermissionPredicateGroupLogicalOperator.AND,
              },
            ],
          },
        ],
      },
    });

    const ruleId = groupData.upsertRowLevelPermissionRules.rules[0]?.id;
    const groupId =
      groupData.upsertRowLevelPermissionRules.predicateGroups[0]?.id;

    jestExpectToBeDefined(ruleId);
    jestExpectToBeDefined(groupId);

    const { data: predicateData } = await upsertRowLevelPermissionRules({
      expectToFail: false,
      input: {
        roleId: createdRoleId,
        objectMetadataId: companyObjectMetadataId,
        rules: [
          {
            id: ruleId,
            predicateGroups: [
              {
                id: groupId,
                logicalOperator:
                  RowLevelPermissionPredicateGroupLogicalOperator.AND,
                predicates: [
                  {
                    fieldMetadataId: companyNameFieldMetadataId,
                    operand: RowLevelPermissionPredicateOperand.CONTAINS,
                    position: 0,
                  },
                ],
              },
            ],
          },
        ],
      },
    });

    expect(predicateData.upsertRowLevelPermissionRules.predicates).toHaveLength(
      1,
    );
    expect(
      predicateData.upsertRowLevelPermissionRules.predicates[0],
    ).toMatchObject({
      rowLevelPermissionPredicateGroupId: groupId,
      rowLevelPermissionRuleId: ruleId,
      positionInRowLevelPermissionPredicateGroup: 0,
    });
  });

  it('should create a group and its predicates in a single call', async () => {
    const groupId = v4();

    const { data } = await upsertRowLevelPermissionRules({
      expectToFail: false,
      input: {
        roleId: createdRoleId,
        objectMetadataId: companyObjectMetadataId,
        rules: [
          {
            predicateGroups: [
              {
                id: groupId,
                logicalOperator:
                  RowLevelPermissionPredicateGroupLogicalOperator.AND,
                predicates: [
                  {
                    fieldMetadataId: companyNameFieldMetadataId,
                    operand: RowLevelPermissionPredicateOperand.CONTAINS,
                    position: 0,
                  },
                ],
              },
            ],
          },
        ],
      },
    });

    expect(data.upsertRowLevelPermissionRules.predicates).toHaveLength(1);
    expect(data.upsertRowLevelPermissionRules.predicateGroups).toHaveLength(1);
    expect(data.upsertRowLevelPermissionRules.predicateGroups[0]).toMatchObject(
      {
        id: groupId,
        objectMetadataId: companyObjectMetadataId,
        logicalOperator: RowLevelPermissionPredicateGroupLogicalOperator.AND,
      },
    );
    expect(data.upsertRowLevelPermissionRules.predicates[0]).toMatchObject({
      fieldMetadataId: companyNameFieldMetadataId,
      rowLevelPermissionPredicateGroupId: groupId,
      positionInRowLevelPermissionPredicateGroup: 0,
    });
  });

  it('should create nested parent-child groups in a single call', async () => {
    const parentGroupId = v4();
    const childGroupId = v4();

    const { data } = await upsertRowLevelPermissionRules({
      expectToFail: false,
      input: {
        roleId: createdRoleId,
        objectMetadataId: companyObjectMetadataId,
        rules: [
          {
            predicateGroups: [
              {
                id: parentGroupId,
                logicalOperator:
                  RowLevelPermissionPredicateGroupLogicalOperator.AND,
                predicateGroups: [
                  {
                    id: childGroupId,
                    logicalOperator:
                      RowLevelPermissionPredicateGroupLogicalOperator.OR,
                  },
                ],
              },
            ],
          },
        ],
      },
    });

    expect(data.upsertRowLevelPermissionRules.predicateGroups).toHaveLength(2);

    const parentGroup = data.upsertRowLevelPermissionRules.predicateGroups.find(
      (group) => group.id === parentGroupId,
    );
    const childGroup = data.upsertRowLevelPermissionRules.predicateGroups.find(
      (group) => group.id === childGroupId,
    );

    expect(parentGroup).toBeDefined();
    expect(parentGroup?.parentRowLevelPermissionPredicateGroupId).toBeNull();
    expect(parentGroup?.logicalOperator).toBe(
      RowLevelPermissionPredicateGroupLogicalOperator.AND,
    );

    expect(childGroup).toBeDefined();
    expect(childGroup?.parentRowLevelPermissionPredicateGroupId).toBe(
      parentGroupId,
    );
    expect(childGroup?.logicalOperator).toBe(
      RowLevelPermissionPredicateGroupLogicalOperator.OR,
    );
  });
});
