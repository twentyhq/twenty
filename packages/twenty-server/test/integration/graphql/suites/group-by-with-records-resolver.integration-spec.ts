import { randomUUID } from 'crypto';

import gql from 'graphql-tag';
import { COMPANY_GQL_FIELDS } from 'test/integration/constants/company-gql-fields.constants';
import { createOneOperationFactory } from 'test/integration/graphql/utils/create-one-operation-factory.util';
import { destroyOneOperationFactory } from 'test/integration/graphql/utils/destroy-one-operation-factory.util';
import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';

const OPPORTUNITY_GQL_FIELDS = `
  id
  stage
  amount {
    amountMicros
  }
  companyId
  createdAt
  closeDate
`;

// used not to mix records with the seeded ones
const FILTER_2020 = {
  and: [
    {
      createdAt: {
        gte: '2020-01-01T00:00:00.000Z',
      },
    },
    {
      createdAt: {
        lte: '2020-03-03T23:59:59.999Z',
      },
    },
  ],
};

describe('basic group-by with records', () => {
  const testOpportunityId1 = randomUUID();
  const testOpportunityId2 = randomUUID();
  const testOpportunityId3 = randomUUID();
  const testOpportunityId4 = randomUUID();
  const testCompanyId1 = randomUUID();
  const testCompanyId2 = randomUUID();
  const COMPANY_1_EMPLOYEES = 10;
  const COMPANY_2_EMPLOYEES = 20;

  beforeAll(async () => {
    //   Create test companies
    await makeGraphqlAPIRequest(
      createOneOperationFactory({
        objectMetadataSingularName: 'company',
        gqlFields: COMPANY_GQL_FIELDS,
        data: {
          id: testCompanyId1,
          name: 'Company 1',
          employees: COMPANY_1_EMPLOYEES,
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
          name: 'Company 2',
          employees: COMPANY_2_EMPLOYEES,
          createdAt: '2020-02-05T08:00:00.000Z',
        },
      }),
    );

    // Create test opportunities with different stages and dates
    await makeGraphqlAPIRequest(
      createOneOperationFactory({
        objectMetadataSingularName: 'opportunity',
        gqlFields: OPPORTUNITY_GQL_FIELDS,
        data: {
          id: testOpportunityId1,
          stage: 'NEW',
          name: 'Opportunity 1',
          amount: { amountMicros: 1000000000000 }, // 1000
          companyId: testCompanyId1,
          closeDate: '2025-02-05T08:00:00.000Z', // Wednesday
          createdAt: '2020-02-05T08:00:00.000Z',
        },
      }),
    );

    await makeGraphqlAPIRequest(
      createOneOperationFactory({
        objectMetadataSingularName: 'opportunity',
        gqlFields: OPPORTUNITY_GQL_FIELDS,
        data: {
          id: testOpportunityId2,
          stage: 'NEW',
          name: 'Opportunity 2',
          amount: { amountMicros: 2000000000000 }, // 2000
          companyId: testCompanyId1,
          closeDate: '2025-02-06T08:00:00.000Z', // Thursday
          createdAt: '2020-02-05T08:00:00.000Z',
        },
      }),
    );

    await makeGraphqlAPIRequest(
      createOneOperationFactory({
        objectMetadataSingularName: 'opportunity',
        gqlFields: OPPORTUNITY_GQL_FIELDS,
        data: {
          id: testOpportunityId3,
          stage: 'NEW',
          name: 'Opportunity 3',
          amount: { amountMicros: 3000000000000 }, // 3000
          companyId: testCompanyId2,
          closeDate: '2025-02-06T08:00:00.000Z', // Thursday
          createdAt: '2020-02-05T08:00:00.000Z',
        },
      }),
    );

    await makeGraphqlAPIRequest(
      createOneOperationFactory({
        objectMetadataSingularName: 'opportunity',
        gqlFields: OPPORTUNITY_GQL_FIELDS,
        data: {
          id: testOpportunityId4,
          stage: 'SCREENING',
          name: 'Opportunity 4',
          amount: { amountMicros: 4000000000000 }, // 4000
          companyId: testCompanyId2,
          closeDate: '2025-02-06T08:00:00.000Z', // Thursday
          createdAt: '2020-02-05T08:00:00.000Z',
        },
      }),
    );
  });

  afterAll(async () => {
    // Cleanup created opportunities
    for (const id of [
      testOpportunityId1,
      testOpportunityId2,
      testOpportunityId3,
      testOpportunityId4,
    ]) {
      await makeGraphqlAPIRequest(
        destroyOneOperationFactory({
          objectMetadataSingularName: 'opportunity',
          gqlFields: 'id',
          recordId: id,
        }),
      );
    }

    // Cleanup created companies
    for (const id of [testCompanyId1, testCompanyId2]) {
      await makeGraphqlAPIRequest(
        destroyOneOperationFactory({
          objectMetadataSingularName: 'company',
          gqlFields: 'id',
          recordId: id,
        }),
      );
    }
  });

  it('groups by stage and createdAt with records', async () => {
    const response = await makeGraphqlAPIRequest({
      query: gql`
        query OpportunitiesGroupBy(
          $groupBy: [OpportunityGroupByInput!]!
          $filter: OpportunityFilterInput
          $limit: Int
        ) {
          opportunitiesGroupBy(
            groupBy: $groupBy
            filter: $filter
            limit: $limit
          ) {
            minCloseDate
            groupByDimensionValues
            sumAmountAmountMicros
            __typename
            edges {
              node {
                stage
                closeDate
                name
                amount {
                  amountMicros
                }
                company {
                  id
                  employees
                }
              }
            }
          }
        }
      `,
      variables: {
        groupBy: [
          {
            closeDate: {
              granularity: 'DAY_OF_THE_WEEK',
            },
          },
          {
            stage: true,
          },
        ],
        orderByForRecords: {
          name: 'AscNullsFirst',
        },
        filter: FILTER_2020,
        limit: 3,
      },
    });

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data).toBeDefined();

    const groups = response.body.data.opportunitiesGroupBy;

    expect(groups).toBeDefined();
    expect(groups).toHaveLength(3);

    groups.forEach((group: any) => {
      expect(group.groupByDimensionValues).toBeDefined();
      expect(Array.isArray(group.groupByDimensionValues)).toBe(true);
      expect(group.edges).toBeDefined();
      expect(Array.isArray(group.edges)).toBe(true);
    });

    const wednesdayNewGroup = groups.find(
      (group: any) =>
        group.groupByDimensionValues.includes('Wednesday') &&
        group.groupByDimensionValues.includes('NEW'),
    );

    expect(wednesdayNewGroup).toBeDefined();
    expect(wednesdayNewGroup.edges).toHaveLength(1);
    expect(wednesdayNewGroup.edges[0].node.name).toBe('Opportunity 1');
    expect(wednesdayNewGroup.edges[0].node.stage).toBe('NEW');
    expect(wednesdayNewGroup.edges[0].node.amount.amountMicros).toBe(
      1000000000000,
    );
    expect(wednesdayNewGroup.sumAmountAmountMicros).toBe(1000000000000);

    const thursdayNewGroup = groups.find(
      (group: any) =>
        group.groupByDimensionValues.includes('Thursday') &&
        group.groupByDimensionValues.includes('NEW'),
    );

    expect(thursdayNewGroup).toBeDefined();
    expect(thursdayNewGroup.edges).toHaveLength(2);
    expect(thursdayNewGroup.sumAmountAmountMicros).toBe(5000000000000);
    const opportunity2Edge = thursdayNewGroup.edges.find(
      (edge: any) => edge.node.name === 'Opportunity 2',
    ).node;
    const opportunity3Edge = thursdayNewGroup.edges.find(
      (edge: any) => edge.node.name === 'Opportunity 3',
    ).node;

    expect(opportunity2Edge.amount.amountMicros).toBe(2000000000000);
    expect(opportunity2Edge.stage).toBe('NEW');
    expect(opportunity2Edge.name).toBe('Opportunity 2');
    expect(opportunity2Edge.company.id).toBe(testCompanyId1);
    expect(opportunity2Edge.company.employees).toBe(COMPANY_1_EMPLOYEES);
    expect(opportunity3Edge.amount.amountMicros).toBe(3000000000000);
    expect(opportunity3Edge.stage).toBe('NEW');
    expect(opportunity3Edge.name).toBe('Opportunity 3');
    expect(opportunity3Edge.company.id).toBe(testCompanyId2);
    expect(opportunity3Edge.company.employees).toBe(COMPANY_2_EMPLOYEES);

    const thursdayScreeningGroup = groups.find(
      (group: any) =>
        group.groupByDimensionValues.includes('Thursday') &&
        group.groupByDimensionValues.includes('SCREENING'),
    );

    expect(thursdayScreeningGroup).toBeDefined();
    expect(thursdayScreeningGroup.edges).toHaveLength(1);
    const opportunity4Edge = thursdayScreeningGroup.edges[0].node;

    expect(opportunity4Edge.amount.amountMicros).toBe(4000000000000);
    expect(opportunity4Edge.stage).toBe('SCREENING');
    expect(opportunity4Edge.name).toBe('Opportunity 4');
    expect(opportunity4Edge.company.id).toBe(testCompanyId2);
    expect(opportunity4Edge.company.employees).toBe(COMPANY_2_EMPLOYEES);
    expect(thursdayScreeningGroup.sumAmountAmountMicros).toBe(4000000000000);
  });

  it('groups by stage and createdAt with records and filters', async () => {
    // Test with filter to only include NEW stage opportunities
    const response = await makeGraphqlAPIRequest({
      query: gql`
        query OpportunitiesGroupBy(
          $groupBy: [OpportunityGroupByInput!]!
          $filter: OpportunityFilterInput
          $limit: Int
        ) {
          opportunitiesGroupBy(
            groupBy: $groupBy
            filter: $filter
            limit: $limit
          ) {
            minCloseDate
            groupByDimensionValues
            sumAmountAmountMicros
            __typename
            edges {
              node {
                stage
                createdAt
                amount {
                  amountMicros
                }
              }
            }
          }
        }
      `,
      variables: {
        groupBy: [
          {
            closeDate: {
              granularity: 'DAY_OF_THE_WEEK',
            },
          },
          {
            stage: true,
          },
        ],
        filter: {
          and: [
            ...FILTER_2020.and,
            {
              stage: {
                eq: 'NEW',
              },
            },
          ],
        },
        limit: 2,
      },
    });

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data).toBeDefined();

    const groups = response.body.data.opportunitiesGroupBy;

    expect(groups).toHaveLength(2);
    const wednesdayNewGroup = groups.find(
      (group: any) =>
        group.groupByDimensionValues.includes('Wednesday') &&
        group.groupByDimensionValues.includes('NEW'),
    );

    expect(wednesdayNewGroup.groupByDimensionValues).toHaveLength(2);
    expect(wednesdayNewGroup.groupByDimensionValues).toContain('NEW');
    expect(wednesdayNewGroup.groupByDimensionValues).toContain('Wednesday');
    expect(wednesdayNewGroup.edges).toHaveLength(1);
    expect(wednesdayNewGroup.edges[0].node.stage).toBe('NEW');
    expect(wednesdayNewGroup.edges[0].node.amount.amountMicros).toBe(
      1000000000000,
    );

    const thursdayNewGroup = groups.find(
      (group: any) =>
        group.groupByDimensionValues.includes('Thursday') &&
        group.groupByDimensionValues.includes('NEW'),
    );

    expect(thursdayNewGroup.groupByDimensionValues).toHaveLength(2);
    expect(thursdayNewGroup.groupByDimensionValues).toContain('NEW');
    expect(thursdayNewGroup.groupByDimensionValues).toContain('Thursday');
    expect(thursdayNewGroup.edges).toHaveLength(2);
  });

  it('groups companies by employees with relations', async () => {
    const response = await makeGraphqlAPIRequest({
      query: gql`
        query CompaniesGroupBy(
          $groupBy: [CompanyGroupByInput!]!
          $filter: CompanyFilterInput
          $limit: Int
        ) {
          companiesGroupBy(groupBy: $groupBy, filter: $filter, limit: $limit) {
            groupByDimensionValues
            __typename
            edges {
              node {
                name
                opportunities {
                  edges {
                    node {
                      name
                      stage
                    }
                  }
                }
              }
            }
          }
        }
      `,
      variables: {
        groupBy: [
          {
            employees: true,
          },
        ],
        filter: FILTER_2020,
        limit: 2,
      },
    });

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data).toBeDefined();

    const groups = response.body.data.companiesGroupBy;

    expect(groups).toHaveLength(2);
    const company1Group = groups.find((group: any) =>
      group.groupByDimensionValues.includes(COMPANY_1_EMPLOYEES),
    );

    expect(company1Group).toBeDefined();
    expect(company1Group.edges).toHaveLength(1);
    expect(company1Group.edges[0].node.name).toBe('Company 1');
    expect(company1Group.edges[0].node.opportunities.edges).toHaveLength(2);
    const opportunity1Edge =
      company1Group.edges[0].node.opportunities.edges.find(
        (edge: any) => edge.node.name === 'Opportunity 1',
      ).node;

    expect(opportunity1Edge.name).toBe('Opportunity 1');
    expect(opportunity1Edge.stage).toBe('NEW');
    const opportunity2Edge =
      company1Group.edges[0].node.opportunities.edges.find(
        (edge: any) => edge.node.name === 'Opportunity 2',
      ).node;

    expect(opportunity2Edge.name).toBe('Opportunity 2');
    expect(opportunity2Edge.stage).toBe('NEW');

    const company2Group = groups.find((group: any) =>
      group.groupByDimensionValues.includes(COMPANY_2_EMPLOYEES),
    );

    expect(company2Group).toBeDefined();
    expect(company2Group.edges).toHaveLength(1);
    expect(company2Group.edges[0].node.name).toBe('Company 2');
    expect(company2Group.edges[0].node.opportunities.edges).toHaveLength(2);
    const opportunity3Edge =
      company2Group.edges[0].node.opportunities.edges.find(
        (edge: any) => edge.node.name === 'Opportunity 3',
      ).node;

    expect(opportunity3Edge.name).toBe('Opportunity 3');
    expect(opportunity3Edge.stage).toBe('NEW');
    const opportunity4Edge =
      company2Group.edges[0].node.opportunities.edges.find(
        (edge: any) => edge.node.name === 'Opportunity 4',
      ).node;

    expect(opportunity4Edge.name).toBe('Opportunity 4');
    expect(opportunity4Edge.stage).toBe('SCREENING');
  });

  describe('order by for records', () => {
    const getQueryWithOrderByForRecords = (orderByForRecords: string) => {
      return {
        query: gql`
          query OpportunitiesGroupBy(
            $groupBy: [OpportunityGroupByInput!]!
            $filter: OpportunityFilterInput
            $orderByForRecords: [OpportunityOrderByInput!]
            $limit: Int
          ) {
            opportunitiesGroupBy(
              groupBy: $groupBy
              filter: $filter
              orderByForRecords: $orderByForRecords
              limit: $limit
            ) {
              groupByDimensionValues
              __typename
              edges {
                node {
                  stage
                  name
                }
              }
            }
          }
        `,
        variables: {
          groupBy: [
            {
              closeDate: {
                granularity: 'DAY_OF_THE_WEEK',
              },
            },
            {
              stage: true,
            },
          ],
          orderByForRecords: [
            {
              name: orderByForRecords,
            },
          ],
          filter: FILTER_2020,
          limit: 20,
        },
      };
    };

    it('sorts by name in ascending order', async () => {
      const response = await makeGraphqlAPIRequest(
        getQueryWithOrderByForRecords('AscNullsFirst'),
      );

      expect(response.body.errors).toBeUndefined();
      expect(response.body.data).toBeDefined();

      const groups = response.body.data.opportunitiesGroupBy;

      const thursdayNewGroup = groups.find(
        (group: any) =>
          group.groupByDimensionValues.includes('Thursday') &&
          group.groupByDimensionValues.includes('NEW'),
      );

      expect(thursdayNewGroup).toBeDefined();
      expect(thursdayNewGroup.edges).toHaveLength(2);
      expect(thursdayNewGroup.edges[0].node.name).toBe('Opportunity 2');
      expect(thursdayNewGroup.edges[1].node.name).toBe('Opportunity 3');
    });

    it('sorts by name in descending order', async () => {
      const response = await makeGraphqlAPIRequest(
        getQueryWithOrderByForRecords('DescNullsFirst'),
      );

      expect(response.body.errors).toBeUndefined();
      expect(response.body.data).toBeDefined();

      const groups = response.body.data.opportunitiesGroupBy;

      const thursdayNewGroup = groups.find(
        (group: any) =>
          group.groupByDimensionValues.includes('Thursday') &&
          group.groupByDimensionValues.includes('NEW'),
      );

      expect(thursdayNewGroup).toBeDefined();
      expect(thursdayNewGroup.edges).toHaveLength(2);
      expect(thursdayNewGroup.edges[0].node.name).toBe('Opportunity 3');
      expect(thursdayNewGroup.edges[1].node.name).toBe('Opportunity 2');
    });
  });
});
