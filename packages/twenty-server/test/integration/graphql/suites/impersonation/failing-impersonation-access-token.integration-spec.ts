import gql from 'graphql-tag';
import { expectOneNotInternalServerErrorSnapshot } from 'test/integration/graphql/utils/expect-one-not-internal-server-error-snapshot.util';
import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';

// Exercises the per-request JWT validation checkpoint (jwt.auth.strategy):
// an impersonation access token whose impersonator is not authorized to
// impersonate the target must be rejected on every protected query.
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

    expectOneNotInternalServerErrorSnapshot({ errors: response.body.errors });
  });
});
