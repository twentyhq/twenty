import { type FlatConnectionProvider } from 'src/engine/metadata-modules/flat-connection-provider/types/flat-connection-provider.type';
import { type FlatMcpServer } from 'src/engine/metadata-modules/flat-mcp-server/types/flat-mcp-server.type';

// Only a provider Twenty created for this server goes away with it; one an app declared never does.
// A generated provider is its own universal identifier, a synced one carries the manifest's.
export const isMcpServerSignInConnectionProvider = ({
  flatConnectionProvider,
  flatMcpServer,
}: {
  flatConnectionProvider: Pick<
    FlatConnectionProvider,
    | 'id'
    | 'universalIdentifier'
    | 'type'
    | 'applicationId'
    | 'oauthDiscoveryConfig'
  >;
  flatMcpServer: Pick<FlatMcpServer, 'url' | 'applicationId'>;
}): boolean =>
  flatConnectionProvider.universalIdentifier === flatConnectionProvider.id &&
  flatConnectionProvider.type === 'oauth-discovery' &&
  flatConnectionProvider.applicationId === flatMcpServer.applicationId &&
  flatConnectionProvider.oauthDiscoveryConfig?.resourceUrl ===
    flatMcpServer.url;
