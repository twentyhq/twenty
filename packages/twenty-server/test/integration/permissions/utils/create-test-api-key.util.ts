import { randomUUID } from 'node:crypto';

import gql from 'graphql-tag';
import { createOneRole } from 'test/integration/metadata/suites/role/utils/create-one-role.util';
import { deleteOneRole } from 'test/integration/metadata/suites/role/utils/delete-one-role.util';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';

import { type CreateRoleInput } from 'src/engine/metadata-modules/role/dtos/create-role.input';

export type TestApiKey = {
  roleId: string;
  apiKeyId: string;
  token: string;
};

type ObjectRecordGrants = Pick<
  CreateRoleInput,
  | 'canReadAllObjectRecords'
  | 'canUpdateAllObjectRecords'
  | 'canSoftDeleteAllObjectRecords'
  | 'canDestroyAllObjectRecords'
>;

const API_KEY_EXPIRES_AT = '2099-01-01T00:00:00Z';

// Every grant defaults to false, so a test only gets what it asks for.
export const createTestApiKey = async (
  grants: ObjectRecordGrants,
): Promise<TestApiKey> => {
  const label = `Test API key role ${randomUUID()}`;

  const { data: roleData } = await createOneRole({
    input: {
      label,
      canUpdateAllSettings: false,
      canAccessAllTools: false,
      canReadAllObjectRecords: false,
      canUpdateAllObjectRecords: false,
      canSoftDeleteAllObjectRecords: false,
      canDestroyAllObjectRecords: false,
      canBeAssignedToUsers: false,
      canBeAssignedToAgents: false,
      canBeAssignedToApiKeys: true,
      ...grants,
    },
    gqlFields: 'id',
    expectToFail: false,
  });

  const roleId = roleData.createOneRole.id;

  const createApiKeyResponse = await makeMetadataApiRequest({
    query: gql`
      mutation CreateApiKey($input: CreateApiKeyInput!) {
        createApiKey(input: $input) {
          id
        }
      }
    `,
    variables: {
      input: { name: label, expiresAt: API_KEY_EXPIRES_AT, roleId },
    },
  });

  const apiKeyId: string = createApiKeyResponse.body.data.createApiKey.id;

  const generateTokenResponse = await makeMetadataApiRequest({
    query: gql`
      mutation GenerateApiKeyToken($apiKeyId: UUID!, $expiresAt: String!) {
        generateApiKeyToken(apiKeyId: $apiKeyId, expiresAt: $expiresAt) {
          token
        }
      }
    `,
    variables: { apiKeyId, expiresAt: API_KEY_EXPIRES_AT },
  });

  return {
    roleId,
    apiKeyId,
    token: generateTokenResponse.body.data.generateApiKeyToken.token,
  };
};

export const deleteTestApiKeys = async (testApiKeys: TestApiKey[]) => {
  for (const { roleId, apiKeyId } of testApiKeys) {
    await global.testDataSource.query(
      'DELETE FROM core."apiKey" WHERE id = $1',
      [apiKeyId],
    );
    await deleteOneRole({ input: { idToDelete: roleId }, expectToFail: false });
  }
};
