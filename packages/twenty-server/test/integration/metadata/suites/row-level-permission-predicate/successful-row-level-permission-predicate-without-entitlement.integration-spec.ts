import { COMPANY_GQL_FIELDS } from 'test/integration/constants/company-gql-fields.constants';
import { createOneOperationFactory } from 'test/integration/graphql/utils/create-one-operation-factory.util';
import { destroyOneOperationFactory } from 'test/integration/graphql/utils/destroy-one-operation-factory.util';
import { findManyOperationFactory } from 'test/integration/graphql/utils/find-many-operation-factory.util';
import { makeGraphqlApiRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { VISIBLE_COMPANY_NAME_TOKEN } from 'test/integration/graphql/utils/setup-company-name-rls-role.util';
import { findManyObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/find-many-object-metadata.util';
import { createOneRole } from 'test/integration/metadata/suites/role/utils/create-one-role.util';
import { deleteOneRole } from 'test/integration/metadata/suites/role/utils/delete-one-role.util';
import { findOneRoleByLabel } from 'test/integration/metadata/suites/role/utils/find-one-role-by-label.util';
import { updateWorkspaceMemberRole } from 'test/integration/metadata/suites/role/utils/update-workspace-member-role.util';
import { upsertRowLevelPermissionPredicates } from 'test/integration/metadata/suites/row-level-permission-predicate/utils/upsert-row-level-permission-predicates.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { jestExpectToBeDefined } from 'test/utils/jest-expect-to-be-defined.util.test';
import {
  RowLevelPermissionPredicateGroupLogicalOperator,
  RowLevelPermissionPredicateOperand,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';

import { type EnterprisePlanService } from 'src/engine/core-modules/enterprise/services/enterprise-plan.service';
import { WORKSPACE_MEMBER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/workspace-member-data-seeds.constant';

const RESTRICTED_ROLE_LABEL = 'Test Role For RLS Kept Without Entitlement';
const PREDICATE_ID = v4();
const PREDICATE_GROUP_ID = v4();
const VISIBLE_COMPANY_ID = v4();
const HIDDEN_COMPANY_ID = v4();

const findCompanyIdsAsRestrictedMember = async (): Promise<string[]> => {
  const response = await makeGraphqlApiRequest(
    findManyOperationFactory({
      objectMetadataSingularName: 'company',
      objectMetadataPluralName: 'companies',
      gqlFields: 'id',
      filter: { id: { in: [VISIBLE_COMPANY_ID, HIDDEN_COMPANY_ID] } },
    }),
    APPLE_JONY_MEMBER_ACCESS_TOKEN,
  );

  expect(response.body.errors).toBeUndefined();

  return response.body.data.companies.edges
    .map((edge: { node: { id: string } }) => edge.node.id)
    .sort();
};

const findRestrictedRoleWithRules = () =>
  findOneRoleByLabel({
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

describe('Row Level Permission Predicate without the entitlement should succeed', () => {
  let restrictedRoleId: string;
  let originalMemberRoleId: string;
  let companyObjectMetadataId: string;

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

    for (const { id, name } of [
      {
        id: VISIBLE_COMPANY_ID,
        name: `RLS Kept Without Entitlement ${VISIBLE_COMPANY_NAME_TOKEN} Co`,
      },
      { id: HIDDEN_COMPANY_ID, name: 'RLS Kept Without Entitlement Hidden Co' },
    ]) {
      await makeGraphqlApiRequest(
        createOneOperationFactory({
          objectMetadataSingularName: 'company',
          gqlFields: COMPANY_GQL_FIELDS,
          data: { id, name },
        }),
      );
    }

    originalMemberRoleId = (await findOneRoleByLabel({ label: 'Member' })).id;

    const { data: roleData } = await createOneRole({
      expectToFail: false,
      input: {
        label: RESTRICTED_ROLE_LABEL,
        description: 'A role whose RLS predicates outlive the entitlement',
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
            fieldMetadataId: nameField.id,
            operand: RowLevelPermissionPredicateOperand.CONTAINS,
            value: VISIBLE_COMPANY_NAME_TOKEN,
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

    await updateWorkspaceMemberRole({
      input: {
        roleId: restrictedRoleId,
        workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
      },
      expectToFail: false,
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

    if (isDefined(originalMemberRoleId)) {
      await updateWorkspaceMemberRole({
        input: {
          workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
          roleId: originalMemberRoleId,
        },
        expectToFail: false,
      });
    }

    if (isDefined(restrictedRoleId)) {
      await deleteOneRole({
        expectToFail: false,
        input: { idToDelete: restrictedRoleId },
      });
    }

    for (const recordId of [VISIBLE_COMPANY_ID, HIDDEN_COMPANY_ID]) {
      await makeGraphqlApiRequest(
        destroyOneOperationFactory({
          objectMetadataSingularName: 'company',
          gqlFields: 'id',
          recordId,
        }),
      );
    }
  });

  it('should return the existing predicates and groups', async () => {
    const restrictedRole = await findRestrictedRoleWithRules();

    expect(restrictedRole.rowLevelPermissionPredicates).toEqual([
      { id: PREDICATE_ID },
    ]);
    expect(restrictedRole.rowLevelPermissionPredicateGroups).toEqual([
      { id: PREDICATE_GROUP_ID },
    ]);
  });

  it('should keep filtering records for a member holding the role', async () => {
    expect(await findCompanyIdsAsRestrictedMember()).toEqual([
      VISIBLE_COMPANY_ID,
    ]);
  });

  it('should let an Admin remove the predicates and groups', async () => {
    const { data } = await upsertRowLevelPermissionPredicates({
      expectToFail: false,
      input: {
        roleId: restrictedRoleId,
        objectMetadataId: companyObjectMetadataId,
        predicates: [],
        predicateGroups: [],
      },
    });

    expect(data.upsertRowLevelPermissionPredicates).toEqual({
      predicates: [],
      predicateGroups: [],
    });

    const restrictedRole = await findRestrictedRoleWithRules();

    expect(restrictedRole.rowLevelPermissionPredicates).toEqual([]);
    expect(restrictedRole.rowLevelPermissionPredicateGroups).toEqual([]);
  });

  it('should stop filtering records once the predicates and groups are removed', async () => {
    expect(await findCompanyIdsAsRestrictedMember()).toEqual(
      [VISIBLE_COMPANY_ID, HIDDEN_COMPANY_ID].sort(),
    );
  });
});
