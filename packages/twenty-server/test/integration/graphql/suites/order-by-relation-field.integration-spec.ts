import gql from 'graphql-tag';
import { createManyOperationFactory } from 'test/integration/graphql/utils/create-many-operation-factory.util';
import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';

const TEST_COMPANY_IDS = {
  ALPHA: '20202020-aaaa-4000-8000-000000000001',
  BETA: '20202020-aaaa-4000-8000-000000000002',
  GAMMA: '20202020-aaaa-4000-8000-000000000003',
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
        { id: TEST_COMPANY_IDS.ACME_LOWER, name: 'acme' },
        { id: TEST_COMPANY_IDS.ACME_UPPER, name: 'ACME' },
        { id: TEST_COMPANY_IDS.ZEBRA, name: 'Zebra' },
      ],
      upsert: true,
    });

    await makeGraphqlAPIRequest(createCompanies);

    const createPeople = createManyOperationFactory({
      objectMetadataSingularName: 'person',
      objectMetadataPluralName: 'people',
      gqlFields: 'id',
      data: [
        { id: TEST_PERSON_IDS[0], companyId: TEST_COMPANY_IDS.ALPHA },
        { id: TEST_PERSON_IDS[1], companyId: TEST_COMPANY_IDS.ALPHA },
        { id: TEST_PERSON_IDS[2], companyId: TEST_COMPANY_IDS.BETA },
        { id: TEST_PERSON_IDS[3], companyId: TEST_COMPANY_IDS.BETA },
        { id: TEST_PERSON_IDS[4], companyId: TEST_COMPANY_IDS.GAMMA },
        { id: TEST_PERSON_IDS[5], companyId: TEST_COMPANY_IDS.GAMMA },
        { id: TEST_PERSON_IDS[6], companyId: null },
        { id: TEST_PERSON_IDS[7], companyId: null },
        { id: TEST_PERSON_IDS[8], companyId: null },
        { id: TEST_PERSON_IDS[9], companyId: null },
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

  it('should paginate exhaustively with cursors when the ordered relation field is selected', async () => {
    const collectedIds: string[] = [];
    const collectedCompanyNames: (string | null)[] = [];
    let after: string | undefined = undefined;

    for (let iteration = 0; iteration < 10; iteration++) {
      const response = await makeGraphqlAPIRequest({
        query: gql`
          query People(
            $orderBy: [PersonOrderByInput]
            $filter: PersonFilterInput
            $after: String
          ) {
            people(
              orderBy: $orderBy
              filter: $filter
              first: 3
              after: $after
            ) {
              edges {
                node {
                  id
                  company {
                    name
                  }
                }
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
          after,
        },
      });

      expect(response.body.errors).toBeUndefined();

      const connection = response.body.data.people;

      for (const edge of connection.edges) {
        collectedIds.push(edge.node.id);
        collectedCompanyNames.push(edge.node.company?.name ?? null);
      }

      if (!connection.pageInfo.hasNextPage) {
        break;
      }

      after = connection.pageInfo.endCursor;
    }

    expect(collectedIds).toHaveLength(TEST_PERSON_IDS.length);
    expect(new Set(collectedIds).size).toBe(TEST_PERSON_IDS.length);

    // Company names must be globally non-decreasing across pages, nulls last
    const companyNames = collectedCompanyNames.filter(
      (name): name is string => name !== null,
    );

    expect(companyNames).toEqual([...companyNames].sort());
    expect(collectedCompanyNames.slice(companyNames.length)).toEqual(
      Array(TEST_PERSON_IDS.length - companyNames.length).fill(null),
    );
  });

  it('should walk backward across the missing-relation boundary with before cursors', async () => {
    const forwardResponse = await makeGraphqlAPIRequest({
      query: gql`
        query People(
          $orderBy: [PersonOrderByInput]
          $filter: PersonFilterInput
          $first: Int
        ) {
          people(orderBy: $orderBy, filter: $filter, first: $first) {
            edges {
              node {
                id
                company {
                  name
                }
              }
            }
            pageInfo {
              endCursor
            }
          }
        }
      `,
      variables: {
        orderBy: [{ company: { name: 'AscNullsLast' } }],
        filter: { id: { in: TEST_PERSON_IDS } },
        first: TEST_PERSON_IDS.length,
      },
    });

    expect(forwardResponse.body.errors).toBeUndefined();

    const forwardConnection = forwardResponse.body.data.people;
    const forwardIds = forwardConnection.edges.map(
      (edge: { node: { id: string } }) => edge.node.id,
    );

    expect(forwardIds).toHaveLength(TEST_PERSON_IDS.length);

    const backwardIds: string[] = [];
    let before: string | undefined = forwardConnection.pageInfo.endCursor;

    for (let iteration = 0; iteration < 10; iteration++) {
      const response = await makeGraphqlAPIRequest({
        query: gql`
          query People(
            $orderBy: [PersonOrderByInput]
            $filter: PersonFilterInput
            $before: String
          ) {
            people(
              orderBy: $orderBy
              filter: $filter
              last: 3
              before: $before
            ) {
              edges {
                node {
                  id
                  company {
                    name
                  }
                }
              }
              pageInfo {
                hasPreviousPage
                startCursor
              }
            }
          }
        `,
        variables: {
          orderBy: [{ company: { name: 'AscNullsLast' } }],
          filter: { id: { in: TEST_PERSON_IDS } },
          before,
        },
      });

      expect(response.body.errors).toBeUndefined();

      const connection = response.body.data.people;

      backwardIds.unshift(
        ...connection.edges.map(
          (edge: { node: { id: string } }) => edge.node.id,
        ),
      );

      if (!connection.pageInfo.hasPreviousPage) {
        break;
      }

      before = connection.pageInfo.startCursor;
    }

    // Everything before the last record, in the same order as the forward scan
    expect(backwardIds).toEqual(forwardIds.slice(0, -1));
  });

  // Cursors read the relation orderBy values from the ordering join itself,
  // so pagination must not depend on the selection set (issue #24333)
  it('should paginate exhaustively without the ordered relation field selected', async () => {
    const collectedIds: string[] = [];
    let after: string | undefined = undefined;

    for (let iteration = 0; iteration < 10; iteration++) {
      const response = await makeGraphqlAPIRequest({
        query: gql`
          query People(
            $orderBy: [PersonOrderByInput]
            $filter: PersonFilterInput
            $after: String
          ) {
            people(
              orderBy: $orderBy
              filter: $filter
              first: 3
              after: $after
            ) {
              edges {
                node {
                  id
                }
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
          after,
        },
      });

      expect(response.body.errors).toBeUndefined();

      const connection = response.body.data.people;

      collectedIds.push(
        ...connection.edges.map((edge: { node: { id: string } }) => edge.node.id),
      );

      if (!connection.pageInfo.hasNextPage) {
        break;
      }

      after = connection.pageInfo.endCursor;
    }

    // Companies sort Alpha < Beta < Gamma with id tie-breaks, then the
    // missing-relation block in id order: exactly the seeded id order
    expect(collectedIds).toEqual(TEST_PERSON_IDS);
  });

  it('should paginate from an edge cursor without the ordered relation field selected', async () => {
    const collectedIds: string[] = [];
    let after: string | undefined = undefined;

    for (let iteration = 0; iteration < 20; iteration++) {
      const response = await makeGraphqlAPIRequest({
        query: gql`
          query People(
            $orderBy: [PersonOrderByInput]
            $filter: PersonFilterInput
            $after: String
          ) {
            people(
              orderBy: $orderBy
              filter: $filter
              first: 2
              after: $after
            ) {
              edges {
                node {
                  id
                }
                cursor
              }
              pageInfo {
                hasNextPage
              }
            }
          }
        `,
        variables: {
          orderBy: [{ company: { name: 'AscNullsLast' } }],
          filter: { id: { in: TEST_PERSON_IDS } },
          after,
        },
      });

      expect(response.body.errors).toBeUndefined();

      const connection = response.body.data.people;

      collectedIds.push(
        ...connection.edges.map((edge: { node: { id: string } }) => edge.node.id),
      );

      if (!connection.pageInfo.hasNextPage) {
        break;
      }

      after = connection.edges[connection.edges.length - 1].cursor;
    }

    expect(collectedIds).toEqual(TEST_PERSON_IDS);
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

    const zebraIndex = companyNames.findIndex(
      (name: string) => name.toLowerCase() === 'zebra',
    );
    const acmeIndices = companyNames
      .map((name: string, index: number) =>
        name.toLowerCase() === 'acme' ? index : -1,
      )
      .filter((index: number) => index !== -1);

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

    const zebraIndex = companyNames.findIndex(
      (name: string) => name.toLowerCase() === 'zebra',
    );
    const acmeIndices = companyNames
      .map((name: string, index: number) =>
        name.toLowerCase() === 'acme' ? index : -1,
      )
      .filter((index: number) => index !== -1);

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

const COMPOSITE_TEST_PERSON_IDS = {
  ADA_LOVELACE: '20202020-cccc-4000-8000-000000000001',
  ADA_ZUSE: '20202020-cccc-4000-8000-000000000002',
  GRACE_HOPPER: '20202020-cccc-4000-8000-000000000003',
  LINUS_TORVALDS: '20202020-cccc-4000-8000-000000000004',
};

const COMPOSITE_TEST_OPPORTUNITY_IDS = [
  '20202020-dddd-4000-8000-000000000001',
  '20202020-dddd-4000-8000-000000000002',
  '20202020-dddd-4000-8000-000000000003',
  '20202020-dddd-4000-8000-000000000004',
  '20202020-dddd-4000-8000-000000000005',
  '20202020-dddd-4000-8000-000000000006',
];

// The web app sorts a relation column by the target's label identifier; for a
// person target that is the FULL_NAME composite, sent as one orderBy entry per
// property: [{ pointOfContact: { name: { firstName } } }, { ...lastName... }]
describe('Order by a composite field through a relation (e2e)', () => {
  const orderBy = [
    { pointOfContact: { name: { firstName: 'AscNullsLast' } } },
    { pointOfContact: { name: { lastName: 'AscNullsLast' } } },
  ];

  // Opportunities ordered by their contact's (firstName, lastName), the two
  // Adas separated by lastName, then the two without a contact in id order
  const expectedOpportunityIds = COMPOSITE_TEST_OPPORTUNITY_IDS;

  beforeAll(async () => {
    const createPeople = createManyOperationFactory({
      objectMetadataSingularName: 'person',
      objectMetadataPluralName: 'people',
      gqlFields: 'id',
      data: [
        {
          id: COMPOSITE_TEST_PERSON_IDS.ADA_LOVELACE,
          name: { firstName: 'Ada', lastName: 'Lovelace' },
        },
        {
          id: COMPOSITE_TEST_PERSON_IDS.ADA_ZUSE,
          name: { firstName: 'Ada', lastName: 'Zuse' },
        },
        {
          id: COMPOSITE_TEST_PERSON_IDS.GRACE_HOPPER,
          name: { firstName: 'Grace', lastName: 'Hopper' },
        },
        {
          id: COMPOSITE_TEST_PERSON_IDS.LINUS_TORVALDS,
          name: { firstName: 'Linus', lastName: 'Torvalds' },
        },
      ],
      upsert: true,
    });

    await makeGraphqlAPIRequest(createPeople);

    const createOpportunities = createManyOperationFactory({
      objectMetadataSingularName: 'opportunity',
      objectMetadataPluralName: 'opportunities',
      gqlFields: 'id',
      data: [
        {
          id: COMPOSITE_TEST_OPPORTUNITY_IDS[0],
          name: 'Deal Ada Lovelace',
          pointOfContactId: COMPOSITE_TEST_PERSON_IDS.ADA_LOVELACE,
        },
        {
          id: COMPOSITE_TEST_OPPORTUNITY_IDS[1],
          name: 'Deal Ada Zuse',
          pointOfContactId: COMPOSITE_TEST_PERSON_IDS.ADA_ZUSE,
        },
        {
          id: COMPOSITE_TEST_OPPORTUNITY_IDS[2],
          name: 'Deal Grace',
          pointOfContactId: COMPOSITE_TEST_PERSON_IDS.GRACE_HOPPER,
        },
        {
          id: COMPOSITE_TEST_OPPORTUNITY_IDS[3],
          name: 'Deal Linus',
          pointOfContactId: COMPOSITE_TEST_PERSON_IDS.LINUS_TORVALDS,
        },
        {
          id: COMPOSITE_TEST_OPPORTUNITY_IDS[4],
          name: 'Deal without contact 1',
          pointOfContactId: null,
        },
        {
          id: COMPOSITE_TEST_OPPORTUNITY_IDS[5],
          name: 'Deal without contact 2',
          pointOfContactId: null,
        },
      ],
      upsert: true,
    });

    await makeGraphqlAPIRequest(createOpportunities);
  });

  const fetchPage = async (variables: Record<string, unknown>) => {
    const response = await makeGraphqlAPIRequest({
      query: gql`
        query Opportunities(
          $orderBy: [OpportunityOrderByInput]
          $filter: OpportunityFilterInput
          $first: Int
          $last: Int
          $after: String
          $before: String
        ) {
          opportunities(
            orderBy: $orderBy
            filter: $filter
            first: $first
            last: $last
            after: $after
            before: $before
          ) {
            edges {
              node {
                id
              }
            }
            pageInfo {
              hasNextPage
              hasPreviousPage
              startCursor
              endCursor
            }
          }
        }
      `,
      variables: {
        orderBy,
        filter: { id: { in: COMPOSITE_TEST_OPPORTUNITY_IDS } },
        ...variables,
      },
    });

    expect(response.body.errors).toBeUndefined();

    return response.body.data.opportunities;
  };

  it('should paginate exhaustively in the label order with only id selected', async () => {
    const collectedIds: string[] = [];
    let after: string | undefined = undefined;
    let pages = 0;

    for (let iteration = 0; iteration < 10; iteration++) {
      const connection = await fetchPage({ first: 2, after });

      collectedIds.push(
        ...connection.edges.map(
          (edge: { node: { id: string } }) => edge.node.id,
        ),
      );
      pages++;

      if (!connection.pageInfo.hasNextPage) {
        break;
      }

      after = connection.pageInfo.endCursor;
    }

    expect(collectedIds).toEqual(expectedOpportunityIds);
    expect(pages).toBe(3);
  });

  it('should walk backward across the missing-contact boundary', async () => {
    const forwardConnection = await fetchPage({
      first: COMPOSITE_TEST_OPPORTUNITY_IDS.length,
    });
    const endCursor = forwardConnection.pageInfo.endCursor;

    const collectedIds: string[] = [];
    let before: string | undefined = endCursor;

    for (let iteration = 0; iteration < 10; iteration++) {
      const connection = await fetchPage({ last: 2, before });

      collectedIds.unshift(
        ...connection.edges.map(
          (edge: { node: { id: string } }) => edge.node.id,
        ),
      );

      if (!connection.pageInfo.hasPreviousPage) {
        break;
      }

      before = connection.pageInfo.startCursor;
    }

    // Everything before the last record, in forward order
    expect(collectedIds).toEqual(expectedOpportunityIds.slice(0, -1));
  });
});
