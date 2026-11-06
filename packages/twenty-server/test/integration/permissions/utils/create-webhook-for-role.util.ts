import { createWebhook } from 'test/integration/metadata/suites/utils/webhook-test.util';

export const createWebhookForRole = async ({
  roleId,
  accessToken,
}: {
  roleId: string;
  accessToken: string;
}): Promise<string> => {
  const response = await createWebhook({
    input: {
      targetUrl: 'https://example.com/webhook',
      operations: ['*.*'],
      roleId,
    },
    token: accessToken,
  });

  expect(response.body.errors).toBeUndefined();

  return response.body.data.createWebhook.id;
};
