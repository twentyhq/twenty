import gql from 'graphql-tag';
import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';

// Exercises the per-request JWT validation checkpoint (jwt.auth.strategy):
// an access token flagged as impersonating but pointing at an invalid
// impersonator user-workspace must be rejected on every protected query.
describe('Impersonation - access token validation denial (integration)', () => {
  it('rejects an invalid impersonation access token on a protected query', async () => {
    const query = gql`
      query People {
        people {
          edges {
            node {
              id
            }
          }
        }
      }
    `;

    const response = await makeGraphqlAPIRequest(
      { query },
      APPLE_SARAH_IMPERSONATE_TIM_INVALID_ACCESS_TOKEN,
    );

    expect(response.body.errors).toBeDefined();
    expect(response.body.errors[0].message).toContain(
      'cannot find impersonator or impersonated user workspace',
    );
  });
});
