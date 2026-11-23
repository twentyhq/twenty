import { authorizeWithPassword } from 'test/integration/sso/utils/authorize-with-password.util';
import { completeOidcLogin } from 'test/integration/sso/utils/complete-oidc-login.util';
import { getAuthorizationUrlForSso } from 'test/integration/sso/utils/get-authorization-url-for-sso.util';
import { startOidcLogin } from 'test/integration/sso/utils/start-oidc-login.util';

type SignInWithOidcArgs = {
  identityProviderId: string;
  username: string;
  password: string;
  workspaceInviteHash?: string;
};

export const signInWithOidc = async ({
  identityProviderId,
  username,
  password,
  workspaceInviteHash,
}: SignInWithOidcArgs) => {
  const { data } = await getAuthorizationUrlForSso({
    input: { identityProviderId, workspaceInviteHash },
  });

  const { authorizationUrl, sessionCookie } = await startOidcLogin(
    new URL(data.getAuthorizationUrlForSSO.authorizationURL),
  );

  const callbackUrl = await authorizeWithPassword({
    authorizationUrl,
    username,
    password,
  });

  return completeOidcLogin({ callbackUrl, sessionCookie });
};
