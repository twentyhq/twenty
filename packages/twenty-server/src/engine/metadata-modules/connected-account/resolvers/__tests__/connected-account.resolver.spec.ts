import { ConnectedAccountResolver } from 'src/engine/metadata-modules/connected-account/resolvers/connected-account.resolver';

describe('ConnectedAccountResolver', () => {
  let connectedAccountMetadataService: {
    verifyOwnership: jest.Mock;
    update: jest.Mock;
  };
  let resolver: ConnectedAccountResolver;

  beforeEach(() => {
    connectedAccountMetadataService = {
      verifyOwnership: jest.fn(),
      update: jest.fn(async ({ id, data }) => ({
        id,
        name: data.name,
      })),
    };
    resolver = new ConnectedAccountResolver(
      connectedAccountMetadataService as never,
    );
  });

  describe('updateConnectedAccountName', () => {
    it('verifies ownership before updating the connected account name', async () => {
      const result = await resolver.updateConnectedAccountName(
        { id: 'account-id', name: '  Main account  ' },
        { id: 'workspace-id' } as never,
        'user-workspace-id',
      );

      expect(
        connectedAccountMetadataService.verifyOwnership,
      ).toHaveBeenCalledWith({
        id: 'account-id',
        userWorkspaceId: 'user-workspace-id',
        workspaceId: 'workspace-id',
      });
      expect(connectedAccountMetadataService.update).toHaveBeenCalledWith({
        id: 'account-id',
        workspaceId: 'workspace-id',
        data: { name: 'Main account' },
      });
      expect(result).toMatchObject({ id: 'account-id', name: 'Main account' });
    });

    it('clears the connected account name when the input is blank', async () => {
      await resolver.updateConnectedAccountName(
        { id: 'account-id', name: '   ' },
        { id: 'workspace-id' } as never,
        'user-workspace-id',
      );

      expect(connectedAccountMetadataService.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { name: null },
        }),
      );
    });
  });
});
