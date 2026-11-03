import gql from 'graphql-tag';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';

export const createApiKey = async ({
  name,
  expiresAt,
  roleId,
  accessToken,
}: {
  name: string;
  expiresAt: string;
  roleId: string;
  accessToken: string;
}) => {
  const mutation = gql`
    mutation CreateApiKey($input: CreateApiKeyInput!) {
      createApiKey(input: $input) {
        id
      }
    }
  `;

  return await makeMetadataApiRequest(
    { query: mutation, variables: { input: { name, expiresAt, roleId } } },
    accessToken,
  );
};
