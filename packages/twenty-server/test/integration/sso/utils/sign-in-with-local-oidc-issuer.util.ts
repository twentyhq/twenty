import { completeOidcLogin } from 'test/integration/sso/utils/complete-oidc-login.util';
import { getAuthorizationUrlForSso } from 'test/integration/sso/utils/get-authorization-url-for-sso.util';
import { startOidcLogin } from 'test/integration/sso/utils/start-oidc-login.util';
import { isDefined } from 'twenty-shared/utils';

type SignInWithLocalOidcIssuerArgs = {
  identityProviderId: string;
  email: string;
  workspaceInviteHash?: string;
};

// Drives the real OIDC login and callback, with the local issuer asserting the given email
export const signInWithLocalOidcIssuer = async ({
  identityProviderId,
  email,
  workspaceInviteHash,
}: SignInWithLocalOidcIssuerArgs) => {
  const { data } = await getAuthorizationUrlForSso({
    input: { identityProviderId, workspaceInviteHash },
  });

  const { authorizationUrl, sessionCookie } = await startOidcLogin(
    new URL(data.getAuthorizationUrlForSSO.authorizationURL),
  );

  authorizationUrl.searchParams.set('login_hint', email);

  const authorizeResponse = await fetch(authorizationUrl, {
    redirect: 'manual',
  });
  const location = authorizeResponse.headers.get('location');

  if (authorizeResponse.status !== 302 || !isDefined(location)) {
    throw new Error(
      `Local OIDC issuer did not redirect back (HTTP ${authorizeResponse.status})`,
    );
  }

  return completeOidcLogin({ callbackUrl: new URL(location), sessionCookie });
};
