import { isMcpServerSignInConnectionProvider } from 'src/engine/metadata-modules/mcp-server/utils/is-mcp-server-sign-in-connection-provider.util';

const APPLICATION_ID = 'application-id';
const URL = 'https://mcp.example.com/mcp';

const generatedProvider = {
  id: 'provider-id',
  universalIdentifier: 'provider-id',
  type: 'oauth-discovery' as const,
  applicationId: APPLICATION_ID,
  oauthDiscoveryConfig: { resourceUrl: URL },
};

const flatMcpServer = { url: URL, applicationId: APPLICATION_ID };

describe('isMcpServerSignInConnectionProvider', () => {
  it('recognizes the provider Twenty generated for the server', () => {
    expect(
      isMcpServerSignInConnectionProvider({
        flatConnectionProvider: generatedProvider,
        flatMcpServer,
      }),
    ).toBe(true);
  });

  it('leaves out a provider an app declared in its manifest', () => {
    expect(
      isMcpServerSignInConnectionProvider({
        flatConnectionProvider: {
          ...generatedProvider,
          universalIdentifier: 'manifest-universal-identifier',
        },
        flatMcpServer,
      }),
    ).toBe(false);
  });

  it('leaves out a provider for another resource', () => {
    expect(
      isMcpServerSignInConnectionProvider({
        flatConnectionProvider: {
          ...generatedProvider,
          oauthDiscoveryConfig: { resourceUrl: 'https://other.example.com' },
        },
        flatMcpServer,
      }),
    ).toBe(false);
  });

  it('leaves out a provider of another type or application', () => {
    expect(
      isMcpServerSignInConnectionProvider({
        flatConnectionProvider: { ...generatedProvider, type: 'oauth' },
        flatMcpServer,
      }),
    ).toBe(false);
    expect(
      isMcpServerSignInConnectionProvider({
        flatConnectionProvider: {
          ...generatedProvider,
          applicationId: 'other-application-id',
        },
        flatMcpServer,
      }),
    ).toBe(false);
  });
});
