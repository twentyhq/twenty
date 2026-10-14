import gql from 'graphql-tag';
import { createManyOperationFactory } from 'test/integration/graphql/utils/create-many-operation-factory.util';
import { destroyManyOperationFactory } from 'test/integration/graphql/utils/destroy-many-operation-factory.util';
import { makeGraphqlApiRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';

const TEST_COMPANY_IDS = {
  SMALL: '20202020-aaaa-4000-8000-00000000a001',
  LARGE: '20202020-aaaa-4000-8000-00000000a002',
};

const TEST_OPPORTUNITY_IDS = {
  SMALL_FIRST: '20202020-bbbb-4000-8000-00000000a001',
  SMALL_SECOND: '20202020-bbbb-4000-8000-00000000a002',
  LARGE: '20202020-bbbb-4000-8000-00000000a003',
  WITHOUT_COMPANY: '20202020-bbbb-4000-8000-00000000a004',
};

const SMALL_COMPANY_EMPLOYEES = 10;
const LARGE_COMPANY_EMPLOYEES = 40;

const opportunityFilter = {
  id: { in: Object.values(TEST_OPPORTUNITY_IDS) },
};

describe('Aggregate through a many-to-one relation (integration)', () => {
  beforeAll(async () => {
    await makeGraphqlApiRequest(
      createManyOperationFactory({
        objectMetadataSingularName: 'company',
        objectMetadataPluralName: 'companies',
        gqlFields: 'id',
        data: [
          {
            id: TEST_COMPANY_IDS.SMALL,
            name: 'Small aggregate company',
            employees: SMALL_COMPANY_EMPLOYEES,
          },
          {
            id: TEST_COMPANY_IDS.LARGE,
            name: 'Large aggregate company',
            employees: LARGE_COMPANY_EMPLOYEES,
          },
        ],
        upsert: true,
      }),
    );

    await makeGraphqlApiRequest(
      createManyOperationFactory({
        objectMetadataSingularName: 'opportunity',
        objectMetadataPluralName: 'opportunities',
        gqlFields: 'id',
        data: [
          {
            id: TEST_OPPORTUNITY_IDS.SMALL_FIRST,
            name: 'Small first',
            companyId: TEST_COMPANY_IDS.SMALL,
          },
          {
            id: TEST_OPPORTUNITY_IDS.SMALL_SECOND,
            name: 'Small second',
            companyId: TEST_COMPANY_IDS.SMALL,
          },
          {
            id: TEST_OPPORTUNITY_IDS.LARGE,
            name: 'Large',
            companyId: TEST_COMPANY_IDS.LARGE,
          },
          {
            id: TEST_OPPORTUNITY_IDS.WITHOUT_COMPANY,
            name: 'Without company',
          },
        ],
        upsert: true,
      }),
    );
  });

  afterAll(async () => {
    await makeGraphqlApiRequest(
      destroyManyOperationFactory({
        objectMetadataSingularName: 'opportunity',
        objectMetadataPluralName: 'opportunities',
        gqlFields: 'id',
        filter: opportunityFilter,
      }),
    );
    await makeGraphqlApiRequest(
      destroyManyOperationFactory({
        objectMetadataSingularName: 'company',
        objectMetadataPluralName: 'companies',
        gqlFields: 'id',
        filter: { id: { in: Object.values(TEST_COMPANY_IDS) } },
      }),
    );
  });

  it('should aggregate the related company field once per opportunity', async () => {
    const response = await makeGraphqlApiRequest({
      query: gql`
        query Opportunities($filter: OpportunityFilterInput) {
          opportunities(filter: $filter) {
            totalCount
            company {
              sumEmployees
              avgEmployees
              minEmployees
              maxEmployees
              countEmptyEmployees
              countNotEmptyEmployees
              countUniqueValuesEmployees
            }
          }
        }
      `,
      variables: { filter: opportunityFilter },
    });

    expect(response.body.errors).toBeUndefined();

    const { totalCount, company } = response.body.data.opportunities;

    expect(totalCount).toBe(4);
    // The small company is linked twice, so it counts twice
    expect(company.sumEmployees).toBe(
      SMALL_COMPANY_EMPLOYEES * 2 + LARGE_COMPANY_EMPLOYEES,
    );
    expect(company.avgEmployees).toBeCloseTo(
      (SMALL_COMPANY_EMPLOYEES * 2 + LARGE_COMPANY_EMPLOYEES) / 3,
    );
    expect(company.minEmployees).toBe(SMALL_COMPANY_EMPLOYEES);
    expect(company.maxEmployees).toBe(LARGE_COMPANY_EMPLOYEES);
    expect(company.countEmptyEmployees).toBe(1);
    expect(company.countNotEmptyEmployees).toBe(3);
    expect(company.countUniqueValuesEmployees).toBe(2);
  });

  it('should follow the opportunity filter', async () => {
    const response = await makeGraphqlApiRequest({
      query: gql`
        query Opportunities($filter: OpportunityFilterInput) {
          opportunities(filter: $filter) {
            company {
              sumEmployees
            }
          }
        }
      `,
      variables: {
        filter: {
          id: {
            in: [TEST_OPPORTUNITY_IDS.SMALL_FIRST, TEST_OPPORTUNITY_IDS.LARGE],
          },
        },
      },
    });

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.opportunities.company.sumEmployees).toBe(
      SMALL_COMPANY_EMPLOYEES + LARGE_COMPANY_EMPLOYEES,
    );
  });

  it('should return traversed aggregates next to edges and own aggregates', async () => {
    const response = await makeGraphqlApiRequest({
      query: gql`
        query Opportunities($filter: OpportunityFilterInput) {
          opportunities(filter: $filter, first: 10) {
            totalCount
            countEmptyName
            company {
              sumEmployees
            }
            edges {
              node {
                id
                company {
                  id
                  employees
                }
              }
            }
          }
        }
      `,
      variables: { filter: opportunityFilter },
    });

    expect(response.body.errors).toBeUndefined();

    const { totalCount, countEmptyName, company, edges } =
      response.body.data.opportunities;

    expect(totalCount).toBe(4);
    expect(countEmptyName).toBe(0);
    expect(company.sumEmployees).toBe(
      SMALL_COMPANY_EMPLOYEES * 2 + LARGE_COMPANY_EMPLOYEES,
    );
    expect(edges).toHaveLength(4);

    const smallFirstEdge = edges.find(
      (edge: { node: { id: string } }) =>
        edge.node.id === TEST_OPPORTUNITY_IDS.SMALL_FIRST,
    );

    expect(smallFirstEdge.node.company.employees).toBe(SMALL_COMPANY_EMPLOYEES);
  });

  it('should expose traversed aggregates on a group by connection', async () => {
    const response = await makeGraphqlApiRequest({
      query: gql`
        query OpportunitiesGroupBy(
          $groupBy: [OpportunityGroupByInput!]!
          $filter: OpportunityFilterInput
        ) {
          opportunitiesGroupBy(groupBy: $groupBy, filter: $filter) {
            groupByDimensionValues
            totalCount
            company {
              sumEmployees
            }
          }
        }
      `,
      variables: {
        groupBy: [{ companyId: true }],
        filter: opportunityFilter,
      },
    });

    expect(response.body.errors).toBeUndefined();

    const groups = response.body.data.opportunitiesGroupBy;

    const smallCompanyGroup = groups.find(
      (group: { groupByDimensionValues: string[] }) =>
        group.groupByDimensionValues[0] === TEST_COMPANY_IDS.SMALL,
    );
    const largeCompanyGroup = groups.find(
      (group: { groupByDimensionValues: string[] }) =>
        group.groupByDimensionValues[0] === TEST_COMPANY_IDS.LARGE,
    );

    expect(smallCompanyGroup.totalCount).toBe(2);
    expect(smallCompanyGroup.company.sumEmployees).toBe(
      SMALL_COMPANY_EMPLOYEES * 2,
    );
    expect(largeCompanyGroup.totalCount).toBe(1);
    expect(largeCompanyGroup.company.sumEmployees).toBe(
      LARGE_COMPANY_EMPLOYEES,
    );
  });
});
