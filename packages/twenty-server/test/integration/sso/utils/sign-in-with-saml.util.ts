import { completeSamlLogin } from 'test/integration/sso/utils/complete-saml-login.util';
import { getAuthorizationUrlForSso } from 'test/integration/sso/utils/get-authorization-url-for-sso.util';
import { requestSamlResponseWithPassword } from 'test/integration/sso/utils/request-saml-response-with-password.util';
import { startSamlLogin } from 'test/integration/sso/utils/start-saml-login.util';

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

  const samlResponse = await requestSamlResponseWithPassword({
    samlRequestUrl: await startSamlLogin(
      new URL(data.getAuthorizationUrlForSSO.authorizationURL),
    ),
    username,
    password,
  });

  return completeSamlLogin(samlResponse);
};
