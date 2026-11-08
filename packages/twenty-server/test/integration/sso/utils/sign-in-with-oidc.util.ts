import { authorizeWithPassword } from 'test/integration/sso/utils/authorize-with-password.util';
import { completeOidcLogin } from 'test/integration/sso/utils/complete-oidc-login.util';
import { getAuthorizationUrlForSso } from 'test/integration/sso/utils/get-authorization-url-for-sso.util';
import { startOidcLogin } from 'test/integration/sso/utils/start-oidc-login.util';

type SignInWithOidcArgs = {
  identityProviderId: string;
  username: string;
  password: string;
};

export const signInWithOidc = async ({
  identityProviderId,
  username,
  password,
}: SignInWithOidcArgs) => {
  const { authorizationURL: loginUrl } =
    await getAuthorizationUrlForSso(identityProviderId);

  const { authorizationUrl, sessionCookie } = await startOidcLogin(
    new URL(loginUrl),
  );

  const callbackUrl = await authorizeWithPassword({
    authorizationUrl,
    username,
    password,
  });

  return completeOidcLogin({ callbackUrl, sessionCookie });
};
