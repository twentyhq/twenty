import { WorkspaceMigrationRunnerService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/services/workspace-migration-runner.service';

describe('WorkspaceMigrationRunnerService', () => {
  const workspaceId = 'workspace-id';

  let service: WorkspaceMigrationRunnerService;
  let invalidateFlatEntityMaps: jest.Mock;
  let incrementMetadataVersion: jest.Mock;
  let invalidateAndRecompute: jest.Mock;

  beforeEach(() => {
    invalidateFlatEntityMaps = jest.fn().mockResolvedValue(undefined);
    incrementMetadataVersion = jest.fn().mockResolvedValue(undefined);
    invalidateAndRecompute = jest.fn().mockResolvedValue(undefined);

    service = new WorkspaceMigrationRunnerService(
      { invalidateFlatEntityMaps } as never,
      {} as never,
      {} as never,
      { incrementMetadataVersion } as never,
      { invalidateAndRecompute } as never,
      {
        perfTime: jest.fn(),
        perfTimeEnd: jest.fn(),
        error: jest.fn(),
      } as never,
      {} as never,
    );
  });

  it.each(['flatObjectMetadataMaps', 'flatFieldMetadataMaps'] as const)(
    'invalidates versioned GraphQL caches without scanning for %s',
    async (flatMapsKey) => {
      await service.invalidateCache({
        allFlatEntityMapsKeys: [flatMapsKey],
        workspaceId,
      });

      expect(incrementMetadataVersion).toHaveBeenCalledWith(workspaceId);
      expect(invalidateAndRecompute).toHaveBeenCalledWith(workspaceId, [
        'ORMEntityMetadatas',
        'graphQLResolverNameMap',
      ]);
    },
  );

  it('rotates view flat-map hashes without incrementing metadata version', async () => {
    await service.invalidateCache({
      allFlatEntityMapsKeys: ['flatViewMaps'],
      workspaceId,
    });

    expect(invalidateFlatEntityMaps).toHaveBeenCalledWith({
      flatMapsKeys: ['flatViewMaps'],
      workspaceId,
    });
    expect(incrementMetadataVersion).not.toHaveBeenCalled();
    expect(invalidateAndRecompute).not.toHaveBeenCalled();
  });

  it('uses the metadata version when metadata and views change together', async () => {
    await service.invalidateCache({
      allFlatEntityMapsKeys: ['flatObjectMetadataMaps', 'flatViewMaps'],
      workspaceId,
    });

    expect(incrementMetadataVersion).toHaveBeenCalledWith(workspaceId);
    expect(invalidateAndRecompute).toHaveBeenCalledWith(workspaceId, [
      'ORMEntityMetadatas',
      'graphQLResolverNameMap',
    ]);
  });
});
