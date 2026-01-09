import gql from 'graphql-tag';
import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';

describe('Order by relation field (e2e)', () => {
  it('should sort people by company name ascending', async () => {
    const queryData = {
      query: gql`
        query People($orderBy: [PersonOrderByInput]) {
          people(orderBy: $orderBy, first: 10) {
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
      },
    };

    const response = await makeGraphqlAPIRequest(queryData);

    expect(response.body.data).toBeDefined();
    expect(response.body.errors).toBeUndefined();

    const edges = response.body.data.people.edges;

    expect(Array.isArray(edges)).toBe(true);

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
        query People($orderBy: [PersonOrderByInput]) {
          people(orderBy: $orderBy, first: 10) {
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
      },
    };

    const response = await makeGraphqlAPIRequest(queryData);

    expect(response.body.data).toBeDefined();
    expect(response.body.errors).toBeUndefined();

    const edges = response.body.data.people.edges;

    expect(Array.isArray(edges)).toBe(true);

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
        query People($orderBy: [PersonOrderByInput]) {
          people(orderBy: $orderBy, first: 50) {
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
      },
    };

    const response = await makeGraphqlAPIRequest(queryData);

    expect(response.body.data).toBeDefined();
    expect(response.body.errors).toBeUndefined();

    const edges = response.body.data.people.edges;

    expect(Array.isArray(edges)).toBe(true);

    // Check that null companies appear at the end
    let seenNull = false;

    for (const edge of edges) {
      if (edge.node.company === null) {
        seenNull = true;
      } else if (seenNull) {
        // If we already saw a null, subsequent non-nulls mean order is wrong
        fail('Records with null company should appear at the end');
      }
    }
  });

  it('should work with offset pagination', async () => {
    // First request to get initial data
    const firstQueryData = {
      query: gql`
        query People($orderBy: [PersonOrderByInput], $limit: Int) {
          people(orderBy: $orderBy, first: $limit) {
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

    // Second request using offset (matching frontend behavior)
    if (totalCount > 3) {
      const secondQueryData = {
        query: gql`
          query People(
            $orderBy: [PersonOrderByInput]
            $limit: Int
            $offset: Int
          ) {
            people(orderBy: $orderBy, first: $limit, offset: $offset) {
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
    }
  });

  // TODO: Cursor-based pagination with relation field ordering is not yet supported.
  // The cursor contains the related object values, but building WHERE conditions
  // for nested fields (e.g., company.name > 'X') requires JOINs in the cursor filter,
  // which is not currently implemented. The frontend uses offset pagination instead.

  it('should allow sorting by relation FK (backward compatibility)', async () => {
    const queryData = {
      query: gql`
        query People($orderBy: [PersonOrderByInput]) {
          people(orderBy: $orderBy, first: 10) {
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
      },
    };

    const response = await makeGraphqlAPIRequest(queryData);

    expect(response.body.data).toBeDefined();
    expect(response.body.errors).toBeUndefined();

    const edges = response.body.data.people.edges;

    expect(Array.isArray(edges)).toBe(true);
  });
});
