import { completeSamlLogin } from 'test/integration/sso/utils/complete-saml-login.util';
import { getAuthorizationUrlForSso } from 'test/integration/sso/utils/get-authorization-url-for-sso.util';
import { replayOnTestApp } from 'test/integration/sso/utils/replay-on-test-app.util';
import { requestSamlResponseWithPassword } from 'test/integration/sso/utils/request-saml-response-with-password.util';

type SignInWithSamlArgs = {
  identityProviderId: string;
  username: string;
  password: string;
  workspaceInviteHash?: string;
};

export const signInWithSaml = async ({
  identityProviderId,
  username,
  password,
  workspaceInviteHash,
}: SignInWithSamlArgs) => {
  const { data } = await getAuthorizationUrlForSso({
    input: { identityProviderId, workspaceInviteHash },
  });

  const loginResponse = await replayOnTestApp(
    new URL(data.getAuthorizationUrlForSSO.authorizationURL),
  );

  if (loginResponse.status !== 302) {
    throw new Error(
      `Expected a redirect to the identity provider, got ${loginResponse.status}`,
    );
  }

  const samlResponse = await requestSamlResponseWithPassword({
    samlRequestUrl: new URL(loginResponse.headers.location),
    username,
    password,
  });

  return completeSamlLogin(samlResponse);
};
