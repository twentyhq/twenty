import gql from 'graphql-tag';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';

export const renewToken = async (appToken: string) => {
  const mutation = gql`
    mutation RenewToken($appToken: String!) {
      renewToken(appToken: $appToken) {
        tokens {
          accessOrWorkspaceAgnosticToken {
            token
          }
          refreshToken {
            token
          }
        }
      }
    }
  `;

  return await makeMetadataApiRequest(
    { query: mutation, variables: { appToken } },
    undefined,
  );
};
