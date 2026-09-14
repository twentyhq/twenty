import gql from 'graphql-tag';
import { makeMetadataAPIRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';

export const revokeApiKey = async ({ apiKeyId }: { apiKeyId: string }) => {
  const mutation = gql`
    mutation RevokeApiKey($input: RevokeApiKeyInput!) {
      revokeApiKey(input: $input) {
        id
      }
    }
  `;

  return await makeMetadataAPIRequest({
    query: mutation,
    variables: { input: { id: apiKeyId } },
  });
};
