import { v4 } from 'uuid';

import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { type FlatConnectionProvider } from 'src/engine/metadata-modules/flat-connection-provider/types/flat-connection-provider.type';
import { type FlatMcpServer } from 'src/engine/metadata-modules/flat-mcp-server/types/flat-mcp-server.type';
import { buildMcpServerSignInConnectionProviderName } from 'src/engine/metadata-modules/mcp-server/utils/build-mcp-server-sign-in-connection-provider-name.util';

// Each member signs in with their own account; the server's OAuth settings are discovered at connect time.
export const buildMcpServerSignInFlatConnectionProvider = ({
  mcpServer,
  flatApplication,
}: {
  mcpServer: Pick<FlatMcpServer, 'name' | 'label' | 'url' | 'workspaceId'>;
  flatApplication: Pick<FlatApplication, 'id' | 'universalIdentifier'>;
}): FlatConnectionProvider => {
  const id = v4();
  const now = new Date().toISOString();

  return {
    id,
    universalIdentifier: id,
    applicationId: flatApplication.id,
    applicationUniversalIdentifier: flatApplication.universalIdentifier,
    workspaceId: mcpServer.workspaceId,
    name: buildMcpServerSignInConnectionProviderName({
      mcpServerName: mcpServer.name,
      connectionProviderId: id,
    }),
    displayName: mcpServer.label,
    logo: null,
    type: 'oauth-discovery',
    scope: 'USER',
    oauthConfig: null,
    customConfig: null,
    oauthDiscoveryConfig: { resourceUrl: mcpServer.url },
    identifyAccountLogicFunctionUniversalIdentifier: null,
    onConnectLogicFunctionUniversalIdentifier: null,
    onDisconnectLogicFunctionUniversalIdentifier: null,
    createdAt: now,
    updatedAt: now,
  };
};
