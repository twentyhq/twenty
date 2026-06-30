import gql from 'graphql-tag';
import { createManyOperationFactory } from 'test/integration/graphql/utils/create-many-operation-factory.util';
import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';

const TEST_COMPANY_IDS = {
  ALPHA: '20202020-aaaa-4000-8000-000000000001',
  BETA: '20202020-aaaa-4000-8000-000000000002',
  GAMMA: '20202020-aaaa-4000-8000-000000000003',
  // Companies for case-insensitive sorting tests
  ACME_LOWER: '20202020-aaaa-4000-8000-000000000004',
  ACME_UPPER: '20202020-aaaa-4000-8000-000000000005',
  ZEBRA: '20202020-aaaa-4000-8000-000000000006',
};

const TEST_PERSON_IDS = [
  '20202020-bbbb-4000-8000-000000000001',
  '20202020-bbbb-4000-8000-000000000002',
  '20202020-bbbb-4000-8000-000000000003',
  '20202020-bbbb-4000-8000-000000000004',
  '20202020-bbbb-4000-8000-000000000005',
  '20202020-bbbb-4000-8000-000000000006',
  '20202020-bbbb-4000-8000-000000000007',
  '20202020-bbbb-4000-8000-000000000008',
  '20202020-bbbb-4000-8000-000000000009',
  '20202020-bbbb-4000-8000-000000000010',
];

const CASE_INSENSITIVE_TEST_PERSON_IDS = [
  '20202020-bbbb-4000-8000-000000000011',
  '20202020-bbbb-4000-8000-000000000012',
  '20202020-bbbb-4000-8000-000000000013',
];

