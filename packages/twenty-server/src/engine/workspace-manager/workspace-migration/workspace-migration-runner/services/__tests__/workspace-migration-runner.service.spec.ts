import { WorkspaceMigrationRunnerService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/services/workspace-migration-runner.service';

describe('WorkspaceMigrationRunnerService', () => {
  const workspaceId = '20202020-1111-4111-8111-111111111111';

  const setup = () => {
    const invalidateFlatEntityMaps = jest.fn().mockResolvedValue(undefined);
    const rotateFindAllViewsCacheGeneration = jest
      .fn()
      .mockResolvedValue(undefined);
    const invalidateAndRecompute = jest.fn().mockResolvedValue(undefined);

    const service = new WorkspaceMigrationRunnerService(
      { invalidateFlatEntityMaps } as never,
      {} as never,
      {} as never,
      { incrementMetadataVersion: jest.fn() } as never,
      { rotateFindAllViewsCacheGeneration } as never,
      { invalidateAndRecompute } as never,
      {
        perfTime: jest.fn(),
        perfTimeEnd: jest.fn(),
        error: jest.fn(),
      } as never,
      {} as never,
    );

    return {
      invalidateFlatEntityMaps,
      rotateFindAllViewsCacheGeneration,
      service,
    };
  };

  it('rotates the FindAllViews generation after flat-map invalidation completes', async () => {
    let completeFlatMapInvalidation!: () => void;
    const flatMapInvalidation = new Promise<void>((resolve) => {
      completeFlatMapInvalidation = resolve;
    });
    const {
      invalidateFlatEntityMaps,
      rotateFindAllViewsCacheGeneration,
      service,
    } = setup();

    invalidateFlatEntityMaps.mockReturnValue(flatMapInvalidation);

    const invalidation = service.invalidateCache({
      allFlatEntityMapsKeys: ['flatViewSortMaps'],
      workspaceId,
    });

    expect(invalidateFlatEntityMaps).toHaveBeenCalledWith({
      flatMapsKeys: ['flatViewSortMaps'],
      workspaceId,
    });
    expect(rotateFindAllViewsCacheGeneration).not.toHaveBeenCalled();

    completeFlatMapInvalidation();
    await invalidation;

    expect(rotateFindAllViewsCacheGeneration).toHaveBeenCalledWith(workspaceId);
  });

  it('does not rotate the FindAllViews generation for an unrelated key', async () => {
    const { rotateFindAllViewsCacheGeneration, service } = setup();

    await service.invalidateCache({
      allFlatEntityMapsKeys: ['flatRoleMaps'],
      workspaceId,
    });

    expect(rotateFindAllViewsCacheGeneration).not.toHaveBeenCalled();
  });
});
