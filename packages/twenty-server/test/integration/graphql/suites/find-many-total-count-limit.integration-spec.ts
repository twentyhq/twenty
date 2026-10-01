import gql from 'graphql-tag';

import { makeGraphqlApiRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';

const findCompanyCount = (totalCountLimit?: number) =>
  makeGraphqlApiRequest({
    query: gql`
      query Companies($totalCountLimit: Int) {
        companies(first: 1, totalCountLimit: $totalCountLimit) {
          totalCount
          edges {
            node {
              id
            }
          }
        }
      }
    `,
    variables: { totalCountLimit },
  });

describe('findMany totalCountLimit (e2e)', () => {
  let exactTotalCount: number;

  beforeAll(async () => {
    const response = await findCompanyCount();

    expect(response.body.errors).toBeUndefined();
    exactTotalCount = response.body.data.companies.totalCount;
    expect(exactTotalCount).toBeGreaterThan(2);
  });

  it('counts exactly up to the limit', async () => {
    const response = await findCompanyCount(exactTotalCount);

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.companies.totalCount).toBe(exactTotalCount);
  });

  it('reports one past the limit when more records match', async () => {
    const response = await findCompanyCount(2);

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.companies.totalCount).toBe(3);
    expect(response.body.data.companies.edges).toHaveLength(1);
  });

  it('refuses a negative limit', async () => {
    const response = await findCompanyCount(-1);

    expect(response.body.errors?.[0]?.message).toContain('totalCountLimit');
  });
});
