import { http, HttpResponse } from 'msw';

import { GOOGLE_OAUTH_SCOPES } from 'test/integration/google/mocks/google-oauth-scopes.constant';
import { type MswHandler } from 'test/integration/utils/http-mock.util';

export const GOOGLE_TOKEN_URLS = [
  'https://oauth2.googleapis.com/token',
  'https://www.googleapis.com/oauth2/v4/token',
];

export const googleTokenHandlers = (): MswHandler[] =>
  GOOGLE_TOKEN_URLS.map((url) =>
    http.post(url, () =>
      HttpResponse.json({
        access_token: 'mock-access-token',
        refresh_token: 'mock-refresh-token',
        expires_in: 3600,
        scope: GOOGLE_OAUTH_SCOPES,
        token_type: 'Bearer',
      }),
    ),
  );
