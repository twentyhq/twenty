import { http, HttpResponse } from 'msw';

import { type MswHandler } from 'test/integration/utils/http-mock.util';

export const microsoftAuthHandlers = (handle: string): MswHandler[] => [
  http.post('https://login.microsoftonline.com/common/oauth2/v2.0/token', () =>
    HttpResponse.json({
      token_type: 'Bearer',
      access_token: 'mock-access-token',
      refresh_token: 'mock-refresh-token',
      expires_in: 3600,
      scope: 'openid profile email offline_access',
    }),
  ),
  http.get('https://graph.microsoft.com/v1.0/me', () =>
    HttpResponse.json({
      id: 'microsoft-user-id',
      displayName: 'Jane Austen',
      givenName: 'Jane',
      surname: 'Austen',
      mail: handle,
      userPrincipalName: handle,
    }),
  ),
];
