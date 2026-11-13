import { buildMcpServerSignInConnectionProviderName } from 'src/engine/metadata-modules/mcp-server/utils/build-mcp-server-sign-in-connection-provider-name.util';

describe('buildMcpServerSignInConnectionProviderName', () => {
  it('derives a kebab-case name from the server name and the provider id prefix', () => {
    expect(
      buildMcpServerSignInConnectionProviderName({
        mcpServerName: 'notion_docs',
        connectionProviderId: '0f3b2a1c-4d5e-4f60-8a9b-0c1d2e3f4a5b',
      }),
    ).toBe('mcp-notion-docs-0f3b2a1c');
  });

  it('gives two providers of the same server distinct names', () => {
    const buildName = (connectionProviderId: string) =>
      buildMcpServerSignInConnectionProviderName({
        mcpServerName: 'docs',
        connectionProviderId,
      });

    expect(buildName('11111111-aaaa-4bbb-8ccc-000000000001')).not.toBe(
      buildName('22222222-aaaa-4bbb-8ccc-000000000002'),
    );
  });
});
