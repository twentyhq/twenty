import { expectOneNotInternalServerErrorSnapshot } from 'test/integration/graphql/utils/expect-one-not-internal-server-error-snapshot.util';
import { findManyObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/find-many-object-metadata.util';
import { createOneRole } from 'test/integration/metadata/suites/role/utils/create-one-role.util';
import { deleteOneRole } from 'test/integration/metadata/suites/role/utils/delete-one-role.util';
import { findOneRoleByLabel } from 'test/integration/metadata/suites/role/utils/find-one-role-by-label.util';
import {
  cleanupRolesPermissionHolder,
  type RolesPermissionHolderSetup,
  setupRolesPermissionHolder,
} from 'test/integration/metadata/suites/row-level-permission-predicate/utils/setup-roles-permission-holder.util';
import { upsertRowLevelPermissionPredicates } from 'test/integration/metadata/suites/row-level-permission-predicate/utils/upsert-row-level-permission-predicates.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { jestExpectToBeDefined } from 'test/utils/jest-expect-to-be-defined.util.test';
import {
  eachTestingContextFilter,
  type EachTestingContext,
} from 'twenty-shared/testing';
import {
  RowLevelPermissionPredicateGroupLogicalOperator,
  RowLevelPermissionPredicateOperand,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';

import { type EnterprisePlanService } from 'src/engine/core-modules/enterprise/services/enterprise-plan.service';
import { ErrorCode } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { type UpsertRowLevelPermissionPredicatesInput } from 'src/engine/metadata-modules/row-level-permission-predicate/dtos/inputs/upsert-row-level-permission-predicates.input';
import { RowLevelPermissionPredicateExceptionCode } from 'src/engine/metadata-modules/row-level-permission-predicate/exceptions/row-level-permission-predicate.exception';

const RESTRICTED_ROLE_LABEL = 'Test Role For RLS Upsert Without Entitlement';
const PREDICATE_ID = v4();
const PREDICATE_GROUP_ID = v4();

type TestSetup = {
  restrictedRoleId: string;
  companyObjectMetadataId: string;
  companyNameFieldMetadataId: string;
};

type TestContext = {
  token: string;
  input: (testSetup: TestSetup) => UpsertRowLevelPermissionPredicatesInput;
  expectedSubCode: keyof typeof RowLevelPermissionPredicateExceptionCode;
};

const failingRowLevelPermissionPredicateUpsertWithoutEntitlementTestCases: EachTestingContext<TestContext>[] =
  [
    {
      title: 'when an Admin adds a predicate in a group',
      context: {
        token: APPLE_JANE_ADMIN_ACCESS_TOKEN,
        input: (testSetup) => {
          const predicateGroupId = v4();

          return {
            roleId: testSetup.restrictedRoleId,
            objectMetadataId: testSetup.companyObjectMetadataId,
            predicates: [
              {
                fieldMetadataId: testSetup.companyNameFieldMetadataId,
                operand: RowLevelPermissionPredicateOperand.CONTAINS,
                value: 'Microsoft',
                rowLevelPermissionPredicateGroupId: predicateGroupId,
                positionInRowLevelPermissionPredicateGroup: 0,
              },
            ],
            predicateGroups: [
              {
                id: predicateGroupId,
                objectMetadataId: testSetup.companyObjectMetadataId,
                logicalOperator:
                  RowLevelPermissionPredicateGroupLogicalOperator.AND,
              },
            ],
          };
        },
        expectedSubCode:
          RowLevelPermissionPredicateExceptionCode.ROW_LEVEL_PERMISSION_FEATURE_DISABLED,
      },
    },
    {
      title:
        'when a non-Admin member with the roles permission clears the rules',
      context: {
        token: APPLE_JONY_MEMBER_ACCESS_TOKEN,
        input: (testSetup) => ({
          roleId: testSetup.restrictedRoleId,
          objectMetadataId: testSetup.companyObjectMetadataId,
          predicates: [],
          predicateGroups: [],
        }),
        expectedSubCode:
          RowLevelPermissionPredicateExceptionCode.ROW_LEVEL_PERMISSION_REMOVAL_REQUIRES_ADMIN,
      },
    },
    {
      title: 'when an API key clears the rules',
      context: {
        token: API_KEY_ACCESS_TOKEN,
        input: (testSetup) => ({
          roleId: testSetup.restrictedRoleId,
          objectMetadataId: testSetup.companyObjectMetadataId,
          predicates: [],
          predicateGroups: [],
        }),
        expectedSubCode:
          RowLevelPermissionPredicateExceptionCode.ROW_LEVEL_PERMISSION_REMOVAL_REQUIRES_ADMIN,
      },
    },
  ];

describe('Row Level Permission Predicate upsert without the entitlement should fail', () => {
  let restrictedRoleId: string;
  let companyObjectMetadataId: string;
  let companyNameFieldMetadataId: string;
  let rolesPermissionHolder: RolesPermissionHolderSetup;

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

    const { data: roleData } = await createOneRole({
      expectToFail: false,
      input: {
        label: RESTRICTED_ROLE_LABEL,
        description: 'A role keeping RLS predicates without the entitlement',
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

    restrictedRoleId = roleData?.createOneRole?.id;
    jestExpectToBeDefined(restrictedRoleId);

    await upsertRowLevelPermissionPredicates({
      expectToFail: false,
      input: {
        roleId: restrictedRoleId,
        objectMetadataId: companyObjectMetadataId,
        predicates: [
          {
            id: PREDICATE_ID,
            fieldMetadataId: companyNameFieldMetadataId,
            operand: RowLevelPermissionPredicateOperand.CONTAINS,
            value: 'Apple',
            rowLevelPermissionPredicateGroupId: PREDICATE_GROUP_ID,
            positionInRowLevelPermissionPredicateGroup: 0,
          },
        ],
        predicateGroups: [
          {
            id: PREDICATE_GROUP_ID,
            objectMetadataId: companyObjectMetadataId,
            logicalOperator:
              RowLevelPermissionPredicateGroupLogicalOperator.AND,
          },
        ],
      },
    });

    rolesPermissionHolder = await setupRolesPermissionHolder({
      label: 'Test Roles Permission Holder Without RLS Entitlement',
    });

    jest
      .spyOn(
        getAppProviderByClassName<EnterprisePlanService>(
          'EnterprisePlanService',
        ),
        'isValid',
      )
      .mockReturnValue(false);
  });

  afterAll(async () => {
    jest.restoreAllMocks();

    await cleanupRolesPermissionHolder(rolesPermissionHolder);

    if (isDefined(restrictedRoleId)) {
      await deleteOneRole({
        expectToFail: false,
        input: { idToDelete: restrictedRoleId },
      });
    }
  });

  it.each(
    eachTestingContextFilter(
      failingRowLevelPermissionPredicateUpsertWithoutEntitlementTestCases,
    ),
  )('$title', async ({ context }) => {
    const { errors } = await upsertRowLevelPermissionPredicates({
      expectToFail: true,
      token: context.token,
      input: context.input({
        restrictedRoleId,
        companyObjectMetadataId,
        companyNameFieldMetadataId,
      }),
    });

    expect(errors[0].extensions).toMatchObject({
      code: ErrorCode.FORBIDDEN,
      subCode: context.expectedSubCode,
    });

    expectOneNotInternalServerErrorSnapshot({
      errors,
    });
  });

  it('should keep the existing predicates and groups', async () => {
    const restrictedRole = await findOneRoleByLabel({
      label: RESTRICTED_ROLE_LABEL,
      gqlFields: `
        id
        label
        rowLevelPermissionPredicates {
          id
        }
        rowLevelPermissionPredicateGroups {
          id
        }
      `,
    });

    expect(restrictedRole.rowLevelPermissionPredicates).toEqual([
      { id: PREDICATE_ID },
    ]);
    expect(restrictedRole.rowLevelPermissionPredicateGroups).toEqual([
      { id: PREDICATE_GROUP_ID },
    ]);
  });
});
