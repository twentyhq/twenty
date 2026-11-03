import { randomUUID } from 'node:crypto';

import gql from 'graphql-tag';
import { createOneRole } from 'test/integration/metadata/suites/role/utils/create-one-role.util';
import { deleteOneRole } from 'test/integration/metadata/suites/role/utils/delete-one-role.util';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';

import { type CreateRoleInput } from 'src/engine/metadata-modules/role/dtos/create-role.input';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

export type ApiKeyWithObjectRecordGrants = {
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

export const createApiKeyWithObjectRecordGrants = async (
  grants: ObjectRecordGrants,
): Promise<ApiKeyWithObjectRecordGrants> => {
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

export const deleteApiKeysWithObjectRecordGrants = async (
  testApiKeys: ApiKeyWithObjectRecordGrants[],
) => {
  await global.testDataSource.query(
    'DELETE FROM core."apiKey" WHERE id = ANY($1)',
    [testApiKeys.map(({ apiKeyId }) => apiKeyId)],
  );

  await getAppProviderByClassName<WorkspaceCacheService>(
    'WorkspaceCacheService',
  ).invalidateAndRecompute(SEED_APPLE_WORKSPACE_ID, [
    'apiKeyMap',
    'flatRoleTargetMaps',
  ]);

  for (const { roleId } of testApiKeys) {
    await deleteOneRole({ input: { idToDelete: roleId }, expectToFail: false });
  }
};
