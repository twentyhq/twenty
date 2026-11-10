import { type FlatConnectionProvider } from 'src/engine/metadata-modules/flat-connection-provider/types/flat-connection-provider.type';
import { type FlatMcpServer } from 'src/engine/metadata-modules/flat-mcp-server/types/flat-mcp-server.type';

// Only a provider Twenty generated goes away with its server; one an app declared carries the manifest's universal identifier, never its own id.
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
