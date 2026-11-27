import gql from 'graphql-tag';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';

export const assignRoleToApiKey = async ({
  apiKeyId,
  roleId,
  accessToken,
}: {
  apiKeyId: string;
  roleId: string;
  accessToken: string;
}) =>
  makeMetadataApiRequest(
    {
      query: gql`
        mutation AssignRoleToApiKey($apiKeyId: UUID!, $roleId: UUID!) {
          assignRoleToApiKey(apiKeyId: $apiKeyId, roleId: $roleId)
        }
      `,
      variables: { apiKeyId, roleId },
    },
    accessToken,
  );
