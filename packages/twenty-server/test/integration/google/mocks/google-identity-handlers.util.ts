import { http, HttpResponse } from 'msw';

import { GOOGLE_OAUTH_SCOPES } from 'test/integration/google/mocks/google-oauth-scopes.constant';
import { type MswHandler } from 'test/integration/utils/http-mock.util';

export const googleIdentityHandlers = (handle: string): MswHandler[] => [
  http.get('https://www.googleapis.com/oauth2/v3/userinfo', () =>
    HttpResponse.json({
      sub: `google-user-id-${handle}`,
      email: handle,
      email_verified: true,
      name: 'Jane Austen',
      given_name: 'Jane',
      family_name: 'Austen',
    }),
  ),
  http.get('https://www.googleapis.com/oauth2/v3/tokeninfo', () =>
    HttpResponse.json({ scope: GOOGLE_OAUTH_SCOPES, email: handle }),
  ),
  http.get('https://gmail.googleapis.com/gmail/v1/users/me/profile', () =>
    HttpResponse.json({ emailAddress: handle, messagesTotal: 0 }),
  ),
  http.get('*/gmail/v1/users/me/settings/sendAs', () =>
    HttpResponse.json({ sendAs: [{ sendAsEmail: handle, isPrimary: true }] }),
  ),
];
