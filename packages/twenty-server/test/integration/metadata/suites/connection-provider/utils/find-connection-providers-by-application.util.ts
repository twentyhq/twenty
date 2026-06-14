import { type StoredOAuthConnectionProviderConfig } from 'twenty-shared/application';

type ConnectionProviderRow = {
  id: string;
  universalIdentifier: string;
  applicationId: string;
  workspaceId: string;
  name: string;
  displayName: string;
  type: string;
  oauthConfig: StoredOAuthConnectionProviderConfig | null;
};

export const findConnectionProvidersByApplication = async (
  applicationUniversalIdentifier: string,
): Promise<ConnectionProviderRow[]> => {
  return globalThis.testDataSource.query(
    `SELECT cp.id, cp."universalIdentifier", cp."applicationId",
            cp."workspaceId", cp.name, cp."displayName", cp.type,
            cp."oauthConfig"
       FROM core."connectionProvider" cp
       JOIN core."application" app ON app.id = cp."applicationId"
      WHERE app."universalIdentifier" = $1
   ORDER BY cp.name`,
    [applicationUniversalIdentifier],
  );
};
