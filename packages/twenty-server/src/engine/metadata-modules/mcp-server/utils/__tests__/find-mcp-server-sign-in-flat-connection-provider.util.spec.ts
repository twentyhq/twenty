import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { addFlatEntityToFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/add-flat-entity-to-flat-entity-maps-or-throw.util';
import { buildMcpServerSignInFlatConnectionProvider } from 'src/engine/metadata-modules/mcp-server/utils/build-mcp-server-sign-in-flat-connection-provider.util';
import { findMcpServerSignInFlatConnectionProvider } from 'src/engine/metadata-modules/mcp-server/utils/find-mcp-server-sign-in-flat-connection-provider.util';

const URL = 'https://mcp.example.com/mcp';
const flatApplication = {
  id: 'application-id',
  universalIdentifier: 'application-universal-identifier',
};
const generatedFlatConnectionProvider =
  buildMcpServerSignInFlatConnectionProvider({
    mcpServer: {
      name: 'docs',
      label: 'Docs',
      url: URL,
      workspaceId: 'workspace-id',
    },
    flatApplication,
    scope: 'USER',
  });
const manifestFlatConnectionProvider = {
  ...generatedFlatConnectionProvider,
  id: 'manifest-provider-id',
  universalIdentifier: 'manifest-provider-universal-identifier',
};
const flatConnectionProviderMaps = [
  generatedFlatConnectionProvider,
  manifestFlatConnectionProvider,
].reduce(
  (flatEntityMaps, flatEntity) =>
    addFlatEntityToFlatEntityMapsOrThrow({ flatEntity, flatEntityMaps }),
  createEmptyFlatEntityMaps(),
);

describe('findMcpServerSignInFlatConnectionProvider', () => {
  it('returns the provider Twenty generated for the server', () => {
    expect(
      findMcpServerSignInFlatConnectionProvider({
        flatMcpServer: {
          url: URL,
          applicationId: flatApplication.id,
          connectionProviderId: generatedFlatConnectionProvider.id,
        },
        flatConnectionProviderMaps,
      }),
    ).toBe(generatedFlatConnectionProvider);
  });

  it.each([
    {
      label: 'no provider is linked',
      flatMcpServer: {
        url: URL,
        applicationId: flatApplication.id,
        connectionProviderId: null,
      },
    },
    {
      label: 'the linked provider is unknown',
      flatMcpServer: {
        url: URL,
        applicationId: flatApplication.id,
        connectionProviderId: 'unknown-provider-id',
      },
    },
    {
      label: 'the linked provider comes from an app manifest',
      flatMcpServer: {
        url: URL,
        applicationId: flatApplication.id,
        connectionProviderId: manifestFlatConnectionProvider.id,
      },
    },
    {
      label: 'the server moved to another URL',
      flatMcpServer: {
        url: 'https://other.example.com/mcp',
        applicationId: flatApplication.id,
        connectionProviderId: generatedFlatConnectionProvider.id,
      },
    },
  ])('returns null when $label', ({ flatMcpServer }) => {
    expect(
      findMcpServerSignInFlatConnectionProvider({
        flatMcpServer,
        flatConnectionProviderMaps,
      }),
    ).toBeNull();
  });
});
