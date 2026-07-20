import { FIND_ALL_VIEWS_CACHE_DEPENDENCY_KEYS } from 'src/engine/workspace-cache-storage/constants/find-all-views-cache-dependency-keys.constant';
import { FindAllViewsCacheService } from 'src/engine/workspace-cache-storage/services/find-all-views-cache.service';
import { type WorkspaceCacheStorageService } from 'src/engine/workspace-cache-storage/workspace-cache-storage.service';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

describe('FindAllViewsCacheService', () => {
  const workspaceId = '20202020-1111-4111-8111-111111111111';

  let workspaceCacheStorageService: jest.Mocked<WorkspaceCacheStorageService>;
  let workspaceCacheService: jest.Mocked<WorkspaceCacheService>;
  let service: FindAllViewsCacheService;

  beforeEach(() => {
    workspaceCacheStorageService = {
      getOrInitializeFindAllViewsCacheGeneration: jest.fn(),
    } as unknown as jest.Mocked<WorkspaceCacheStorageService>;
    workspaceCacheService = {
      invalidateLocal: jest.fn().mockResolvedValue(undefined),
    } as unknown as jest.Mocked<WorkspaceCacheService>;
    service = new FindAllViewsCacheService(
      workspaceCacheStorageService,
      workspaceCacheService,
    );
  });

  it('invalidates pod-local dependencies when the shared generation changes', async () => {
    workspaceCacheStorageService.getOrInitializeFindAllViewsCacheGeneration
      .mockResolvedValueOnce('generation-1')
      .mockResolvedValueOnce('generation-1')
      .mockResolvedValueOnce('generation-2');

    await expect(service.getCacheGeneration(workspaceId)).resolves.toBe(
      'generation-1',
    );
    await expect(service.getCacheGeneration(workspaceId)).resolves.toBe(
      'generation-1',
    );
    await expect(service.getCacheGeneration(workspaceId)).resolves.toBe(
      'generation-2',
    );

    expect(workspaceCacheService.invalidateLocal).toHaveBeenCalledTimes(2);
    expect(workspaceCacheService.invalidateLocal).toHaveBeenCalledWith(
      workspaceId,
      [...FIND_ALL_VIEWS_CACHE_DEPENDENCY_KEYS],
    );
  });

  it('does not expose a generation when initialization loses its race', async () => {
    workspaceCacheStorageService.getOrInitializeFindAllViewsCacheGeneration.mockResolvedValue(
      undefined,
    );

    await expect(
      service.getCacheGeneration(workspaceId),
    ).resolves.toBeUndefined();
    expect(workspaceCacheService.invalidateLocal).not.toHaveBeenCalled();
  });
});
