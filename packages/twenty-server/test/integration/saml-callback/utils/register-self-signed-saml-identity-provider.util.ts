import { insertSamlIdentityProvider } from 'test/integration/metadata/suites/sso-identity-provider/utils/insert-saml-identity-provider.util';
import { v4 as uuidv4 } from 'uuid';

import { type SelfSignedSamlCredentials } from 'test/integration/saml-callback/utils/generate-self-signed-saml-credentials.util';

type RegisterSelfSignedSamlIdentityProviderArgs = {
  workspaceId: string;
  credentials: SelfSignedSamlCredentials;
};

// Inserted directly, as other non-Apple-workspace tests do, so no SSO billing
// entitlement is required
export const registerSelfSignedSamlIdentityProvider = async ({
  workspaceId,
  credentials,
}: RegisterSelfSignedSamlIdentityProviderArgs): Promise<string> => {
  const identityProviderId = uuidv4();

  await insertSamlIdentityProvider({
    id: identityProviderId,
    name: 'Self-signed SAML provider',
    issuer: `urn:self-signed:${identityProviderId}`,
    ssoURL: `https://self-signed-idp.test/${identityProviderId}/sso`,
    certificate: credentials.certificateBody,
    workspaceId,
  });

  return identityProviderId;
};

export const deleteSelfSignedSamlIdentityProvider = async (
  identityProviderId: string,
): Promise<void> => {
  await globalThis.testDataSource.query(
    `DELETE FROM core."workspaceSSOIdentityProvider" WHERE id = $1`,
    [identityProviderId],
  );
};
