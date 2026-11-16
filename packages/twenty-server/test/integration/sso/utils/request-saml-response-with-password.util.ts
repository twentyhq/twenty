import { JSDOM } from 'jsdom';
import request from 'supertest';
import { createIdentityProviderSessionToken } from 'test/integration/sso/utils/create-identity-provider-session-token.util';
import { isDefined } from 'twenty-shared/utils';

type RequestSamlResponseWithPasswordArgs = {
  samlRequestUrl: URL;
  username: string;
  password: string;
};

export const requestSamlResponseWithPassword = async ({
  samlRequestUrl,
  username,
  password,
}: RequestSamlResponseWithPasswordArgs) => {
  const sessionToken = await createIdentityProviderSessionToken({
    identityProviderOrigin: samlRequestUrl.origin,
    username,
    password,
  });

  // The SAML endpoint ignores sessionToken, so it is traded for a session cookie first
  const sessionCookieRedirectUrl = new URL(
    '/login/sessionCookieRedirect',
    samlRequestUrl.origin,
  );

  sessionCookieRedirectUrl.searchParams.set('token', sessionToken);
  sessionCookieRedirectUrl.searchParams.set(
    'redirectUrl',
    samlRequestUrl.toString(),
  );

  const identityProvider = request(samlRequestUrl.origin);

  const sessionCookieResponse = await identityProvider.get(
    `${sessionCookieRedirectUrl.pathname}${sessionCookieRedirectUrl.search}`,
  );

  const sessionCookies = sessionCookieResponse.get('Set-Cookie');

  if (sessionCookieResponse.status !== 302 || !isDefined(sessionCookies)) {
    throw new Error(
      `Identity provider did not open a session (HTTP ${sessionCookieResponse.status})`,
    );
  }

  const samlResponsePage = await identityProvider
    .get(`${samlRequestUrl.pathname}${samlRequestUrl.search}`)
    .set(
      'Cookie',
      sessionCookies.map((setCookie) => setCookie.split(';')[0]).join('; '),
    );

  const form = new JSDOM(samlResponsePage.text).window.document.querySelector(
    'form',
  );
  const callbackUrl = form?.getAttribute('action');
  const samlResponse = form
    ?.querySelector('input[name="SAMLResponse"]')
    ?.getAttribute('value');

  if (!isDefined(callbackUrl) || !isDefined(samlResponse)) {
    throw new Error(
      `Identity provider did not return a SAML response (HTTP ${samlResponsePage.status}), check the app assignment and sign-on policy`,
    );
  }

  return {
    callbackUrl: new URL(callbackUrl),
    samlResponse,
    relayState:
      form?.querySelector('input[name="RelayState"]')?.getAttribute('value') ??
      undefined,
  };
};
