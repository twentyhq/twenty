import { Injectable, OnModuleInit } from '@nestjs/common';
import { DiscoveryService, Reflector } from '@nestjs/core';

import crypto from 'crypto';

import { isDefined } from 'twenty-shared/utils';

import { WorkspaceCacheProvider } from 'src/engine/workspace-cache/interfaces/workspace-cache-provider.service';

import { InjectCacheStorage } from 'src/engine/core-modules/cache-storage/decorators/cache-storage.decorator';
import { CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import { PromiseMemoizer } from 'src/engine/twenty-orm/storage/promise-memoizer.storage';
import { WORKSPACE_CACHE_KEY } from 'src/engine/workspace-cache/decorators/workspace-cache.decorator';
import {
  WORKSPACE_CACHE_KEYS_V2,
  type WorkspaceCacheDataMap,
  type WorkspaceCacheKeyName,
  type WorkspaceCacheResult,
} from 'src/engine/workspace-cache/types/workspace-cache-key.type';
import { type WorkspaceLocalCacheEntry } from 'src/engine/workspace-cache/types/workspace-local-cache-entry.type';

const LOCAL_STALENESS_TTL_MS = 100;
const MEMOIZER_TTL_MS = 10_000;

type CacheDataType = WorkspaceCacheDataMap[WorkspaceCacheKeyName];

@Injectable()
export class WorkspaceCacheService implements OnModuleInit {
  private readonly localCache = new Map<
    string,
    WorkspaceLocalCacheEntry<CacheDataType>
  >();
  private readonly workspaceCacheProviders = new Map<
    WorkspaceCacheKeyName,
    WorkspaceCacheProvider<CacheDataType>
  >();
  private readonly memoizer = new PromiseMemoizer<
    Partial<WorkspaceCacheDataMap>
  >(MEMOIZER_TTL_MS);

  constructor(
    @InjectCacheStorage(CacheStorageNamespace.EngineWorkspace)
    private readonly cacheStorage: CacheStorageService,
    private readonly discoveryService: DiscoveryService,
    private readonly reflector: Reflector,
  ) {}

  async onModuleInit() {
    const providers = this.discoveryService.getProviders();

    for (const wrapper of providers) {
      const { instance } = wrapper;

      if (!isDefined(instance) || typeof instance !== 'object') {
        continue;
      }

      const workspaceCacheKeyName = this.reflector.get<WorkspaceCacheKeyName>(
        WORKSPACE_CACHE_KEY,
        instance.constructor,
      );

      if (
        isDefined(workspaceCacheKeyName) &&
        instance instanceof WorkspaceCacheProvider
      ) {
        this.workspaceCacheProviders.set(workspaceCacheKeyName, instance);
      }
    }
  }

  async getOrRecompute<const K extends WorkspaceCacheKeyName[]>(
    workspaceId: string,
    workspaceCacheKeyNames: K,
  ): Promise<WorkspaceCacheResult<K>> {
    const memoKey =
      `${workspaceId}-${[...workspaceCacheKeyNames].sort().join(',')}` as const;

    const result = await this.memoizer.memoizePromiseAndExecute(
      memoKey,
      async () => {
        const freshResult: Partial<WorkspaceCacheDataMap> = {};

        const { freshKeys, staleKeys } = this.partitionKeysByTTLStaleness(
          workspaceId,
          workspaceCacheKeyNames,
        );

        for (const workspaceCacheKeyName of freshKeys) {
          const localKey = this.buildCacheKey(
            workspaceId,
            workspaceCacheKeyName,
          );
          const cached = this.localCache.get(localKey);

          if (isDefined(cached)) {
            Object.assign(freshResult, {
              [workspaceCacheKeyName]: cached.data,
            });
          }
        }

        if (staleKeys.length === 0) {
          return freshResult;
        }

        const staleResults = await this.resolveStaleKeys(
          workspaceId,
          staleKeys,
        );

        return { ...freshResult, ...staleResults };
      },
    );

    return result as WorkspaceCacheResult<K>;
  }

  async invalidateAndRecompute(
    workspaceId: string,
    workspaceCacheKeys: WorkspaceCacheKeyName[],
  ): Promise<void> {
    await this.memoizer.clearKeys(`${workspaceId}-`);

    await this.flush(workspaceId, workspaceCacheKeys);
    await this.recomputeCache(workspaceId, workspaceCacheKeys);
  }

  async flush(
    workspaceId: string,
    workspaceCacheKeys: WorkspaceCacheKeyName[],
  ): Promise<void> {
    await this.deleteFromRedis(workspaceId, workspaceCacheKeys);
    this.deleteFromLocalCache(workspaceId, workspaceCacheKeys);
  }

  private deleteFromLocalCache(
    workspaceId: string,
    workspaceCacheKeys: WorkspaceCacheKeyName[],
  ): void {
    for (const workspaceCacheKeyName of workspaceCacheKeys) {
      const localKey = this.buildCacheKey(workspaceId, workspaceCacheKeyName);

      this.localCache.delete(localKey);
    }
  }

  private async deleteFromRedis(
    workspaceId: string,
    workspaceCacheKeys: WorkspaceCacheKeyName[],
  ): Promise<void> {
    const keysToDelete = workspaceCacheKeys.flatMap((workspaceCacheKeyName) => {
      const baseKey = this.buildCacheKey(workspaceId, workspaceCacheKeyName);

      return [`${baseKey}:data`, `${baseKey}:hash`];
    });

    await this.cacheStorage.mdel(keysToDelete);
  }

  private async recomputeCache(
    workspaceId: string,
    workspaceCacheKeys: WorkspaceCacheKeyName[],
  ): Promise<void> {
    const computed = await this.computeAndStoreInRedis(
      workspaceId,
      workspaceCacheKeys,
    );

    for (const { workspaceCacheKeyName, data, hash } of computed) {
      this.setInLocalCache(workspaceId, workspaceCacheKeyName, data, hash);
    }
  }

  private partitionKeysByTTLStaleness<K extends WorkspaceCacheKeyName>(
    workspaceId: string,
    workspaceCacheKeys: readonly K[],
  ): { freshKeys: K[]; staleKeys: K[] } {
    const freshKeys: K[] = [];
    const staleKeys: K[] = [];
    const now = Date.now();

    for (const workspaceCacheKeyName of workspaceCacheKeys) {
      const localKey = this.buildCacheKey(workspaceId, workspaceCacheKeyName);
      const cached = this.localCache.get(localKey);

      if (
        isDefined(cached) &&
        now - cached.lastCheckedAt < LOCAL_STALENESS_TTL_MS
      ) {
        freshKeys.push(workspaceCacheKeyName);
      } else {
        staleKeys.push(workspaceCacheKeyName);
      }
    }

    return { freshKeys, staleKeys };
  }

  private async resolveStaleKeys(
    workspaceId: string,
    workspaceCacheKeys: WorkspaceCacheKeyName[],
  ): Promise<Partial<WorkspaceCacheDataMap>> {
    const result: Partial<WorkspaceCacheDataMap> = {};

    const { validFromLocal, needsRedisCheck } =
      await this.partitionKeysByLocalStaleness(workspaceId, workspaceCacheKeys);

    for (const workspaceCacheKeyName of validFromLocal) {
      const localKey = this.buildCacheKey(workspaceId, workspaceCacheKeyName);
      const localEntry = this.localCache.get(localKey);

      if (!isDefined(localEntry)) {
        continue;
      }

      Object.assign(result, { [workspaceCacheKeyName]: localEntry.data });
      this.setInLocalCache(
        workspaceId,
        workspaceCacheKeyName,
        localEntry.data,
        localEntry.hash,
      );
    }

    if (needsRedisCheck.length === 0) {
      return result;
    }

    const {
      validDataFromRedis: validFromRedis,
      cacheKeysToRecomputeFromProviders: needsCompute,
    } = await this.fetchDataFromRedis(workspaceId, needsRedisCheck);

    for (const { workspaceCacheKeyName, data, hash } of validFromRedis) {
      Object.assign(result, { [workspaceCacheKeyName]: data });
      this.setInLocalCache(workspaceId, workspaceCacheKeyName, data, hash);
    }

    if (needsCompute.length === 0) {
      return result;
    }

    const computed = await this.computeAndStoreInRedis(
      workspaceId,
      needsCompute,
    );

    for (const { workspaceCacheKeyName, data, hash } of computed) {
      Object.assign(result, { [workspaceCacheKeyName]: data });
      this.setInLocalCache(workspaceId, workspaceCacheKeyName, data, hash);
    }

    return result;
  }

  private async partitionKeysByLocalStaleness(
    workspaceId: string,
    workspaceCacheKeys: WorkspaceCacheKeyName[],
  ): Promise<{
    validFromLocal: WorkspaceCacheKeyName[];
    needsRedisCheck: WorkspaceCacheKeyName[];
  }> {
    const validFromLocal: WorkspaceCacheKeyName[] = [];
    const needsRedisCheck: WorkspaceCacheKeyName[] = [];

    const hashKeys = workspaceCacheKeys.map(
      (workspaceCacheKeyName) =>
        `${this.buildCacheKey(workspaceId, workspaceCacheKeyName)}:hash`,
    );

    const redisHashes = await this.cacheStorage.mget<string>(hashKeys);

    for (const [index, workspaceCacheKeyName] of workspaceCacheKeys.entries()) {
      const redisHash = redisHashes[index];
      const localKey = this.buildCacheKey(workspaceId, workspaceCacheKeyName);
      const localEntry = this.localCache.get(localKey);

      if (
        isDefined(localEntry) &&
        isDefined(redisHash) &&
        localEntry.hash === redisHash
      ) {
        validFromLocal.push(workspaceCacheKeyName);
      } else {
        needsRedisCheck.push(workspaceCacheKeyName);
      }
    }

    return { validFromLocal, needsRedisCheck };
  }

  private async fetchDataFromRedis(
    workspaceId: string,
    workspaceCacheKeys: WorkspaceCacheKeyName[],
  ): Promise<{
    validDataFromRedis: Array<{
      workspaceCacheKeyName: WorkspaceCacheKeyName;
      data: CacheDataType;
      hash: string;
    }>;
    cacheKeysToRecomputeFromProviders: WorkspaceCacheKeyName[];
  }> {
    const validDataFromRedis: Array<{
      workspaceCacheKeyName: WorkspaceCacheKeyName;
      data: CacheDataType;
      hash: string;
    }> = [];
    const cacheKeysToRecomputeFromProviders: WorkspaceCacheKeyName[] = [];

    const dataKeys = workspaceCacheKeys.map(
      (workspaceCacheKeyName) =>
        `${this.buildCacheKey(workspaceId, workspaceCacheKeyName)}:data`,
    );

    const redisData = await this.cacheStorage.mget<CacheDataType>(dataKeys);

    for (const [index, workspaceCacheKeyName] of workspaceCacheKeys.entries()) {
      const data = redisData[index];

      if (isDefined(data)) {
        const hash = this.generateHash(data);

        validDataFromRedis.push({ workspaceCacheKeyName, data, hash });
      } else {
        cacheKeysToRecomputeFromProviders.push(workspaceCacheKeyName);
      }
    }

    return {
      validDataFromRedis,
      cacheKeysToRecomputeFromProviders,
    };
  }

  private getProviderOrThrow(
    workspaceCacheKeyName: WorkspaceCacheKeyName,
  ): WorkspaceCacheProvider<CacheDataType> {
    const provider = this.workspaceCacheProviders.get(workspaceCacheKeyName);

    if (!isDefined(provider)) {
      throw new Error(
        `Cache provider with key name "${workspaceCacheKeyName}" not found`,
      );
    }

    return provider;
  }

  private async computeAndStoreInRedis(
    workspaceId: string,
    workspaceCacheKeys: WorkspaceCacheKeyName[],
  ): Promise<
    Array<{
      workspaceCacheKeyName: WorkspaceCacheKeyName;
      data: CacheDataType;
      hash: string;
    }>
  > {
    const computePromises = workspaceCacheKeys.map(
      async (workspaceCacheKeyName) => {
        const provider = this.getProviderOrThrow(workspaceCacheKeyName);

        const data = await provider.computeForCache(workspaceId);

        return { workspaceCacheKeyName, data };
      },
    );

    const computed = await Promise.all(computePromises);

    const redisEntries: Array<{ key: string; value: unknown }> = [];

    for (const { workspaceCacheKeyName, data } of computed) {
      const hash = this.generateHash(data);

      redisEntries.push({
        key: `${this.buildCacheKey(workspaceId, workspaceCacheKeyName)}:data`,
        value: data,
      });
      redisEntries.push({
        key: `${this.buildCacheKey(workspaceId, workspaceCacheKeyName)}:hash`,
        value: hash,
      });
    }

    await this.cacheStorage.mset(redisEntries);

    return computed.map(({ workspaceCacheKeyName, data }) => ({
      workspaceCacheKeyName,
      data,
      hash: this.generateHash(data),
    }));
  }

  private setInLocalCache(
    workspaceId: string,
    workspaceCacheKeyName: WorkspaceCacheKeyName,
    data: CacheDataType,
    hash: string,
  ): void {
    const localKey = this.buildCacheKey(workspaceId, workspaceCacheKeyName);

    this.localCache.set(localKey, {
      data,
      hash,
      lastCheckedAt: Date.now(),
    });
  }

  private buildCacheKey(
    workspaceId: string,
    workspaceCacheKeyName: WorkspaceCacheKeyName,
  ): string {
    return `${WORKSPACE_CACHE_KEYS_V2[workspaceCacheKeyName]}:${workspaceId}`;
  }

  private generateHash(data: unknown): string {
    return crypto
      .createHash('sha256')
      .update(JSON.stringify(data))
      .digest('hex');
  }
}
