import { Injectable, OnModuleInit } from '@nestjs/common';
import { DiscoveryService, Reflector } from '@nestjs/core';

import crypto from 'crypto';

import { InjectCacheStorage } from 'src/engine/core-modules/cache-storage/decorators/cache-storage.decorator';
import { CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import { PromiseMemoizer } from 'src/engine/twenty-orm/storage/promise-memoizer.storage';
import { WORKSPACE_CONTEXT_CACHE_KEY } from 'src/engine/workspace-context-cache/decorators/workspace-context-cache.decorator';
import { WorkspaceContextLocalCacheEntry } from 'src/engine/workspace-context-cache/types/workspace-context-cache-entry.type';
import { WorkspaceContextCacheProvider } from 'src/engine/workspace-context-cache/workspace-context-cache-provider.service';

const STALENESS_CHECK_INTERVAL_MS = 30_000;

@Injectable()
export class WorkspaceContextCacheService implements OnModuleInit {
  private readonly localCache = new Map<
    string,
    WorkspaceContextLocalCacheEntry<unknown>
  >();
  private readonly providers = new Map<
    string,
    WorkspaceContextCacheProvider<unknown>
  >();
  private readonly getMemoizer = new PromiseMemoizer<Record<string, unknown>>(
    STALENESS_CHECK_INTERVAL_MS,
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

      if (!instance || typeof instance !== 'object') {
        continue;
      }

      const cacheProviderName = this.reflector.get<string>(
        WORKSPACE_CONTEXT_CACHE_KEY,
        instance.constructor,
      );

      if (
        cacheProviderName &&
        instance instanceof WorkspaceContextCacheProvider
      ) {
        this.providers.set(cacheProviderName, instance);
      }
    }
  }

  async get<T extends Record<string, unknown> = Record<string, unknown>>(
    workspaceId: string,
    cacheProviderNames: string[],
  ): Promise<T> {
    const memoKey =
      `${workspaceId}-${cacheProviderNames.sort().join(',')}` as const;

    const result = await this.getMemoizer.memoizePromiseAndExecute(
      memoKey,
      async () => {
        const result: Record<string, unknown> = {};

        const { freshKeys, staleKeys } = this.partitionKeysByStaleness(
          workspaceId,
          cacheProviderNames,
        );

        for (const providerName of freshKeys) {
          const localKey = this.localCacheKey(workspaceId, providerName);
          const cached = this.localCache.get(localKey);

          result[providerName] = cached?.data;
        }

        if (staleKeys.length === 0) {
          return result;
        }

        const staleResults = await this.resolveStaleKeys(
          workspaceId,
          staleKeys,
        );

        return { ...result, ...staleResults };
      },
    );

    return result as T;
  }

  invalidate(workspaceId: string, cacheProviderNames?: string[]): void {
    if (!cacheProviderNames) {
      const allKeys = Array.from(this.localCache.keys());

      for (const key of allKeys) {
        if (key.startsWith(`${workspaceId}:`)) {
          this.localCache.delete(key);
        }
      }

      return;
    }

    for (const providerName of cacheProviderNames) {
      const localKey = this.localCacheKey(workspaceId, providerName);

      this.localCache.delete(localKey);
    }
  }

  private partitionKeysByStaleness(
    workspaceId: string,
    cacheProviderNames: string[],
  ): { freshKeys: string[]; staleKeys: string[] } {
    const freshKeys: string[] = [];
    const staleKeys: string[] = [];
    const now = Date.now();

    for (const providerName of cacheProviderNames) {
      const localKey = this.localCacheKey(workspaceId, providerName);
      const cached = this.localCache.get(localKey);

      if (cached && now - cached.lastCheckedAt < STALENESS_CHECK_INTERVAL_MS) {
        freshKeys.push(providerName);
      } else {
        staleKeys.push(providerName);
      }
    }

    return { freshKeys, staleKeys };
  }

  private async resolveStaleKeys(
    workspaceId: string,
    staleKeys: string[],
  ): Promise<Record<string, unknown>> {
    const result: Record<string, unknown> = {};

    const { validFromLocal, needsRedisCheck } = await this.checkHashesInRedis(
      workspaceId,
      staleKeys,
    );

    for (const { providerName, data, hash } of validFromLocal) {
      result[providerName] = data;
      this.updateLocalCache(workspaceId, providerName, data, hash);
    }

    if (needsRedisCheck.length === 0) {
      return result;
    }

    const { validFromRedis, needsCompute } = await this.fetchDataFromRedis(
      workspaceId,
      needsRedisCheck,
    );

    for (const { providerName, data, hash } of validFromRedis) {
      result[providerName] = data;
      this.updateLocalCache(workspaceId, providerName, data, hash);
    }

    if (needsCompute.length === 0) {
      return result;
    }

    const computed = await this.computeAndStoreInRedis(
      workspaceId,
      needsCompute,
    );

    for (const { providerName, data, hash } of computed) {
      result[providerName] = data;
      this.updateLocalCache(workspaceId, providerName, data, hash);
    }

    return result;
  }

  private async checkHashesInRedis(
    workspaceId: string,
    providerNames: string[],
  ): Promise<{
    validFromLocal: Array<{
      providerName: string;
      data: unknown;
      hash: string;
    }>;
    needsRedisCheck: string[];
  }> {
    const validFromLocal: Array<{
      providerName: string;
      data: unknown;
      hash: string;
    }> = [];
    const needsRedisCheck: string[] = [];

    const hashKeys = providerNames.map((name) => {
      const provider = this.getProviderOrThrow(name);

      return provider.hashCacheKey(workspaceId);
    });

    const redisHashes = await this.cacheStorage.mget<string>(hashKeys);

    for (let i = 0; i < providerNames.length; i++) {
      const providerName = providerNames[i];
      const redisHash = redisHashes[i];
      const localKey = this.localCacheKey(workspaceId, providerName);
      const localEntry = this.localCache.get(localKey);

      if (localEntry && redisHash && localEntry.hash === redisHash) {
        validFromLocal.push({
          providerName,
          data: localEntry.data,
          hash: localEntry.hash,
        });
      } else {
        needsRedisCheck.push(providerName);
      }
    }

    return { validFromLocal, needsRedisCheck };
  }

  private async fetchDataFromRedis(
    workspaceId: string,
    providerNames: string[],
  ): Promise<{
    validFromRedis: Array<{
      providerName: string;
      data: unknown;
      hash: string;
    }>;
    needsCompute: string[];
  }> {
    const validFromRedis: Array<{
      providerName: string;
      data: unknown;
      hash: string;
    }> = [];
    const needsCompute: string[] = [];

    const dataKeys = providerNames.map((name) => {
      const provider = this.getProviderOrThrow(name);

      return provider.dataCacheKey(workspaceId);
    });

    const redisData = await this.cacheStorage.mget<unknown>(dataKeys);

    for (let i = 0; i < providerNames.length; i++) {
      const providerName = providerNames[i];
      const data = redisData[i];

      if (data !== undefined) {
        const hash = this.generateHash(data);

        validFromRedis.push({ providerName, data, hash });
      } else {
        needsCompute.push(providerName);
      }
    }

    return { validFromRedis, needsCompute };
  }

  private getProviderOrThrow(
    providerName: string,
  ): WorkspaceContextCacheProvider<unknown> {
    const provider = this.providers.get(providerName);

    if (!provider) {
      throw new Error(`Cache provider "${providerName}" not found`);
    }

    return provider;
  }

  private async computeAndStoreInRedis(
    workspaceId: string,
    providerNames: string[],
  ): Promise<Array<{ providerName: string; data: unknown; hash: string }>> {
    const computePromises = providerNames.map(async (name) => {
      const provider = this.getProviderOrThrow(name);

      const data = await provider.computeForCache(workspaceId);

      return { providerName: name, data, provider };
    });

    const computed = await Promise.all(computePromises);

    const redisEntries = computed.flatMap(({ data, provider }) => {
      const hash = this.generateHash(data);

      return [
        { key: provider.dataCacheKey(workspaceId), value: data },
        { key: provider.hashCacheKey(workspaceId), value: hash },
      ];
    });

    await this.cacheStorage.mset(redisEntries);

    return computed.map(({ providerName, data }) => ({
      providerName,
      data,
      hash: this.generateHash(data),
    }));
  }

  private updateLocalCache(
    workspaceId: string,
    providerName: string,
    data: unknown,
    hash: string,
  ): void {
    const localKey = this.localCacheKey(workspaceId, providerName);

    this.localCache.set(localKey, {
      data,
      hash,
      lastCheckedAt: Date.now(),
    });
  }

  private localCacheKey(
    workspaceId: string,
    cacheProviderName: string,
  ): string {
    return `${workspaceId}:${cacheProviderName}`;
  }

  private generateHash(data: unknown): string {
    return crypto
      .createHash('sha256')
      .update(JSON.stringify(data))
      .digest('hex');
  }
}
