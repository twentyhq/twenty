import { randomUUID } from 'node:crypto';

import { createApiKey } from 'test/integration/graphql/utils/create-api-key.util';
import { generateApiKeyToken } from 'test/integration/graphql/utils/generate-api-key-token.util';
import { createRoleWithPermissionFlags } from 'test/integration/metadata/suites/role/utils/create-role-with-permission-flags.util';
import { deleteOneRole } from 'test/integration/metadata/suites/role/utils/delete-one-role.util';
import { type PermissionFlagType } from 'twenty-shared/constants';
import { isDefined } from 'twenty-shared/utils';

export const arrangeApiKeyWithPermissionFlags = async ({
  permissionFlagKeys,
}: {
  permissionFlagKeys: PermissionFlagType[];
}): Promise<{ token: string; cleanup: () => Promise<void> }> => {
  const roleId = await createRoleWithPermissionFlags({ permissionFlagKeys });
  let apiKeyId: string | undefined;

  const cleanup = async () => {
    if (isDefined(apiKeyId)) {
      await globalThis.testDataSource.query(
        'DELETE FROM core."apiKey" WHERE id = $1',
        [apiKeyId],
      );
    }

    await deleteOneRole({ input: { idToDelete: roleId }, expectToFail: false });
  };

  try {
    const createApiKeyResponse = await createApiKey({
      name: `Permission flags ${randomUUID().slice(0, 8)}`,
      expiresAt: '2099-01-01T00:00:00Z',
      roleId,
      accessToken: APPLE_JANE_ADMIN_ACCESS_TOKEN,
    });

    apiKeyId = createApiKeyResponse.body.data?.createApiKey?.id;

    if (!isDefined(apiKeyId)) {
      throw new Error(
        `Failed to create the API key: ${JSON.stringify(createApiKeyResponse.body.errors)}`,
      );
    }

    const generateApiKeyTokenResponse = await generateApiKeyToken({
      apiKeyId,
      accessToken: APPLE_JANE_ADMIN_ACCESS_TOKEN,
      expiresAt: '2099-01-01T00:00:00Z',
    });

    const token: string | undefined =
      generateApiKeyTokenResponse.body.data?.generateApiKeyToken?.token;

    if (!isDefined(token)) {
      throw new Error(
        `Failed to generate the API key token: ${JSON.stringify(generateApiKeyTokenResponse.body.errors)}`,
      );
    }

    return { token, cleanup };
  } catch (error) {
    await cleanup();

    throw error;
  }
};
