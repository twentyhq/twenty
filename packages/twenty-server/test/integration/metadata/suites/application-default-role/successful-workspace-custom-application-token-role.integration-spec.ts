import gql from 'graphql-tag';
import { findWorkspaceCustomApplicationId } from 'test/integration/metadata/suites/application-default-role/utils/find-application-default-role.util';
import { makeGraphqlApiRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { generateApplicationTokenPair } from 'test/integration/utils/generate-application-token-pair.util';

import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

describe('The workspace custom application acts with its own default role', () => {
  let customApplicationToken: string;

  beforeAll(async () => {
    const { applicationAccessToken } = await generateApplicationTokenPair({
      workspaceId: SEED_APPLE_WORKSPACE_ID,
      applicationId: await findWorkspaceCustomApplicationId(),
    });

    customApplicationToken = applicationAccessToken.token;
  });

  it('reads records with its own application token, as a workspace logic function does', async () => {
    const response = await makeGraphqlApiRequest(
      {
        query: gql`
          query Companies {
            companies(first: 5) {
              edges {
                node {
                  id
                }
              }
            }
          }
        `,
      },
      customApplicationToken,
    );

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.companies.edges.length).toBeGreaterThan(0);
  });
});
