import { type StoredOAuthConnectionProviderConfig } from 'twenty-shared/application';
import { type ConnectedAccountVisibility } from 'twenty-shared/types';

type ConnectionProviderRow = {
  id: string;
  universalIdentifier: string;
  applicationId: string;
  workspaceId: string;
  name: string;
  displayName: string;
  allowedVisibilities: ConnectedAccountVisibility[];
  type: string;
  oauthConfig: StoredOAuthConnectionProviderConfig | null;
  onConnectLogicFunctionUniversalIdentifier: string | null;
  onDisconnectLogicFunctionUniversalIdentifier: string | null;
};

export const findConnectionProvidersByApplication = async (
  applicationUniversalIdentifier: string,
): Promise<ConnectionProviderRow[]> => {
  return globalThis.testDataSource.query(
    `SELECT cp.id, cp."universalIdentifier", cp."applicationId",
            cp."workspaceId", cp.name, cp."displayName", cp.type, cp."allowedVisibilities",
            cp."oauthConfig", cp."onConnectLogicFunctionUniversalIdentifier",
            cp."onDisconnectLogicFunctionUniversalIdentifier"
       FROM core."connectionProvider" cp
       JOIN core."application" app ON app.id = cp."applicationId"
      WHERE app."universalIdentifier" = $1
   ORDER BY cp.name`,
    [applicationUniversalIdentifier],
  );
};
