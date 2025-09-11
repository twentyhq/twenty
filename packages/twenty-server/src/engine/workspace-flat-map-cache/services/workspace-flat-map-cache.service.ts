import { Injectable, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import crypto from 'crypto';

import { isDefined } from 'twenty-shared/utils';

import { InjectCacheStorage } from 'src/engine/core-modules/cache-storage/decorators/cache-storage.decorator';
import { CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import { type FlatEntityMaps } from 'src/engine/core-modules/common/types/flat-entity-maps.type';
import { type FlatEntity } from 'src/engine/core-modules/common/types/flat-entity.type';
import { WORKSPACE_FLAT_MAP_CACHE_KEY } from 'src/engine/workspace-flat-map-cache/decorators/workspace-flat-map-cache.decorator';
import {
  WorkspaceFlatMapCacheException,
  WorkspaceFlatMapCacheExceptionCode,
} from 'src/engine/workspace-flat-map-cache/exceptions/workspace-flat-map-cache.exception';

@Injectable()
export abstract class WorkspaceFlatMapCacheService<
  T extends FlatEntityMaps<FlatEntity>,
> {
  protected readonly logger = new Logger(this.constructor.name);

  private readonly localCacheFlatMaps = new Map<string, T>();
  private readonly localCacheHashes = new Map<string, string>();
  private readonly reflector = new Reflector();

  constructor(
    @InjectCacheStorage(CacheStorageNamespace.EngineWorkspace)
    private readonly cacheStorageService: CacheStorageService,
  ) {}

  protected abstract computeFlatMap({
    workspaceId,
  }: {
    workspaceId: string;
  }): Promise<T>;

  async getExistingOrRecomputeFlatMaps({
    workspaceId,
  }: {
    workspaceId: string;
  }): Promise<T> {
    const localCacheHash = this.localCacheHashes.get(workspaceId);
    const remoteCacheHash = await this.getHashFromRemoteCache({ workspaceId });

    if (
      isDefined(localCacheHash) &&
      isDefined(remoteCacheHash) &&
      localCacheHash === remoteCacheHash
    ) {
      const localCacheFlatMap = this.localCacheFlatMaps.get(workspaceId);

      if (localCacheFlatMap) {
        return localCacheFlatMap;
      }
    }

    if (remoteCacheHash) {
      const remoteCacheFlatMap = await this.getFlatMapFromRemoteCache({
        workspaceId,
      });

      if (remoteCacheFlatMap) {
        this.localCacheFlatMaps.set(workspaceId, remoteCacheFlatMap);
        this.localCacheHashes.set(workspaceId, remoteCacheHash);

        return remoteCacheFlatMap;
      }
    }

    const freshFlatMap = await this.recomputeAndStoreInCache({
      workspaceId,
    });

    return freshFlatMap;
  }

  async recomputeAndStoreInCache({
    workspaceId,
  }: {
    workspaceId: string;
  }): Promise<T> {
    const freshFlatMap = await this.computeFlatMap({ workspaceId });
    const newHash = this.generateHash({ flatMap: freshFlatMap });

    await this.setFlatMapInRemoteCache({ workspaceId, flatMap: freshFlatMap });
    await this.setHashInRemoteCache({ workspaceId, hash: newHash });

    this.localCacheFlatMaps.set(workspaceId, freshFlatMap);
    this.localCacheHashes.set(workspaceId, newHash);

    return freshFlatMap;
  }

  async invalidateCache({
    workspaceId,
  }: {
    workspaceId: string;
  }): Promise<void> {
    const { flatMapKey, hashKey } = this.buildRemoteCacheKeys({ workspaceId });

    await this.cacheStorageService.del(flatMapKey);
    await this.cacheStorageService.del(hashKey);

    this.localCacheFlatMaps.delete(workspaceId);
    this.localCacheHashes.delete(workspaceId);

    await this.recomputeAndStoreInCache({ workspaceId });
  }

  private getFlatMapCacheKey(): string {
    const cacheKey = this.reflector.get<string>(
      WORKSPACE_FLAT_MAP_CACHE_KEY,
      this.constructor,
    );

    if (!cacheKey) {
      throw new WorkspaceFlatMapCacheException(
        `${this.constructor.name} must be decorated with @WorkspaceFlatMapCache('cacheKey')`,
        WorkspaceFlatMapCacheExceptionCode.MISSING_DECORATOR,
      );
    }

    return cacheKey;
  }

  private buildRemoteCacheKeys({ workspaceId }: { workspaceId: string }) {
    const cacheKey = this.getFlatMapCacheKey();

    return {
      flatMapKey: `flat-maps:${cacheKey}:${workspaceId}:flat-map`,
      hashKey: `flat-maps:${cacheKey}:${workspaceId}:hash`,
    };
  }

  private generateHash({ flatMap }: { flatMap: T }): string {
    return crypto
      .createHash('sha256')
      .update(JSON.stringify(flatMap))
      .digest('hex');
  }

  private async getHashFromRemoteCache({
    workspaceId,
  }: {
    workspaceId: string;
  }): Promise<string | undefined> {
    const { hashKey } = this.buildRemoteCacheKeys({ workspaceId });

    return this.cacheStorageService.get<string>(hashKey);
  }

  private async setHashInRemoteCache({
    workspaceId,
    hash,
  }: {
    workspaceId: string;
    hash: string;
  }): Promise<void> {
    const { hashKey } = this.buildRemoteCacheKeys({ workspaceId });

    await this.cacheStorageService.set(hashKey, hash);
  }

  private async getFlatMapFromRemoteCache({
    workspaceId,
  }: {
    workspaceId: string;
  }): Promise<T | undefined> {
    const { flatMapKey } = this.buildRemoteCacheKeys({ workspaceId });

    return this.cacheStorageService.get<T>(flatMapKey);
  }

  private async setFlatMapInRemoteCache({
    workspaceId,
    flatMap,
  }: {
    workspaceId: string;
    flatMap: T;
  }): Promise<void> {
    const { flatMapKey } = this.buildRemoteCacheKeys({ workspaceId });

    await this.cacheStorageService.set(flatMapKey, flatMap);
  }
}