describe('Order by relation field (e2e)', () => {
  beforeAll(async () => {
    // Create test companies with distinct names for sorting verification
    const createCompanies = createManyOperationFactory({
      objectMetadataSingularName: 'company',
      objectMetadataPluralName: 'companies',
      gqlFields: 'id name',
      data: [
        { id: TEST_COMPANY_IDS.ALPHA, name: 'Alpha Corp' },
        { id: TEST_COMPANY_IDS.BETA, name: 'Beta Inc' },
        { id: TEST_COMPANY_IDS.GAMMA, name: 'Gamma LLC' },
        // Companies for case-insensitive sorting tests (lowercase vs uppercase)
        { id: TEST_COMPANY_IDS.ACME_LOWER, name: 'acme' },
        { id: TEST_COMPANY_IDS.ACME_UPPER, name: 'ACME' },
        { id: TEST_COMPANY_IDS.ZEBRA, name: 'Zebra' },
      ],
      upsert: true,
    });

    await makeGraphqlAPIRequest(createCompanies);

    // Create test people with company relations and some without (for null testing)
    const createPeople = createManyOperationFactory({
      objectMetadataSingularName: 'person',
      objectMetadataPluralName: 'people',
      gqlFields: 'id',
      data: [
        // People with companies (for testing sorting)
        { id: TEST_PERSON_IDS[0], companyId: TEST_COMPANY_IDS.ALPHA },
        { id: TEST_PERSON_IDS[1], companyId: TEST_COMPANY_IDS.ALPHA },
        { id: TEST_PERSON_IDS[2], companyId: TEST_COMPANY_IDS.BETA },
        { id: TEST_PERSON_IDS[3], companyId: TEST_COMPANY_IDS.BETA },
        { id: TEST_PERSON_IDS[4], companyId: TEST_COMPANY_IDS.GAMMA },
        { id: TEST_PERSON_IDS[5], companyId: TEST_COMPANY_IDS.GAMMA },
        // People without companies (for testing NULLS LAST)
        { id: TEST_PERSON_IDS[6], companyId: null },
        { id: TEST_PERSON_IDS[7], companyId: null },
        { id: TEST_PERSON_IDS[8], companyId: null },
        { id: TEST_PERSON_IDS[9], companyId: null },
        // People for case-insensitive sorting tests
        {
          id: CASE_INSENSITIVE_TEST_PERSON_IDS[0],
          companyId: TEST_COMPANY_IDS.ACME_LOWER,
        },
        {
          id: CASE_INSENSITIVE_TEST_PERSON_IDS[1],
          companyId: TEST_COMPANY_IDS.ACME_UPPER,
        },
        {
          id: CASE_INSENSITIVE_TEST_PERSON_IDS[2],
          companyId: TEST_COMPANY_IDS.ZEBRA,
        },
      ],
      upsert: true,
    });

    await makeGraphqlAPIRequest(createPeople);
  });

  it('should sort people by company name ascending', async () => {
    const queryData = {
      query: gql`
        query People(
          $orderBy: [PersonOrderByInput]
          $filter: PersonFilterInput
        ) {
          people(orderBy: $orderBy, filter: $filter, first: 10) {
            edges {
              node {
                id
                name {
                  firstName
                  lastName
                }
                company {
                  name
                }
              }
            }
          }
        }
      `,
      variables: {
        orderBy: [{ company: { name: 'AscNullsLast' } }],
        filter: { id: { in: TEST_PERSON_IDS } },
      },
    };

    const response = await makeGraphqlAPIRequest(queryData);

    expect(response.body.data).toBeDefined();
    expect(response.body.errors).toBeUndefined();

    const edges = response.body.data.people.edges;

    expect(Array.isArray(edges)).toBe(true);
    expect(edges.length).toBeGreaterThan(0);

    // Verify company names are in ascending order (excluding nulls at the end)
    const companyNames = edges
      .map(
        (edge: { node: { company?: { name: string } } }) =>
          edge.node.company?.name,
      )
      .filter(Boolean);

    const sortedCompanyNames = [...companyNames].sort((a, b) =>
      a.localeCompare(b),
    );

    expect(companyNames).toEqual(sortedCompanyNames);
  });

  it('should sort people by company name descending', async () => {
    const queryData = {
      query: gql`
        query People(
          $orderBy: [PersonOrderByInput]
          $filter: PersonFilterInput
        ) {
          people(orderBy: $orderBy, filter: $filter, first: 10) {
            edges {
              node {
                id
                name {
                  firstName
                  lastName
                }
                company {
                  name
                }
              }
            }
          }
        }
      `,
      variables: {
        orderBy: [{ company: { name: 'DescNullsLast' } }],
        filter: { id: { in: TEST_PERSON_IDS } },
      },
    };

    const response = await makeGraphqlAPIRequest(queryData);

    expect(response.body.data).toBeDefined();
    expect(response.body.errors).toBeUndefined();

    const edges = response.body.data.people.edges;

    expect(Array.isArray(edges)).toBe(true);
    expect(edges.length).toBeGreaterThan(0);

    // Verify company names are in descending order (excluding nulls at the end)
    const companyNames = edges
      .map(
        (edge: { node: { company?: { name: string } } }) =>
          edge.node.company?.name,
      )
      .filter(Boolean);

    const sortedCompanyNames = [...companyNames].sort((a, b) =>
      b.localeCompare(a),
    );

    expect(companyNames).toEqual(sortedCompanyNames);
  });

  it('should handle null relations with NULLS LAST', async () => {
    const queryData = {
      query: gql`
        query People(
          $orderBy: [PersonOrderByInput]
          $filter: PersonFilterInput
        ) {
          people(orderBy: $orderBy, filter: $filter, first: 50) {
            edges {
              node {
                id
                name {
                  firstName
                  lastName
                }
                company {
                  name
                }
              }
            }
          }
        }
      `,
      variables: {
        orderBy: [{ company: { name: 'AscNullsLast' } }],
        filter: { id: { in: TEST_PERSON_IDS } },
      },
    };

    const response = await makeGraphqlAPIRequest(queryData);

    expect(response.body.data).toBeDefined();
    expect(response.body.errors).toBeUndefined();

    const edges = response.body.data.people.edges;

    expect(Array.isArray(edges)).toBe(true);
    expect(edges.length).toBeGreaterThan(0);

    // Check that null companies appear at the end
    let seenNull = false;

    for (const edge of edges) {
      if (edge.node.company === null) {
        seenNull = true;
      } else if (seenNull) {
        // If we already saw a null, subsequent non-nulls mean order is wrong
        throw new Error('Records with null company should appear at the end');
      }
    }
  });

  it('should work with offset pagination', async () => {
    // First request to get initial data
    const firstQueryData = {
      query: gql`
        query People(
          $orderBy: [PersonOrderByInput]
          $filter: PersonFilterInput
          $limit: Int
        ) {
          people(orderBy: $orderBy, filter: $filter, first: $limit) {
            edges {
              node {
                id
                company {
                  name
                }
              }
            }
            totalCount
          }
        }
      `,
      variables: {
        orderBy: [{ company: { name: 'AscNullsLast' } }],
        filter: { id: { in: TEST_PERSON_IDS } },
        limit: 3,
      },
    };

    const firstResponse = await makeGraphqlAPIRequest(firstQueryData);

    expect(firstResponse.body.data).toBeDefined();
    expect(firstResponse.body.errors).toBeUndefined();

    const firstPageEdges = firstResponse.body.data.people.edges;
    const totalCount = firstResponse.body.data.people.totalCount;

    expect(Array.isArray(firstPageEdges)).toBe(true);
    expect(firstPageEdges.length).toBeGreaterThan(0);
    expect(totalCount).toBeGreaterThan(3);

    // Second request using offset (matching frontend behavior)
    const secondQueryData = {
      query: gql`
        query People(
          $orderBy: [PersonOrderByInput]
          $filter: PersonFilterInput
          $limit: Int
          $offset: Int
        ) {
          people(
            orderBy: $orderBy
            filter: $filter
            first: $limit
            offset: $offset
          ) {
            edges {
              node {
                id
                company {
                  name
                }
              }
            }
          }
        }
      `,
      variables: {
        orderBy: [{ company: { name: 'AscNullsLast' } }],
        filter: { id: { in: TEST_PERSON_IDS } },
        limit: 3,
        offset: 3,
      },
    };

    const secondResponse = await makeGraphqlAPIRequest(secondQueryData);

    expect(secondResponse.body.data).toBeDefined();
    expect(secondResponse.body.errors).toBeUndefined();

    const secondPageEdges = secondResponse.body.data.people.edges;

    expect(Array.isArray(secondPageEdges)).toBe(true);

    // Verify different records are returned (no overlap)
    const firstPageIds = firstPageEdges.map(
      (edge: { node: { id: string } }) => edge.node.id,
    );
    const secondPageIds = secondPageEdges.map(
      (edge: { node: { id: string } }) => edge.node.id,
    );
    const overlap = firstPageIds.filter((id: string) =>
      secondPageIds.includes(id),
    );

    expect(overlap.length).toBe(0);
  });

  it.skip('should return clear error when using cursor pagination with relation orderBy', async () => {
    // First get a cursor by fetching records
    const firstQueryData = {
      query: gql`
        query People(
          $orderBy: [PersonOrderByInput]
          $filter: PersonFilterInput
        ) {
          people(orderBy: $orderBy, filter: $filter, first: 3) {
            edges {
              node {
                id
              }
              cursor
            }
            pageInfo {
              hasNextPage
              endCursor
            }
          }
        }
      `,
      variables: {
        orderBy: [{ company: { name: 'AscNullsLast' } }],
        filter: { id: { in: TEST_PERSON_IDS } },
      },
    };

    const firstResponse = await makeGraphqlAPIRequest(firstQueryData);

    expect(firstResponse.body.data).toBeDefined();
    expect(firstResponse.body.errors).toBeUndefined();

    const pageInfo = firstResponse.body.data.people.pageInfo;

    // Assert we have enough data for pagination test
    expect(pageInfo.hasNextPage).toBe(true);
    expect(pageInfo.endCursor).toBeDefined();

    // Try to use cursor with relation orderBy - should fail with clear error
    const secondQueryData = {
      query: gql`
        query People(
          $orderBy: [PersonOrderByInput]
          $filter: PersonFilterInput
          $after: String
        ) {
          people(orderBy: $orderBy, filter: $filter, first: 3, after: $after) {
            edges {
              node {
                id
              }
            }
          }
        }
      `,
      variables: {
        orderBy: [{ company: { name: 'AscNullsLast' } }],
        filter: { id: { in: TEST_PERSON_IDS } },
        after: pageInfo.endCursor,
      },
    };

    const secondResponse = await makeGraphqlAPIRequest(secondQueryData);

    expect(secondResponse.body.errors).toBeDefined();

    expect(secondResponse.body.errors[0].message).toContain(
      'Cursor-based pagination is not supported with relation field ordering',
    );
  });

  it('should allow sorting by relation FK (backward compatibility)', async () => {
    const queryData = {
      query: gql`
        query People(
          $orderBy: [PersonOrderByInput]
          $filter: PersonFilterInput
        ) {
          people(orderBy: $orderBy, filter: $filter, first: 10) {
            edges {
              node {
                id
                companyId
              }
            }
          }
        }
      `,
      variables: {
        orderBy: [{ companyId: 'AscNullsLast' }],
        filter: { id: { in: TEST_PERSON_IDS } },
      },
    };

    const response = await makeGraphqlAPIRequest(queryData);

    expect(response.body.data).toBeDefined();
    expect(response.body.errors).toBeUndefined();

    const edges = response.body.data.people.edges;

    expect(Array.isArray(edges)).toBe(true);
    expect(edges.length).toBeGreaterThan(0);
  });

  it('should sort case-insensitively (acme and ACME should sort together before Zebra)', async () => {
    const queryData = {
      query: gql`
        query People(
          $orderBy: [PersonOrderByInput]
          $filter: PersonFilterInput
        ) {
          people(orderBy: $orderBy, filter: $filter, first: 10) {
            edges {
              node {
                id
                company {
                  name
                }
              }
            }
          }
        }
      `,
      variables: {
        orderBy: [{ company: { name: 'AscNullsLast' } }],
        filter: { id: { in: CASE_INSENSITIVE_TEST_PERSON_IDS } },
      },
    };

    const response = await makeGraphqlAPIRequest(queryData);

    expect(response.body.data).toBeDefined();
    expect(response.body.errors).toBeUndefined();

    const edges = response.body.data.people.edges;
    const companyNames = edges.map(
      (edge: { node: { company?: { name: string } } }) =>
        edge.node.company?.name,
    );

    expect(companyNames.length).toBe(3);

    // Both "acme" and "ACME" should come before "Zebra" in case-insensitive sort
    const zebraIndex = companyNames.findIndex(
      (name: string) => name.toLowerCase() === 'zebra',
    );
    const acmeIndices = companyNames
      .map((name: string, index: number) =>
        name.toLowerCase() === 'acme' ? index : -1,
      )
      .filter((index: number) => index !== -1);

    // All ACME variants should appear before Zebra
    for (const acmeIndex of acmeIndices) {
      expect(acmeIndex).toBeLessThan(zebraIndex);
    }
  });

  it('should sort case-insensitively in descending order', async () => {
    const queryData = {
      query: gql`
        query People(
          $orderBy: [PersonOrderByInput]
          $filter: PersonFilterInput
        ) {
          people(orderBy: $orderBy, filter: $filter, first: 10) {
            edges {
              node {
                id
                company {
                  name
                }
              }
            }
          }
        }
      `,
      variables: {
        orderBy: [{ company: { name: 'DescNullsLast' } }],
        filter: { id: { in: CASE_INSENSITIVE_TEST_PERSON_IDS } },
      },
    };

    const response = await makeGraphqlAPIRequest(queryData);

    expect(response.body.data).toBeDefined();
    expect(response.body.errors).toBeUndefined();

    const edges = response.body.data.people.edges;
    const companyNames = edges.map(
      (edge: { node: { company?: { name: string } } }) =>
        edge.node.company?.name,
    );

    expect(companyNames.length).toBe(3);

    // In descending case-insensitive order, "Zebra" should come first
    const zebraIndex = companyNames.findIndex(
      (name: string) => name.toLowerCase() === 'zebra',
    );
    const acmeIndices = companyNames
      .map((name: string, index: number) =>
        name.toLowerCase() === 'acme' ? index : -1,
      )
      .filter((index: number) => index !== -1);

    // Zebra should appear before all ACME variants in descending order
    for (const acmeIndex of acmeIndices) {
      expect(zebraIndex).toBeLessThan(acmeIndex);
    }
  });

  it('should work with filter + relation orderBy + scalar orderBy with minimal fields selected', async () => {
    // This test reproduces a bug where TypeORM's DISTINCT subquery failed
    // when orderBy included columns not in the SELECT clause.
    // The bug manifested as: "column distinctAlias.person_position does not exist"
    const queryData = {
      query: gql`
        query People(
          $orderBy: [PersonOrderByInput]
          $filter: PersonFilterInput
          $limit: Int
        ) {
          people(orderBy: $orderBy, filter: $filter, first: $limit) {
            edges {
              node {
                id
              }
              cursor
            }
            pageInfo {
              hasNextPage
              hasPreviousPage
              startCursor
              endCursor
            }
            totalCount
          }
        }
      `,
      variables: {
        // Filter excludes one record - key to triggering the DISTINCT subquery path
        filter: { id: { neq: TEST_PERSON_IDS[0] } },
        // Multiple orderBy: relation field + scalar field (position not in SELECT)
        orderBy: [
          { company: { name: 'DescNullsLast' } },
          { position: 'AscNullsFirst' },
        ],
        limit: 60,
      },
    };

    const response = await makeGraphqlAPIRequest(queryData);

    // Should succeed without "column distinctAlias.person_position does not exist" error
    expect(response.body.errors).toBeUndefined();
    expect(response.body.data).toBeDefined();
    expect(response.body.data.people).toBeDefined();

    const edges = response.body.data.people.edges;

    expect(Array.isArray(edges)).toBe(true);

    // Verify the filtered record is not in the results
    const resultIds = edges.map(
      (edge: { node: { id: string } }) => edge.node.id,
    );

    expect(resultIds).not.toContain(TEST_PERSON_IDS[0]);
  });
});
