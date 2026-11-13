import { buildMcpServerSignInFlatConnectionProvider } from 'src/engine/metadata-modules/mcp-server/utils/build-mcp-server-sign-in-flat-connection-provider.util';
import { isMcpServerSignInConnectionProvider } from 'src/engine/metadata-modules/mcp-server/utils/is-mcp-server-sign-in-connection-provider.util';

const mcpServer = {
  name: 'notion_docs',
  label: 'Notion docs',
  url: 'https://mcp.example.com/mcp',
  workspaceId: 'workspace-id',
};
const flatApplication = {
  id: 'application-id',
  universalIdentifier: 'application-universal-identifier',
};

describe('buildMcpServerSignInFlatConnectionProvider', () => {
  it('builds an oauth-discovery provider owned by the application and pointing at the server', () => {
    const flatConnectionProvider = buildMcpServerSignInFlatConnectionProvider({
      mcpServer,
      flatApplication,
      scope: 'WORKSPACE',
    });

    expect(flatConnectionProvider).toMatchObject({
      type: 'oauth-discovery',
      scope: 'WORKSPACE',
      displayName: 'Notion docs',
      workspaceId: 'workspace-id',
      applicationId: 'application-id',
      applicationUniversalIdentifier: 'application-universal-identifier',
      oauthConfig: null,
      customConfig: null,
      oauthDiscoveryConfig: { resourceUrl: 'https://mcp.example.com/mcp' },
    });
    expect(flatConnectionProvider.name).toBe(
      `mcp-notion-docs-${flatConnectionProvider.id.slice(0, 8)}`,
    );
  });

  it('is recognized as the server sign-in provider through its own id as universal identifier', () => {
    const flatConnectionProvider = buildMcpServerSignInFlatConnectionProvider({
      mcpServer,
      flatApplication,
      scope: 'USER',
    });

    expect(flatConnectionProvider.universalIdentifier).toBe(
      flatConnectionProvider.id,
    );
    expect(
      isMcpServerSignInConnectionProvider({
        flatConnectionProvider,
        flatMcpServer: {
          url: mcpServer.url,
          applicationId: flatApplication.id,
        },
      }),
    ).toBe(true);
  });
});
