import { findManyObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/find-many-object-metadata.util';
import { createOneRole } from 'test/integration/metadata/suites/role/utils/create-one-role.util';
import { deleteOneRole } from 'test/integration/metadata/suites/role/utils/delete-one-role.util';
import { upsertRowLevelPermissionPredicates } from 'test/integration/metadata/suites/row-level-permission-predicate/utils/upsert-row-level-permission-predicates.util';
import { updateFeatureFlag } from 'test/integration/metadata/suites/utils/update-feature-flag.util';
import { jestExpectToBeDefined } from 'test/utils/jest-expect-to-be-defined.util.test';
import {
  RowLevelPermissionPredicateGroupLogicalOperator,
  RowLevelPermissionPredicateOperand,
} from 'twenty-shared/types';
import { v4 } from 'uuid';

import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';
import { type UpsertRowLevelPermissionPredicatesInput } from 'src/engine/metadata-modules/row-level-permission-predicate/dtos/inputs/upsert-row-level-permission-predicates.input';

describe('Row Level Permission Predicate upsert should succeed', () => {
  let companyObjectMetadataId: string;
  let companyNameFieldMetadataId: string;
  let createdRoleId: string;

  beforeAll(async () => {
    await updateFeatureFlag({
      featureFlag: FeatureFlagKey.IS_ROW_LEVEL_PERMISSION_PREDICATES_ENABLED,
      value: true,
      expectToFail: false,
    });

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
    await updateFeatureFlag({
      featureFlag: FeatureFlagKey.IS_ROW_LEVEL_PERMISSION_PREDICATES_ENABLED,
      value: false,
      expectToFail: false,
    });

    if (createdRoleId) {
      await deleteOneRole({
        expectToFail: false,
        input: { idToDelete: createdRoleId },
      });
    }
  });

  it('should upsert predicates and groups with minimal input', async () => {
    const input: UpsertRowLevelPermissionPredicatesInput = {
      roleId: createdRoleId,
      objectMetadataId: companyObjectMetadataId,
      predicates: [
        {
          fieldMetadataId: companyNameFieldMetadataId,
          operand: RowLevelPermissionPredicateOperand.CONTAINS,
        },
      ],
      predicateGroups: [],
    };

    const { data } = await upsertRowLevelPermissionPredicates({
      expectToFail: false,
      input,
    });

    expect(data.upsertRowLevelPermissionPredicates).toBeDefined();
    expect(data.upsertRowLevelPermissionPredicates.predicates).toHaveLength(1);
    expect(
      data.upsertRowLevelPermissionPredicates.predicateGroups,
    ).toHaveLength(0);

    expect(data.upsertRowLevelPermissionPredicates.predicates[0]).toMatchObject(
      {
        id: expect.any(String),
        fieldMetadataId: companyNameFieldMetadataId,
        objectMetadataId: companyObjectMetadataId,
        operand: RowLevelPermissionPredicateOperand.CONTAINS,
        roleId: createdRoleId,
        rowLevelPermissionPredicateGroupId: null,
      },
    );
  });

  it('should upsert predicates with all fields', async () => {
    const input: UpsertRowLevelPermissionPredicatesInput = {
      roleId: createdRoleId,
      objectMetadataId: companyObjectMetadataId,
      predicates: [
        {
          fieldMetadataId: companyNameFieldMetadataId,
          operand: RowLevelPermissionPredicateOperand.IS,
          value: 'Test Company',
          subFieldName: null,
          workspaceMemberFieldMetadataId: null,
          workspaceMemberSubFieldName: null,
          rowLevelPermissionPredicateGroupId: null,
          positionInRowLevelPermissionPredicateGroup: 0,
        },
      ],
      predicateGroups: [],
    };

    const { data } = await upsertRowLevelPermissionPredicates({
      expectToFail: false,
      input,
    });

    expect(data.upsertRowLevelPermissionPredicates.predicates).toHaveLength(1);
    expect(data.upsertRowLevelPermissionPredicates.predicates[0]).toMatchObject(
      {
        id: expect.any(String),
        fieldMetadataId: companyNameFieldMetadataId,
        objectMetadataId: companyObjectMetadataId,
        operand: RowLevelPermissionPredicateOperand.IS,
        value: 'Test Company',
        roleId: createdRoleId,
      },
    );
  });

  it('should upsert predicate groups with logical operators', async () => {
    const input: UpsertRowLevelPermissionPredicatesInput = {
      roleId: createdRoleId,
      objectMetadataId: companyObjectMetadataId,
      predicates: [],
      predicateGroups: [
        {
          objectMetadataId: companyObjectMetadataId,
          logicalOperator: RowLevelPermissionPredicateGroupLogicalOperator.AND,
          parentRowLevelPermissionPredicateGroupId: null,
          positionInRowLevelPermissionPredicateGroup: 0,
        },
      ],
    };

    const { data } = await upsertRowLevelPermissionPredicates({
      expectToFail: false,
      input,
    });

    expect(
      data.upsertRowLevelPermissionPredicates.predicateGroups,
    ).toHaveLength(1);
    expect(
      data.upsertRowLevelPermissionPredicates.predicateGroups[0],
    ).toMatchObject({
      id: expect.any(String),
      objectMetadataId: companyObjectMetadataId,
      logicalOperator: RowLevelPermissionPredicateGroupLogicalOperator.AND,
      roleId: createdRoleId,
      parentRowLevelPermissionPredicateGroupId: null,
    });
  });

  it('should upsert nested predicate groups', async () => {
    const input: UpsertRowLevelPermissionPredicatesInput = {
      roleId: createdRoleId,
      objectMetadataId: companyObjectMetadataId,
      predicates: [],
      predicateGroups: [
        {
          objectMetadataId: companyObjectMetadataId,
          logicalOperator: RowLevelPermissionPredicateGroupLogicalOperator.AND,
          parentRowLevelPermissionPredicateGroupId: null,
        },
      ],
    };

    const { data: parentData } = await upsertRowLevelPermissionPredicates({
      expectToFail: false,
      input,
    });

    const parentGroupId =
      parentData.upsertRowLevelPermissionPredicates.predicateGroups[0]?.id;

    jestExpectToBeDefined(parentGroupId);

    const nestedInput: UpsertRowLevelPermissionPredicatesInput = {
      roleId: createdRoleId,
      objectMetadataId: companyObjectMetadataId,
      predicates: [],
      predicateGroups: [
        {
          id: parentGroupId,
          objectMetadataId: companyObjectMetadataId,
          logicalOperator: RowLevelPermissionPredicateGroupLogicalOperator.AND,
          parentRowLevelPermissionPredicateGroupId: null,
        },
        {
          objectMetadataId: companyObjectMetadataId,
          logicalOperator: RowLevelPermissionPredicateGroupLogicalOperator.OR,
          parentRowLevelPermissionPredicateGroupId: parentGroupId,
        },
      ],
    };

    const { data: nestedData } = await upsertRowLevelPermissionPredicates({
      expectToFail: false,
      input: nestedInput,
    });

    expect(
      nestedData.upsertRowLevelPermissionPredicates.predicateGroups,
    ).toHaveLength(2);

    const childGroup =
      nestedData.upsertRowLevelPermissionPredicates.predicateGroups.find(
        (group) =>
          group.parentRowLevelPermissionPredicateGroupId === parentGroupId,
      );

    expect(childGroup).toBeDefined();
    expect(childGroup?.logicalOperator).toBe(
      RowLevelPermissionPredicateGroupLogicalOperator.OR,
    );
  });

  it('should update existing predicates and groups', async () => {
    const createInput: UpsertRowLevelPermissionPredicatesInput = {
      roleId: createdRoleId,
      objectMetadataId: companyObjectMetadataId,
      predicates: [
        {
          fieldMetadataId: companyNameFieldMetadataId,
          operand: RowLevelPermissionPredicateOperand.CONTAINS,
        },
      ],
      predicateGroups: [
        {
          objectMetadataId: companyObjectMetadataId,
          logicalOperator: RowLevelPermissionPredicateGroupLogicalOperator.AND,
        },
      ],
    };

    const { data: createData } = await upsertRowLevelPermissionPredicates({
      expectToFail: false,
      input: createInput,
    });

    const createdPredicateId =
      createData.upsertRowLevelPermissionPredicates.predicates[0]?.id;
    const createdGroupId =
      createData.upsertRowLevelPermissionPredicates.predicateGroups[0]?.id;

    jestExpectToBeDefined(createdPredicateId);
    jestExpectToBeDefined(createdGroupId);

    const updateInput: UpsertRowLevelPermissionPredicatesInput = {
      roleId: createdRoleId,
      objectMetadataId: companyObjectMetadataId,
      predicates: [
        {
          id: createdPredicateId,
          fieldMetadataId: companyNameFieldMetadataId,
          operand: RowLevelPermissionPredicateOperand.IS,
          value: 'Updated Value',
        },
      ],
      predicateGroups: [
        {
          id: createdGroupId,
          objectMetadataId: companyObjectMetadataId,
          logicalOperator: RowLevelPermissionPredicateGroupLogicalOperator.OR,
        },
      ],
    };

    const { data: updateData } = await upsertRowLevelPermissionPredicates({
      expectToFail: false,
      input: updateInput,
    });

    expect(
      updateData.upsertRowLevelPermissionPredicates.predicates,
    ).toHaveLength(1);
    expect(
      updateData.upsertRowLevelPermissionPredicates.predicates[0],
    ).toMatchObject({
      id: createdPredicateId,
      operand: RowLevelPermissionPredicateOperand.IS,
      value: 'Updated Value',
    });

    expect(
      updateData.upsertRowLevelPermissionPredicates.predicateGroups,
    ).toHaveLength(1);
    expect(
      updateData.upsertRowLevelPermissionPredicates.predicateGroups[0],
    ).toMatchObject({
      id: createdGroupId,
      logicalOperator: RowLevelPermissionPredicateGroupLogicalOperator.OR,
    });
  });

  it('should delete predicates and groups by not including them', async () => {
    const createInput: UpsertRowLevelPermissionPredicatesInput = {
      roleId: createdRoleId,
      objectMetadataId: companyObjectMetadataId,
      predicates: [
        {
          fieldMetadataId: companyNameFieldMetadataId,
          operand: RowLevelPermissionPredicateOperand.CONTAINS,
        },
      ],
      predicateGroups: [
        {
          objectMetadataId: companyObjectMetadataId,
          logicalOperator: RowLevelPermissionPredicateGroupLogicalOperator.AND,
        },
      ],
    };

    await upsertRowLevelPermissionPredicates({
      expectToFail: false,
      input: createInput,
    });

    const deleteInput: UpsertRowLevelPermissionPredicatesInput = {
      roleId: createdRoleId,
      objectMetadataId: companyObjectMetadataId,
      predicates: [],
      predicateGroups: [],
    };

    const { data: deleteData } = await upsertRowLevelPermissionPredicates({
      expectToFail: false,
      input: deleteInput,
    });

    expect(
      deleteData.upsertRowLevelPermissionPredicates.predicates,
    ).toHaveLength(0);
    expect(
      deleteData.upsertRowLevelPermissionPredicates.predicateGroups,
    ).toHaveLength(0);
  });

  it('should upsert predicates with predicate groups', async () => {
    const input: UpsertRowLevelPermissionPredicatesInput = {
      roleId: createdRoleId,
      objectMetadataId: companyObjectMetadataId,
      predicates: [],
      predicateGroups: [
        {
          objectMetadataId: companyObjectMetadataId,
          logicalOperator: RowLevelPermissionPredicateGroupLogicalOperator.AND,
        },
      ],
    };

    const { data: groupData } = await upsertRowLevelPermissionPredicates({
      expectToFail: false,
      input,
    });

    const groupId =
      groupData.upsertRowLevelPermissionPredicates.predicateGroups[0]?.id;

    jestExpectToBeDefined(groupId);

    const predicateInput: UpsertRowLevelPermissionPredicatesInput = {
      roleId: createdRoleId,
      objectMetadataId: companyObjectMetadataId,
      predicates: [
        {
          fieldMetadataId: companyNameFieldMetadataId,
          operand: RowLevelPermissionPredicateOperand.CONTAINS,
          rowLevelPermissionPredicateGroupId: groupId,
          positionInRowLevelPermissionPredicateGroup: 0,
        },
      ],
      predicateGroups: [
        {
          id: groupId,
          objectMetadataId: companyObjectMetadataId,
          logicalOperator: RowLevelPermissionPredicateGroupLogicalOperator.AND,
        },
      ],
    };

    const { data: predicateData } = await upsertRowLevelPermissionPredicates({
      expectToFail: false,
      input: predicateInput,
    });

    expect(
      predicateData.upsertRowLevelPermissionPredicates.predicates,
    ).toHaveLength(1);
    expect(
      predicateData.upsertRowLevelPermissionPredicates.predicates[0],
    ).toMatchObject({
      rowLevelPermissionPredicateGroupId: groupId,
      positionInRowLevelPermissionPredicateGroup: 0,
    });
  });

  it('should create groups and predicates referencing those groups in a single call', async () => {
    const groupId = v4();

    const input: UpsertRowLevelPermissionPredicatesInput = {
      roleId: createdRoleId,
      objectMetadataId: companyObjectMetadataId,
      predicates: [
        {
          fieldMetadataId: companyNameFieldMetadataId,
          operand: RowLevelPermissionPredicateOperand.CONTAINS,
          rowLevelPermissionPredicateGroupId: groupId,
          positionInRowLevelPermissionPredicateGroup: 0,
        },
      ],
      predicateGroups: [
        {
          id: groupId,
          objectMetadataId: companyObjectMetadataId,
          logicalOperator: RowLevelPermissionPredicateGroupLogicalOperator.AND,
        },
      ],
    };

    const { data } = await upsertRowLevelPermissionPredicates({
      expectToFail: false,
      input,
    });

    expect(data.upsertRowLevelPermissionPredicates.predicates).toHaveLength(1);
    expect(
      data.upsertRowLevelPermissionPredicates.predicateGroups,
    ).toHaveLength(1);
    expect(
      data.upsertRowLevelPermissionPredicates.predicateGroups[0],
    ).toMatchObject({
      id: groupId,
      objectMetadataId: companyObjectMetadataId,
      logicalOperator: RowLevelPermissionPredicateGroupLogicalOperator.AND,
    });
    expect(data.upsertRowLevelPermissionPredicates.predicates[0]).toMatchObject(
      {
        fieldMetadataId: companyNameFieldMetadataId,
        rowLevelPermissionPredicateGroupId: groupId,
        positionInRowLevelPermissionPredicateGroup: 0,
      },
    );
  });

  it('should create nested parent-child groups in a single call', async () => {
    const parentGroupId = v4();
    const childGroupId = v4();

    const input: UpsertRowLevelPermissionPredicatesInput = {
      roleId: createdRoleId,
      objectMetadataId: companyObjectMetadataId,
      predicates: [],
      predicateGroups: [
        {
          id: parentGroupId,
          objectMetadataId: companyObjectMetadataId,
          logicalOperator: RowLevelPermissionPredicateGroupLogicalOperator.AND,
          parentRowLevelPermissionPredicateGroupId: null,
        },
        {
          id: childGroupId,
          objectMetadataId: companyObjectMetadataId,
          logicalOperator: RowLevelPermissionPredicateGroupLogicalOperator.OR,
          parentRowLevelPermissionPredicateGroupId: parentGroupId,
        },
      ],
    };

    const { data } = await upsertRowLevelPermissionPredicates({
      expectToFail: false,
      input,
    });

    expect(
      data.upsertRowLevelPermissionPredicates.predicateGroups,
    ).toHaveLength(2);

    const parentGroup =
      data.upsertRowLevelPermissionPredicates.predicateGroups.find(
        (group: { id: string }) => group.id === parentGroupId,
      );

    const childGroup =
      data.upsertRowLevelPermissionPredicates.predicateGroups.find(
        (group: { id: string }) => group.id === childGroupId,
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
