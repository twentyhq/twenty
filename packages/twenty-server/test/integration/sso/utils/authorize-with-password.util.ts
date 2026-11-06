import { isDefined } from 'twenty-shared/utils';

type AuthorizeWithPasswordArgs = {
  authorizationUrl: URL;
  username: string;
  password: string;
};

type AuthnResponse = {
  status?: string;
  sessionToken?: string;
  errorSummary?: string;
};

// Headless login: /api/v1/authn trades the password for a one-time
// sessionToken that /authorize accepts in place of its sign-in page.
export const authorizeWithPassword = async ({
  authorizationUrl,
  username,
  password,
}: AuthorizeWithPasswordArgs) => {
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

  const authn = (await authnResponse.json()) as AuthnResponse;

  if (authn.status !== 'SUCCESS' || !isDefined(authn.sessionToken)) {
    throw new Error(
      `Identity provider authn did not succeed (HTTP ${authnResponse.status}, status ${authn.status}): ${authn.errorSummary}`,
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
      `Identity provider authorize did not redirect (HTTP ${authorizeResponse.status}), check the app redirect URI`,
    );
  }

  const callbackUrl = new URL(location, authorizationUrl);

  if (!callbackUrl.searchParams.has('code')) {
    throw new Error(
      `Identity provider authorize did not return a code, redirected to ${callbackUrl.origin}${callbackUrl.pathname} with error ${callbackUrl.searchParams.get('error')}: ${callbackUrl.searchParams.get('error_description')}`,
    );
  }

  return callbackUrl;
};
