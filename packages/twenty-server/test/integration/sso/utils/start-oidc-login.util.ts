import request from 'supertest';
import { isDefined } from 'twenty-shared/utils';

export const startOidcLogin = async (identityProviderId: string) => {
  const response = await request(`http://localhost:${APP_PORT}`).get(
    `/auth/oidc/login/${identityProviderId}`,
  );

  const sessionCookies = response.get('Set-Cookie');

  if (response.status !== 302 || !isDefined(sessionCookies)) {
    throw new Error(
      `Expected a redirect to the identity provider with a session cookie, got ${response.status} to ${response.headers.location}`,
    );
  }

  return {
    authorizationUrl: new URL(response.headers.location),
    sessionCookie: sessionCookies
      .map((setCookie) => setCookie.split(';')[0])
      .join('; '),
  };
};
