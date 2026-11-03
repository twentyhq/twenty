import gql from 'graphql-tag';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';

export const revokeApiKey = async ({
  apiKeyId,
  accessToken,
}: {
  apiKeyId: string;
  accessToken: string;
}) => {
  const mutation = gql`
    mutation RevokeApiKey($input: RevokeApiKeyInput!) {
      revokeApiKey(input: $input) {
        id
      }
    }
  `;

  return await makeMetadataApiRequest(
    { query: mutation, variables: { input: { id: apiKeyId } } },
    accessToken,
  );
};
