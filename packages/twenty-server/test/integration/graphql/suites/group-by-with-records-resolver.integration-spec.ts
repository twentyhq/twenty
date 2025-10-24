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

  beforeAll(async () => {
    //   Create test companies
    await makeGraphqlAPIRequest(
      createOneOperationFactory({
        objectMetadataSingularName: 'company',
        gqlFields: COMPANY_GQL_FIELDS,
        data: {
          id: testCompanyId1,
          name: 'Company 1',
          employees: 10,
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
          employees: 20,
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
          $groupBy: [OpportunityGroupByInput!]
          $filter: OpportunityFilterInput
        ) {
          opportunitiesGroupBy(groupBy: $groupBy, filter: $filter) {
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
        filter: FILTER_2020,
      },
    });

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data).toBeDefined();

    const groups = response.body.data.opportunitiesGroupBy;

    expect(groups).toBeDefined();
    expect(groups).toHaveLength(3);

    // Check that each group has the expected structure
    groups.forEach((group: any) => {
      expect(group.groupByDimensionValues).toBeDefined();
      expect(Array.isArray(group.groupByDimensionValues)).toBe(true);
      expect(group.edges).toBeDefined();
      expect(Array.isArray(group.edges)).toBe(true);
    });

    // Find specific groups and verify their content
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
    for (const edge of thursdayNewGroup.edges) {
      expect(edge.node.stage).toBe('NEW');
      expect(edge.node.name).toBeDefined();
      expect(
        edge.node.name === 'Opportunity 2' ||
          edge.node.name === 'Opportunity 3',
      ).toBe(true);
    }

    const thursdayScreeningGroup = groups.find(
      (group: any) =>
        group.groupByDimensionValues.includes('Thursday') &&
        group.groupByDimensionValues.includes('SCREENING'),
    );

    expect(thursdayScreeningGroup).toBeDefined();
    expect(thursdayScreeningGroup.edges).toHaveLength(1);
    expect(thursdayScreeningGroup.edges[0].node.amount.amountMicros).toBe(
      4000000000000,
    );
    expect(thursdayScreeningGroup.edges[0].node.stage).toBe('SCREENING');
    expect(thursdayScreeningGroup.edges[0].node.name).toBe('Opportunity 4');
    expect(thursdayScreeningGroup.sumAmountAmountMicros).toBe(4000000000000);
  });

  it('groups by stage and createdAt with records and filters', async () => {
    // Test with filter to only include NEW stage opportunities
    const response = await makeGraphqlAPIRequest({
      query: gql`
        query OpportunitiesGroupBy(
          $groupBy: [OpportunityGroupByInput!]
          $filter: OpportunityFilterInput
        ) {
          opportunitiesGroupBy(groupBy: $groupBy, filter: $filter) {
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
});
