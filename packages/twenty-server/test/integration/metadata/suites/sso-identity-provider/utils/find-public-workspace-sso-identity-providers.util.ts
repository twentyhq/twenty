import gql from 'graphql-tag';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { warnIfErrorButNotExpectedToFail } from 'test/integration/metadata/utils/warn-if-error-but-not-expected-to-fail.util';

import { type SsoIdentityProviderDTO } from 'src/engine/core-modules/workspace/dtos/public-workspace-data.dto';

export const findPublicWorkspaceSsoIdentityProviders = async (
  origin: string,
): Promise<SsoIdentityProviderDTO[]> => {
  const response = await makeMetadataApiRequest(
    {
      query: gql`
        query GetPublicWorkspaceDataByDomain($origin: String!) {
          getPublicWorkspaceDataByDomain(origin: $origin) {
            authProviders {
              sso {
                id
                name
                type
                status
                issuer
              }
            }
          }
        }
      `,
      variables: { origin },
    },
    null,
  );

  warnIfErrorButNotExpectedToFail({
    response,
    errorMessage: 'Public workspace data query has failed but should not',
  });

  return response.body.data.getPublicWorkspaceDataByDomain.authProviders.sso;
};
