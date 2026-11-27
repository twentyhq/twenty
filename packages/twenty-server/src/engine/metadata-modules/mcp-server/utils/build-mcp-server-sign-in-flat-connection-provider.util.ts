import { type ConnectionProviderScope } from 'twenty-shared/application';
import { v4 } from 'uuid';

import { type FlatConnectionProvider } from 'src/engine/metadata-modules/flat-connection-provider/types/flat-connection-provider.type';
import { type FlatMcpServer } from 'src/engine/metadata-modules/flat-mcp-server/types/flat-mcp-server.type';
import { buildMcpServerSignInConnectionProviderName } from 'src/engine/metadata-modules/mcp-server/utils/build-mcp-server-sign-in-connection-provider-name.util';

export const buildMcpServerSignInFlatConnectionProvider = ({
  mcpServer,
  scope,
}: {
  mcpServer: Pick<
    FlatMcpServer,
    | 'name'
    | 'label'
    | 'url'
    | 'workspaceId'
    | 'applicationId'
    | 'applicationUniversalIdentifier'
  >;
  scope: ConnectionProviderScope;
}): FlatConnectionProvider => {
  const id = v4();
  const now = new Date().toISOString();

  return {
    id,
    universalIdentifier: id,
    applicationId: mcpServer.applicationId,
    applicationUniversalIdentifier: mcpServer.applicationUniversalIdentifier,
    workspaceId: mcpServer.workspaceId,
    name: buildMcpServerSignInConnectionProviderName({
      mcpServerName: mcpServer.name,
      connectionProviderId: id,
    }),
    displayName: mcpServer.label,
    logo: null,
    type: 'oauth-discovery',
    scope,
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
