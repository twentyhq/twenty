import { replayOnTestApp } from 'test/integration/sso/utils/replay-on-test-app.util';
import { isDefined } from 'twenty-shared/utils';

export const startOidcLogin = async (loginUrl: URL) => {
  const response = await replayOnTestApp(loginUrl);

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
