import { http, HttpResponse } from 'msw';

import { type MswHandler } from 'test/integration/utils/http-mock';

export const GOOGLE_OAUTH_SCOPES = [
  'email',
  'profile',
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/calendar.events',
  'https://www.googleapis.com/auth/profile.emails.read',
  'https://www.googleapis.com/auth/gmail.send',
  'https://www.googleapis.com/auth/gmail.compose',
].join(' ');

const googleIdentityHandlers = (handle: string, sub: string): MswHandler[] => [
  http.get('https://www.googleapis.com/oauth2/v3/userinfo', () =>
    HttpResponse.json({
      sub,
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

export const googleAccountIdentityHandlers = (handle: string): MswHandler[] =>
  googleIdentityHandlers(handle, `google-user-id-${handle}`);

export const googleTokenEndpoint = (url: string): MswHandler =>
  http.post(url, () =>
    HttpResponse.json({
      access_token: 'mock-access-token',
      refresh_token: 'mock-refresh-token',
      expires_in: 3600,
      scope: GOOGLE_OAUTH_SCOPES,
      token_type: 'Bearer',
    }),
  );

export const declinedGoogleTokenRefresh = (): MswHandler =>
  http.post('https://oauth2.googleapis.com/token', () =>
    HttpResponse.json(
      { error: 'invalid_grant', error_description: 'Token has been revoked' },
      { status: 400 },
    ),
  );

export const googleAuthHandlers = (handle: string): MswHandler[] => [
  googleTokenEndpoint('https://oauth2.googleapis.com/token'),
  googleTokenEndpoint('https://www.googleapis.com/oauth2/v4/token'),
  ...googleIdentityHandlers(handle, 'google-user-id'),
];
