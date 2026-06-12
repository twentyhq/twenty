import { randomUUID } from 'crypto';

import gql from 'graphql-tag';
import { COMPANY_GQL_FIELDS } from 'test/integration/constants/company-gql-fields.constants';
import { createOneOperationFactory } from 'test/integration/graphql/utils/create-one-operation-factory.util';
import { destroyOneOperationFactory } from 'test/integration/graphql/utils/destroy-one-operation-factory.util';
import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { findManyObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/find-many-object-metadata.util';
import { createOneRole } from 'test/integration/metadata/suites/role/utils/create-one-role.util';
import { deleteOneRole } from 'test/integration/metadata/suites/role/utils/delete-one-role.util';
import { findOneRoleByLabel } from 'test/integration/metadata/suites/role/utils/find-one-role-by-label.util';
import { updateWorkspaceMemberRole } from 'test/integration/metadata/suites/role/utils/update-workspace-member-role.util';
import { upsertRowLevelPermissionPredicates } from 'test/integration/metadata/suites/row-level-permission-predicate/utils/upsert-row-level-permission-predicates.util';
import { jestExpectToBeDefined } from 'test/utils/jest-expect-to-be-defined.util.test';
import { RowLevelPermissionPredicateOperand } from 'twenty-shared/types';

import { WORKSPACE_MEMBER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/workspace-member-data-seeds.constant';

const FILTER_2020 = {
  and: [
    { createdAt: { gte: '2020-01-01T00:00:00.000Z' } },
    { createdAt: { lte: '2020-03-03T23:59:59.999Z' } },
  ],
};

describe('group-by with records respects row-level permission predicates', () => {
  const testCompanyId1 = randomUUID();
  const testCompanyId2 = randomUUID();
  let customRoleId: string;
  let originalMemberRoleId: string;
  let companyObjectMetadataId: string;
  let companyNameFieldMetadataId: string;

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

    const nameField = companyObjectMetadata.fieldsList?.find(
      (field: { name: string }) => field.name === 'name',
    );

    jestExpectToBeDefined(nameField);
    companyNameFieldMetadataId = nameField.id;

    const memberRole = await findOneRoleByLabel({ label: 'Member' });

    originalMemberRoleId = memberRole.id;

    const { data: roleData } = await createOneRole({
      expectToFail: false,
      input: {
        label: 'RLS GroupBy Test Role',
        description: 'Role for testing RLS in group-by with records',
        icon: 'IconSettings',
        canUpdateAllSettings: false,
        canAccessAllTools: true,
        canReadAllObjectRecords: true,
        canUpdateAllObjectRecords: true,
        canSoftDeleteAllObjectRecords: false,
        canDestroyAllObjectRecords: false,
        canBeAssignedToUsers: true,
        canBeAssignedToAgents: false,
        canBeAssignedToApiKeys: false,
      },
    });

    customRoleId = roleData?.createOneRole?.id;
    jestExpectToBeDefined(customRoleId);

    await upsertRowLevelPermissionPredicates({
      expectToFail: false,
      input: {
        roleId: customRoleId,
        objectMetadataId: companyObjectMetadataId,
        predicates: [
          {
            fieldMetadataId: companyNameFieldMetadataId,
            operand: RowLevelPermissionPredicateOperand.CONTAINS,
            value: 'Visible',
          },
        ],
        predicateGroups: [],
      },
    });

    await updateWorkspaceMemberRole({
      input: {
        roleId: customRoleId,
        workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
      },
      expectToFail: false,
    });

    await makeGraphqlAPIRequest(
      createOneOperationFactory({
        objectMetadataSingularName: 'company',
        gqlFields: COMPANY_GQL_FIELDS,
        data: {
          id: testCompanyId1,
          name: 'RLS Visible Company',
          employees: 99,
          createdAt: '2020-02-05T08:00:00.000Z',
        },
      }),
    );

    await makeGraphqlAPIRequest(
      createOneOperationFactory({
        objectMetadataSingularName: 'company',
        gqlFields: COMPANY_GQL_FIELDS,
        data: {
          id: testCompanyId2,
          name: 'RLS Hidden Company',
          employees: 99,
          createdAt: '2020-02-05T08:00:00.000Z',
        },
      }),
    );
  });

  afterAll(async () => {
    await updateWorkspaceMemberRole({
      input: {
        workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
        roleId: originalMemberRoleId,
      },
      expectToFail: false,
    });

    for (const id of [testCompanyId1, testCompanyId2]) {
      await makeGraphqlAPIRequest(
        destroyOneOperationFactory({
          objectMetadataSingularName: 'company',
          gqlFields: 'id',
          recordId: id,
        }),
      );
    }

    if (customRoleId) {
      await deleteOneRole({
        expectToFail: false,
        input: { idToDelete: customRoleId },
      });
    }
  });

  it('filters records in group-by results based on RLS predicates', async () => {
    const response = await makeGraphqlAPIRequest(
      {
        query: gql`
          query CompaniesGroupBy(
            $groupBy: [CompanyGroupByInput!]!
            $filter: CompanyFilterInput
            $limit: Int
          ) {
            companiesGroupBy(
              groupBy: $groupBy
              filter: $filter
              limit: $limit
            ) {
              groupByDimensionValues
              edges {
                node {
                  name
                  employees
                }
              }
            }
          }
        `,
        variables: {
          groupBy: [{ employees: true }],
          filter: FILTER_2020,
          limit: 10,
        },
      },
      APPLE_JONY_MEMBER_ACCESS_TOKEN,
    );

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data).toBeDefined();

    const groups = response.body.data.companiesGroupBy;

    const allRecords = groups.flatMap(
      (group: { edges: { node: { name: string } }[] }) =>
        group.edges.map((edge: { node: { name: string } }) => edge.node),
    );

    const visibleRecords = allRecords.filter(
      (record: { name: string }) => record.name === 'RLS Visible Company',
    );
    const hiddenRecords = allRecords.filter(
      (record: { name: string }) => record.name === 'RLS Hidden Company',
    );

    expect(visibleRecords).toHaveLength(1);
    expect(hiddenRecords).toHaveLength(0);
  });
});
