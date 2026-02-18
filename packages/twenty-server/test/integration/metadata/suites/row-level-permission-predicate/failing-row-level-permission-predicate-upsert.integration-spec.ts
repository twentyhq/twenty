import { expectOneNotInternalServerErrorSnapshot } from 'test/integration/graphql/utils/expect-one-not-internal-server-error-snapshot.util';
import { findManyObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/find-many-object-metadata.util';
import { createOneRole } from 'test/integration/metadata/suites/role/utils/create-one-role.util';
import { deleteOneRole } from 'test/integration/metadata/suites/role/utils/delete-one-role.util';
import { upsertRowLevelPermissionPredicates } from 'test/integration/metadata/suites/row-level-permission-predicate/utils/upsert-row-level-permission-predicates.util';
import { updateFeatureFlag } from 'test/integration/metadata/suites/utils/update-feature-flag.util';
import { jestExpectToBeDefined } from 'test/utils/jest-expect-to-be-defined.util.test';
import {
  eachTestingContextFilter,
  type EachTestingContext,
} from 'twenty-shared/testing';
import {
  RowLevelPermissionPredicateGroupLogicalOperator,
  RowLevelPermissionPredicateOperand,
} from 'twenty-shared/types';
import { v4 } from 'uuid';

import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';
import { type UpsertRowLevelPermissionPredicatesInput } from 'src/engine/metadata-modules/row-level-permission-predicate/dtos/inputs/upsert-row-level-permission-predicates.input';

type TestSetup = {
  createdRoleId: string;
  companyObjectMetadataId: string;
  companyNameFieldMetadataId: string;
};

type TestContext = {
  input: (testSetup: TestSetup) => UpsertRowLevelPermissionPredicatesInput;
};

const failingRowLevelPermissionPredicateUpsertTestCases: EachTestingContext<TestContext>[] =
  [
    {
      title: 'when roleId is not a valid UUID',
      context: {
        input: (testSetup) => ({
          roleId: 'invalid-uuid',
          objectMetadataId: testSetup.companyObjectMetadataId,
          predicates: [],
          predicateGroups: [],
        }),
      },
    },
    {
      title: 'when objectMetadataId is not a valid UUID',
      context: {
        input: (testSetup) => ({
          roleId: testSetup.createdRoleId,
          objectMetadataId: 'invalid-uuid',
          predicates: [],
          predicateGroups: [],
        }),
      },
    },
    {
      title: 'when fieldMetadataId in predicate is not a valid UUID',
      context: {
        input: (testSetup) => ({
          roleId: testSetup.createdRoleId,
          objectMetadataId: testSetup.companyObjectMetadataId,
          predicates: [
            {
              fieldMetadataId: 'invalid-uuid',
              operand: RowLevelPermissionPredicateOperand.CONTAINS,
            },
          ],
          predicateGroups: [],
        }),
      },
    },
    {
      title: 'when fieldMetadataId in predicate does not exist',
      context: {
        input: (testSetup) => ({
          roleId: testSetup.createdRoleId,
          objectMetadataId: testSetup.companyObjectMetadataId,
          predicates: [
            {
              fieldMetadataId: v4(),
              operand: RowLevelPermissionPredicateOperand.CONTAINS,
            },
          ],
          predicateGroups: [],
        }),
      },
    },
    {
      title:
        'when rowLevelPermissionPredicateGroupId in predicate does not exist',
      context: {
        input: (testSetup) => ({
          roleId: testSetup.createdRoleId,
          objectMetadataId: testSetup.companyObjectMetadataId,
          predicates: [
            {
              fieldMetadataId: testSetup.companyNameFieldMetadataId,
              operand: RowLevelPermissionPredicateOperand.CONTAINS,
              rowLevelPermissionPredicateGroupId: v4(),
            },
          ],
          predicateGroups: [],
        }),
      },
    },
    {
      title:
        'when parentRowLevelPermissionPredicateGroupId in group does not exist',
      context: {
        input: (testSetup) => ({
          roleId: testSetup.createdRoleId,
          objectMetadataId: testSetup.companyObjectMetadataId,
          predicates: [],
          predicateGroups: [
            {
              objectMetadataId: testSetup.companyObjectMetadataId,
              logicalOperator:
                RowLevelPermissionPredicateGroupLogicalOperator.AND,
              parentRowLevelPermissionPredicateGroupId: v4(),
            },
          ],
        }),
      },
    },
    {
      title: 'when objectMetadataId in predicate group is not a valid UUID',
      context: {
        input: (testSetup) => ({
          roleId: testSetup.createdRoleId,
          objectMetadataId: testSetup.companyObjectMetadataId,
          predicates: [],
          predicateGroups: [
            {
              objectMetadataId: 'invalid-uuid',
              logicalOperator:
                RowLevelPermissionPredicateGroupLogicalOperator.AND,
            },
          ],
        }),
      },
    },
    {
      title: 'when objectMetadataId in predicate group does not exist',
      context: {
        input: (testSetup) => ({
          roleId: testSetup.createdRoleId,
          objectMetadataId: testSetup.companyObjectMetadataId,
          predicates: [],
          predicateGroups: [
            {
              objectMetadataId: v4(),
              logicalOperator:
                RowLevelPermissionPredicateGroupLogicalOperator.AND,
            },
          ],
        }),
      },
    },
  ];

describe('Row Level Permission Predicate upsert should fail', () => {
  let createdRoleId: string;
  let companyObjectMetadataId: string;
  let companyNameFieldMetadataId: string;

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
        label: 'Test Role For Failing RLS Predicates',
        description: 'A role for failing RLS predicate testing',
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

  it.each(
    eachTestingContextFilter(failingRowLevelPermissionPredicateUpsertTestCases),
  )('$title', async ({ context }) => {
    const { errors } = await upsertRowLevelPermissionPredicates({
      expectToFail: true,
      input: context.input({
        createdRoleId,
        companyObjectMetadataId,
        companyNameFieldMetadataId,
      }),
    });

    expectOneNotInternalServerErrorSnapshot({
      errors,
    });
  });
});
