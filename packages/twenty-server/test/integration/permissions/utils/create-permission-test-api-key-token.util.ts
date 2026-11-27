import { createApiKey } from 'test/integration/graphql/utils/create-api-key.util';
import { generateApiKeyToken } from 'test/integration/graphql/utils/generate-api-key-token.util';

export const createPermissionTestApiKeyToken = async ({
  roleId,
  adminAccessToken,
}: {
  roleId: string;
  adminAccessToken: string;
}): Promise<string> => {
  const apiKeyResponse = await createApiKey({
    name: `Permission test ${roleId}`,
    expiresAt: '2099-01-01T00:00:00Z',
    roleId,
    accessToken: adminAccessToken,
  });

  expect(apiKeyResponse.body.errors).toBeUndefined();

  const tokenResponse = await generateApiKeyToken({
    apiKeyId: apiKeyResponse.body.data.createApiKey.id,
    accessToken: adminAccessToken,
  });

  expect(tokenResponse.body.errors).toBeUndefined();

  return tokenResponse.body.data.generateApiKeyToken.token;
};
