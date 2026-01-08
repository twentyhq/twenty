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

  // TODO: Cursor pagination with relation field ordering requires additional work
  // to support nested orderBy in cursor validation. Skip for now.
  it.skip('should work with cursor pagination', async () => {
    // First request to get some data
    const firstQueryData = {
      query: gql`
        query People($orderBy: [PersonOrderByInput]) {
          people(orderBy: $orderBy, first: 3) {
            edges {
              node {
                id
                company {
                  name
                }
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
      },
    };

    const firstResponse = await makeGraphqlAPIRequest(firstQueryData);

    expect(firstResponse.body.data).toBeDefined();
    expect(firstResponse.body.errors).toBeUndefined();

    const firstPageEdges = firstResponse.body.data.people.edges;
    const pageInfo = firstResponse.body.data.people.pageInfo;

    expect(Array.isArray(firstPageEdges)).toBe(true);
    expect(firstPageEdges.length).toBeGreaterThan(0);

    // Second request using cursor
    if (pageInfo.hasNextPage && pageInfo.endCursor) {
      const secondQueryData = {
        query: gql`
          query People($orderBy: [PersonOrderByInput], $after: String) {
            people(orderBy: $orderBy, first: 3, after: $after) {
              edges {
                node {
                  id
                  company {
                    name
                  }
                }
                cursor
              }
            }
          }
        `,
        variables: {
          orderBy: [{ company: { name: 'AscNullsLast' } }],
          after: pageInfo.endCursor,
        },
      };

      const secondResponse = await makeGraphqlAPIRequest(secondQueryData);

      expect(secondResponse.body.data).toBeDefined();
      expect(secondResponse.body.errors).toBeUndefined();

      const secondPageEdges = secondResponse.body.data.people.edges;

      expect(Array.isArray(secondPageEdges)).toBe(true);

      // Verify pages don't overlap
      const firstPageIds = firstPageEdges.map(
        (edge: { node: { id: string } }) => edge.node.id,
      );
      const secondPageIds = secondPageEdges.map(
        (edge: { node: { id: string } }) => edge.node.id,
      );
      const intersection = firstPageIds.filter((id: string) =>
        secondPageIds.includes(id),
      );

      expect(intersection.length).toBe(0);
    }
  });

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
