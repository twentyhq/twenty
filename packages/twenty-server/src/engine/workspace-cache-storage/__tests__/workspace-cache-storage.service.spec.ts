import { CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import {
  FIND_ALL_VIEWS_CACHE_GENERATION_KEY_PREFIX,
  WorkspaceCacheStorageService,
} from 'src/engine/workspace-cache-storage/workspace-cache-storage.service';

describe('WorkspaceCacheStorageService', () => {
  const workspaceId = '20202020-1111-4111-8111-111111111111';
  const generationKey = `${FIND_ALL_VIEWS_CACHE_GENERATION_KEY_PREFIX}:${workspaceId}:cache-generation`;

  let cacheStorageService: jest.Mocked<CacheStorageService>;
  let service: WorkspaceCacheStorageService;

  beforeEach(() => {
    cacheStorageService = {
      get: jest.fn(),
      set: jest.fn(),
      setIfAbsent: jest.fn(),
      del: jest.fn(),
    } as unknown as jest.Mocked<CacheStorageService>;
    service = new WorkspaceCacheStorageService(cacheStorageService);
  });

  it('returns the existing FindAllViews cache generation', async () => {
    cacheStorageService.get.mockResolvedValue('existing-generation');

    await expect(
      service.getOrInitializeFindAllViewsCacheGeneration(workspaceId),
    ).resolves.toBe('existing-generation');
    expect(cacheStorageService.setIfAbsent).not.toHaveBeenCalled();
  });

  it('initializes a persistent FindAllViews cache generation', async () => {
    cacheStorageService.get.mockResolvedValue(undefined);
    cacheStorageService.setIfAbsent.mockResolvedValue(true);

    const generation =
      await service.getOrInitializeFindAllViewsCacheGeneration(workspaceId);

    expect(generation).toEqual(expect.any(String));
    expect(cacheStorageService.setIfAbsent).toHaveBeenCalledWith(
      generationKey,
      generation,
      0,
    );
  });

  it('uses the generation initialized by a concurrent request', async () => {
    cacheStorageService.get
      .mockResolvedValueOnce(undefined)
      .mockResolvedValueOnce('concurrent-generation');
    cacheStorageService.setIfAbsent.mockResolvedValue(false);

    await expect(
      service.getOrInitializeFindAllViewsCacheGeneration(workspaceId),
    ).resolves.toBe('concurrent-generation');
  });

  it('rotates the FindAllViews cache generation without expiration', async () => {
    await service.rotateFindAllViewsCacheGeneration(workspaceId);

    expect(cacheStorageService.set).toHaveBeenCalledWith(
      generationKey,
      expect.any(String),
      0,
    );
  });

  it('deletes the FindAllViews generation when flushing a workspace', async () => {
    await service.flush(workspaceId);

    expect(cacheStorageService.del).toHaveBeenCalledWith(generationKey);
  });
});
