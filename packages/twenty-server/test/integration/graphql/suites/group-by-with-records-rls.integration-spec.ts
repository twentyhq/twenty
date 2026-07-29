import { randomUUID } from 'crypto';

import gql from 'graphql-tag';
import { COMPANY_GQL_FIELDS } from 'test/integration/constants/company-gql-fields.constants';
import { createOneOperationFactory } from 'test/integration/graphql/utils/create-one-operation-factory.util';
import { destroyOneOperationFactory } from 'test/integration/graphql/utils/destroy-one-operation-factory.util';
import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import {
  type CompanyNameRlsRoleSetup,
  cleanupCompanyNameRlsRole,
  setupCompanyNameRlsRole,
} from 'test/integration/graphql/utils/setup-company-name-rls-role.util';

// used not to mix records with the seeded ones
const FILTER_2020 = {
  and: [
    { createdAt: { gte: '2020-01-01T00:00:00.000Z' } },
    { createdAt: { lte: '2020-03-03T23:59:59.999Z' } },
  ],
};
const COMPANIES_CREATED_AT = '2020-02-05T08:00:00.000Z';
const VISIBLE_COMPANY_NAME = 'RLS Visible Company';
const HIDDEN_COMPANY_NAME = 'RLS Hidden Company';

describe('group-by with records respects row-level permission predicates', () => {
  const testCompanyId1 = randomUUID();
  const testCompanyId2 = randomUUID();

  let rlsRole: CompanyNameRlsRoleSetup;

  beforeAll(async () => {
    rlsRole = await setupCompanyNameRlsRole({
      label: 'RLS GroupBy Test Role',
      description: 'Role for testing RLS in group-by with records',
    });

    for (const { id, name } of [
      { id: testCompanyId1, name: VISIBLE_COMPANY_NAME },
      { id: testCompanyId2, name: HIDDEN_COMPANY_NAME },
    ]) {
      await makeGraphqlAPIRequest(
        createOneOperationFactory({
          objectMetadataSingularName: 'company',
          gqlFields: COMPANY_GQL_FIELDS,
          data: {
            id,
            name,
            employees: 99,
            createdAt: COMPANIES_CREATED_AT,
          },
        }),
      );
    }
  });

  afterAll(async () => {
    for (const recordId of [testCompanyId1, testCompanyId2]) {
      await makeGraphqlAPIRequest(
        destroyOneOperationFactory({
          objectMetadataSingularName: 'company',
          gqlFields: 'id',
          recordId,
        }),
      );
    }

    await cleanupCompanyNameRlsRole(rlsRole);
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
      (record: { name: string }) => record.name === VISIBLE_COMPANY_NAME,
    );
    const hiddenRecords = allRecords.filter(
      (record: { name: string }) => record.name === HIDDEN_COMPANY_NAME,
    );

    expect(visibleRecords).toHaveLength(1);
    expect(hiddenRecords).toHaveLength(0);
  });
});
