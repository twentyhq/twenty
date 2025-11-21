import { Injectable, OnModuleInit } from '@nestjs/common';
import { DiscoveryService, Reflector } from '@nestjs/core';

import crypto from 'crypto';

import { isDefined } from 'twenty-shared/utils';

import { InjectCacheStorage } from 'src/engine/core-modules/cache-storage/decorators/cache-storage.decorator';
import { CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import { PromiseMemoizer } from 'src/engine/twenty-orm/storage/promise-memoizer.storage';
import { WORKSPACE_CACHE_KEY } from 'src/engine/workspace-cache/decorators/workspace-cache.decorator';
import { WorkspaceContextLocalCacheEntry } from 'src/engine/workspace-cache/types/workspace-context-cache-entry.type';
import { WorkspaceCacheProvider } from 'src/engine/workspace-cache/workspace-cache-provider.service';

const LOCAL_STALENESS_TTL_MS = 30_000;
const MEMOIZER_TTL_MS = 10_000;

@Injectable()
export class WorkspaceCacheService implements OnModuleInit {
  private readonly localCache = new Map<
    string,
    WorkspaceContextLocalCacheEntry<unknown>
  >();
  private readonly workspaceCacheProviders = new Map<
    string,
    WorkspaceCacheProvider<unknown>
  >();
  private readonly memoizer = new PromiseMemoizer<Record<string, unknown>>(
    MEMOIZER_TTL_MS,
  );

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

      const workspaceCacheKey = this.reflector.get<string>(
        WORKSPACE_CACHE_KEY,
        instance.constructor,
      );

      if (
        isDefined(workspaceCacheKey) &&
        instance instanceof WorkspaceCacheProvider
      ) {
        this.workspaceCacheProviders.set(workspaceCacheKey, instance);
      }
    }
  }

  async getOrRecompute<
    T extends Record<string, unknown> = Record<string, unknown>,
  >(workspaceId: string, workspaceCacheKeys: string[]): Promise<T> {
    const memoKey =
      `${workspaceId}-${[...workspaceCacheKeys].sort().join(',')}` as const;

    const result = await this.memoizer.memoizePromiseAndExecute(
      memoKey,
      async () => {
        const freshResult: Record<string, unknown> = {};

        const { freshKeys, staleKeys } = this.partitionKeysByTTLStaleness(
          workspaceId,
          workspaceCacheKeys,
        );

        for (const workspaceCacheKey of freshKeys) {
          const localKey = this.getCacheKey(workspaceId, workspaceCacheKey);
          const cached = this.localCache.get(localKey);

          freshResult[workspaceCacheKey] = cached?.data;
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

    return result as T;
  }

  invalidate(workspaceId: string, workspaceCacheKeys?: string[]): void {
    if (!isDefined(workspaceCacheKeys) || workspaceCacheKeys.length === 0) {
      const allKeys = Array.from(this.localCache.keys());

      for (const key of allKeys) {
        if (key.startsWith(this.getCacheKey(workspaceId, ''))) {
          this.localCache.delete(key);
        }
      }

      return;
    }

    for (const workspaceCacheKey of workspaceCacheKeys) {
      const localKey = this.getCacheKey(workspaceId, workspaceCacheKey);

      this.localCache.delete(localKey);
    }
  }

  private partitionKeysByTTLStaleness(
    workspaceId: string,
    workspaceCacheKeys: string[],
  ): { freshKeys: string[]; staleKeys: string[] } {
    const freshKeys: string[] = [];
    const staleKeys: string[] = [];
    const now = Date.now();

    for (const workspaceCacheKey of workspaceCacheKeys) {
      const localKey = this.getCacheKey(workspaceId, workspaceCacheKey);
      const cached = this.localCache.get(localKey);

      if (
        isDefined(cached) &&
        now - cached.lastCheckedAt < LOCAL_STALENESS_TTL_MS
      ) {
        freshKeys.push(workspaceCacheKey);
      } else {
        staleKeys.push(workspaceCacheKey);
      }
    }

    return { freshKeys, staleKeys };
  }

  private async resolveStaleKeys(
    workspaceId: string,
    workspaceCacheKeys: string[],
  ): Promise<Record<string, unknown>> {
    const result: Record<string, unknown> = {};

    const { validFromLocal, needsRedisCheck } =
      await this.partitionKeysByLocalStaleness(workspaceId, workspaceCacheKeys);

    for (const workspaceCacheKey of validFromLocal) {
      const localKey = this.getCacheKey(workspaceId, workspaceCacheKey);
      const localEntry = this.localCache.get(localKey);

      if (!isDefined(localEntry)) {
        continue;
      }

      result[workspaceCacheKey] = localEntry.data;
      this.updateLocalCache(
        workspaceId,
        workspaceCacheKey,
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

    for (const { workspaceCacheKey, data, hash } of validFromRedis) {
      result[workspaceCacheKey] = data;
      this.updateLocalCache(workspaceId, workspaceCacheKey, data, hash);
    }

    if (needsCompute.length === 0) {
      return result;
    }

    const computed = await this.computeAndStoreInRedis(
      workspaceId,
      needsCompute,
    );

    for (const { workspaceCacheKey, data, hash } of computed) {
      result[workspaceCacheKey] = data;
      this.updateLocalCache(workspaceId, workspaceCacheKey, data, hash);
    }

    return result;
  }

  private async partitionKeysByLocalStaleness(
    workspaceId: string,
    workspaceCacheKeys: string[],
  ): Promise<{
    validFromLocal: string[];
    needsRedisCheck: string[];
  }> {
    const validFromLocal: string[] = [];
    const needsRedisCheck: string[] = [];

    const hashKeys = workspaceCacheKeys.map((workspaceCacheKey) => {
      return `${workspaceId}:${workspaceCacheKey}:hash`;
    });

    const redisHashes = await this.cacheStorage.mget<string>(hashKeys);

    for (let i = 0; i < workspaceCacheKeys.length; i++) {
      const workspaceCacheKey = workspaceCacheKeys[i];
      const redisHash = redisHashes[i];
      const localKey = this.getCacheKey(workspaceId, workspaceCacheKey);
      const localEntry = this.localCache.get(localKey);

      if (
        isDefined(localEntry) &&
        isDefined(redisHash) &&
        localEntry.hash === redisHash
      ) {
        validFromLocal.push(workspaceCacheKey);
      } else {
        needsRedisCheck.push(workspaceCacheKey);
      }
    }

    return { validFromLocal, needsRedisCheck };
  }

  private async fetchDataFromRedis(
    workspaceId: string,
    workspaceCacheKeys: string[],
  ): Promise<{
    validDataFromRedis: Array<{
      workspaceCacheKey: string;
      data: unknown;
      hash: string;
    }>;
    cacheKeysToRecomputeFromProviders: string[];
  }> {
    const validDataFromRedis: Array<{
      workspaceCacheKey: string;
      data: unknown;
      hash: string;
    }> = [];
    const cacheKeysToRecomputeFromProviders: string[] = [];

    const dataKeys = workspaceCacheKeys.map((workspaceCacheKey) => {
      return `${this.getCacheKey(workspaceId, workspaceCacheKey)}:data`;
    });

    const redisData = await this.cacheStorage.mget<unknown>(dataKeys);

    for (let i = 0; i < workspaceCacheKeys.length; i++) {
      const workspaceCacheKey = workspaceCacheKeys[i];
      const data = redisData[i];

      if (isDefined(data)) {
        const hash = this.generateHash(data);

        validDataFromRedis.push({ workspaceCacheKey, data, hash });
      } else {
        cacheKeysToRecomputeFromProviders.push(workspaceCacheKey);
      }
    }

    return {
      validDataFromRedis,
      cacheKeysToRecomputeFromProviders,
    };
  }

  private getProviderOrThrow(
    workspaceCacheKey: string,
  ): WorkspaceCacheProvider<unknown> {
    const provider = this.workspaceCacheProviders.get(workspaceCacheKey);

    if (!isDefined(provider)) {
      throw new Error(
        `Cache provider with key "${workspaceCacheKey}" not found`,
      );
    }

    return provider;
  }

  private async computeAndStoreInRedis(
    workspaceId: string,
    workspaceCacheKeys: string[],
  ): Promise<
    Array<{ workspaceCacheKey: string; data: unknown; hash: string }>
  > {
    const computePromises = workspaceCacheKeys.map(
      async (workspaceCacheKey) => {
        const provider = this.getProviderOrThrow(workspaceCacheKey);

        const data = await provider.computeForCache(workspaceId);

        return { workspaceCacheKey, data };
      },
    );

    const computed = await Promise.all(computePromises);

    const redisEntries = computed.flatMap(({ workspaceCacheKey, data }) => {
      const hash = this.generateHash(data);

      return [
        {
          key: `${this.getCacheKey(workspaceId, workspaceCacheKey)}:data`,
          value: data,
        },
        {
          key: `${this.getCacheKey(workspaceId, workspaceCacheKey)}:hash`,
          value: hash,
        },
      ];
    });

    await this.cacheStorage.mset(redisEntries);

    return computed.map(({ workspaceCacheKey, data }) => ({
      workspaceCacheKey,
      data,
      hash: this.generateHash(data),
    }));
  }

  private updateLocalCache(
    workspaceId: string,
    workspaceCacheKey: string,
    data: unknown,
    hash: string,
  ): void {
    const localKey = this.getCacheKey(workspaceId, workspaceCacheKey);

    this.localCache.set(localKey, {
      data,
      hash,
      lastCheckedAt: Date.now(),
    });
  }

  private getCacheKey(workspaceId: string, workspaceCacheKey: string): string {
    return `${workspaceId}:${workspaceCacheKey}`;
  }

  private generateHash(data: unknown): string {
    return crypto
      .createHash('sha256')
      .update(JSON.stringify(data))
      .digest('hex');
  }
}
