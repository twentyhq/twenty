import gql from 'graphql-tag';
import { makeMetadataAPIRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';

export const generateApiKeyToken = async ({
  apiKeyId,
  accessToken,
  expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString(),
}: {
  apiKeyId: string;
  accessToken: string;
  expiresAt?: string;
}) => {
  const mutation = gql`
    mutation GenerateApiKeyToken($apiKeyId: UUID!, $expiresAt: String!) {
      generateApiKeyToken(apiKeyId: $apiKeyId, expiresAt: $expiresAt) {
        token
      }
    }
  `;

  return await makeMetadataAPIRequest(
    { query: mutation, variables: { apiKeyId, expiresAt } },
    accessToken,
  );
};
