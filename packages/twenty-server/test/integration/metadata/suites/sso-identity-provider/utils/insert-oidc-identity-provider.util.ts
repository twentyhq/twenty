import { SsoIdentityProviderStatus } from 'src/engine/core-modules/sso/workspace-sso-identity-provider.entity';

type InsertOidcIdentityProviderArgs = {
  id: string;
  name: string;
  issuer: string;
  clientID: string;
  clientSecret: string;
  workspaceId: string;
  status?: SsoIdentityProviderStatus;
};

export const insertOidcIdentityProvider = async ({
  id,
  name,
  issuer,
  clientID,
  clientSecret,
  workspaceId,
  status = SsoIdentityProviderStatus.Active,
}: InsertOidcIdentityProviderArgs) => {
  await globalThis.testDataSource.query(
    `INSERT INTO core."workspaceSSOIdentityProvider"
       ("id", "name", "type", "issuer", "clientID", "clientSecret", "status", "workspaceId")
     VALUES ($1, $2, 'OIDC', $3, $4, $5, $6, $7)`,
    [id, name, issuer, clientID, clientSecret, status, workspaceId],
  );
};
