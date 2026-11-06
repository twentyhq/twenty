import { randomUUID } from 'node:crypto';

import { createApiKey } from 'test/integration/graphql/utils/create-api-key.util';

export const createApiKeyForRole = async ({
  roleId,
  accessToken,
}: {
  roleId: string;
  accessToken: string;
}) => {
  const response = await createApiKey({
    name: `Record access ${randomUUID()}`,
    expiresAt: '2099-01-01T00:00:00Z',
    roleId,
    accessToken,
  });

  expect(response.body.errors).toBeUndefined();

  return response.body.data.createApiKey.id as string;
};
