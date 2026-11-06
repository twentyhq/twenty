import { isDefined } from 'twenty-shared/utils';

type AuthorizeWithOktaPasswordArgs = {
  authorizationUrl: URL;
  username: string;
  password: string;
};

type OktaAuthnResponse = {
  status?: string;
  sessionToken?: string;
  errorSummary?: string;
};

// Okta's headless path: /api/v1/authn trades the password for a one-time
// sessionToken that /authorize accepts in place of its sign-in page.
export const authorizeWithOktaPassword = async ({
  authorizationUrl,
  username,
  password,
}: AuthorizeWithOktaPasswordArgs) => {
  const authnResponse = await fetch(
    new URL('/api/v1/authn', authorizationUrl.origin),
    {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    },
  );

  const authn = (await authnResponse.json()) as OktaAuthnResponse;

  if (authn.status !== 'SUCCESS' || !isDefined(authn.sessionToken)) {
    throw new Error(
      `Okta authn did not succeed (HTTP ${authnResponse.status}, status ${authn.status}): ${authn.errorSummary}`,
    );
  }

  const authorizationUrlWithSessionToken = new URL(authorizationUrl);

  authorizationUrlWithSessionToken.searchParams.set(
    'sessionToken',
    authn.sessionToken,
  );

  const authorizeResponse = await fetch(authorizationUrlWithSessionToken, {
    redirect: 'manual',
  });

  const location = authorizeResponse.headers.get('location');

  if (authorizeResponse.status !== 302 || !isDefined(location)) {
    throw new Error(
      `Okta authorize did not redirect (HTTP ${authorizeResponse.status}), check the app redirect URI`,
    );
  }

  const callbackUrl = new URL(location, authorizationUrl);

  if (!callbackUrl.searchParams.has('code')) {
    throw new Error(
      `Okta authorize did not return a code, redirected to ${callbackUrl.origin}${callbackUrl.pathname} with error ${callbackUrl.searchParams.get('error')}: ${callbackUrl.searchParams.get('error_description')}`,
    );
  }

  return callbackUrl;
};
