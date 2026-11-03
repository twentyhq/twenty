import { randomUUID } from 'node:crypto';

import { createApiKey } from 'test/integration/graphql/utils/create-api-key.util';
import { generateApiKeyToken } from 'test/integration/graphql/utils/generate-api-key-token.util';
import { createOneRole } from 'test/integration/metadata/suites/role/utils/create-one-role.util';

import { type CreateRoleInput } from 'src/engine/metadata-modules/role/dtos/create-role.input';

export type ApiKeyWithObjectRecordGrants = {
  roleId: string;
  apiKeyId: string;
  token: string;
};

export type ObjectRecordGrants = Pick<
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

  const createApiKeyResponse = await createApiKey({
    name: label,
    expiresAt: API_KEY_EXPIRES_AT,
    roleId,
    accessToken: APPLE_JANE_ADMIN_ACCESS_TOKEN,
  });

  const apiKeyId: string = createApiKeyResponse.body.data.createApiKey.id;

  const generateTokenResponse = await generateApiKeyToken({
    apiKeyId,
    accessToken: APPLE_JANE_ADMIN_ACCESS_TOKEN,
    expiresAt: API_KEY_EXPIRES_AT,
  });

  return {
    roleId,
    apiKeyId,
    token: generateTokenResponse.body.data.generateApiKeyToken.token,
  };
};
