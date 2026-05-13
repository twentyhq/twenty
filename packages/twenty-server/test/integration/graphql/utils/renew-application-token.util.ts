import gql from 'graphql-tag';
import { makeMetadataAPIRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';

export const renewApplicationToken = async ({
  applicationRefreshToken,
  accessToken,
}: {
  applicationRefreshToken: string;
  accessToken: string;
}) => {
  const mutation = gql`
    mutation RenewApplicationToken($applicationRefreshToken: String!) {
      renewApplicationToken(applicationRefreshToken: $applicationRefreshToken) {
        applicationAccessToken {
          token
        }
        applicationRefreshToken {
          token
        }
      }
    }
  `;

  return await makeMetadataAPIRequest(
    { query: mutation, variables: { applicationRefreshToken } },
    accessToken,
  );
};
