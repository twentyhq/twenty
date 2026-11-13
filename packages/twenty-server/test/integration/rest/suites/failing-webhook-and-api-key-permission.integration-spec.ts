import { expectPermissionDeniedResponse } from 'test/integration/permissions/utils/expect-permission-denied-response.util';
import {
  makeRestApiRequest,
  type RestApiRequestMethod,
} from 'test/integration/rest/utils/make-rest-api-request.util';

describe('REST webhooks and API keys without settings permission', () => {
  it.each<{ method: RestApiRequestMethod; path: string; body?: object }>([
    { method: 'get', path: '/webhooks' },
    {
      method: 'post',
      path: '/webhooks',
      body: { targetUrl: 'https://example.com/hook', operations: ['*.*'] },
    },
    { method: 'get', path: '/apiKeys' },
    {
      method: 'post',
      path: '/apiKeys',
      body: { name: 'Denied key', expiresAt: '2099-01-01T00:00:00.000Z' },
    },
  ])('should refuse $method $path with 403', async ({ method, path, body }) => {
    const response = await makeRestApiRequest({
      method,
      path,
      bearer: APPLE_JONY_MEMBER_ACCESS_TOKEN,
      body,
    });

    expectPermissionDeniedResponse({ api: 'rest', response });
  });
});
