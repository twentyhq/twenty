import { SsoIdentityProviderStatus } from 'src/engine/core-modules/sso/workspace-sso-identity-provider.entity';

type InsertSamlIdentityProviderArgs = {
  id: string;
  name: string;
  issuer: string;
  ssoURL: string;
  certificate: string;
  workspaceId: string;
  status?: SsoIdentityProviderStatus;
};

// Only Apple has a test session, so other workspaces' providers are inserted directly
export const insertSamlIdentityProvider = async ({
  id,
  name,
  issuer,
  ssoURL,
  certificate,
  workspaceId,
  status = SsoIdentityProviderStatus.Active,
}: InsertSamlIdentityProviderArgs) => {
  await globalThis.testDataSource.query(
    `INSERT INTO core."workspaceSSOIdentityProvider"
       ("id", "name", "type", "issuer", "ssoURL", "certificate", "status", "workspaceId")
     VALUES ($1, $2, 'SAML', $3, $4, $5, $6, $7)`,
    [id, name, issuer, ssoURL, certificate, status, workspaceId],
  );
};
