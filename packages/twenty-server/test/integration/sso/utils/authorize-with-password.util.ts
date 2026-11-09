import { createIdentityProviderSessionToken } from 'test/integration/sso/utils/create-identity-provider-session-token.util';
import { isDefined } from 'twenty-shared/utils';

type AuthorizeWithPasswordArgs = {
  authorizationUrl: URL;
  username: string;
  password: string;
};

export const authorizeWithPassword = async ({
  authorizationUrl,
  username,
  password,
}: AuthorizeWithPasswordArgs) => {
  const sessionToken = await createIdentityProviderSessionToken({
    identityProviderOrigin: authorizationUrl.origin,
    username,
    password,
  });

  const authorizationUrlWithSessionToken = new URL(authorizationUrl);

  authorizationUrlWithSessionToken.searchParams.set(
    'sessionToken',
    sessionToken,
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
