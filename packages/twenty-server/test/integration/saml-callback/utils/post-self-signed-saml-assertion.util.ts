import { completeSamlLogin } from 'test/integration/sso/utils/complete-saml-login.util';
import { isDefined } from 'twenty-shared/utils';

import { type SelfSignedSamlCredentials } from 'test/integration/saml-callback/utils/generate-self-signed-saml-credentials.util';
import {
  buildSamlCallbackUrl,
  signSamlResponse,
} from 'test/integration/saml-callback/utils/sign-saml-response.util';

type PostSelfSignedSamlAssertionArgs = {
  identityProviderId: string;
  email: string;
  credentials: SelfSignedSamlCredentials;
  workspaceInviteHash?: string;
  workspacePersonalInviteToken?: string;
};

const buildRelayState = ({
  workspaceInviteHash,
  workspacePersonalInviteToken,
}: Pick<
  PostSelfSignedSamlAssertionArgs,
  'workspaceInviteHash' | 'workspacePersonalInviteToken'
>) => {
  if (isDefined(workspacePersonalInviteToken)) {
    return JSON.stringify({ token: workspacePersonalInviteToken });
  }

  if (isDefined(workspaceInviteHash)) {
    return JSON.stringify({ workspaceInviteHash });
  }

  return undefined;
};

// Posts a self-signed SAML assertion for the given email to the provider's
// callback, returning the URL the server redirects to (login token on success,
// errorMessage on refusal).
export const postSelfSignedSamlAssertion = async ({
  identityProviderId,
  email,
  credentials,
  workspaceInviteHash,
  workspacePersonalInviteToken,
}: PostSelfSignedSamlAssertionArgs): Promise<URL> => {
  const samlResponse = signSamlResponse({
    identityProviderId,
    email,
    privateKeyPem: credentials.privateKeyPem,
    certificatePem: credentials.certificatePem,
  });

  return completeSamlLogin({
    callbackUrl: new URL(buildSamlCallbackUrl(identityProviderId)),
    samlResponse,
    relayState: buildRelayState({
      workspaceInviteHash,
      workspacePersonalInviteToken,
    }),
  });
};
