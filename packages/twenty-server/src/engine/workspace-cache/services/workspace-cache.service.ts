import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { DiscoveryService, Reflector } from '@nestjs/core';

import crypto from 'crypto';

import { isDefined, isValidUuid } from 'twenty-shared/utils';

import { WorkspaceCacheProvider } from 'src/engine/workspace-cache/interfaces/workspace-cache-provider.service';

import { InjectCacheStorage } from 'src/engine/core-modules/cache-storage/decorators/cache-storage.decorator';
import { CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import { PromiseMemoizer } from 'src/engine/twenty-orm/storage/promise-memoizer.storage';
import {
  WORKSPACE_CACHE_KEY,
  WORKSPACE_CACHE_OPTIONS,
  WorkspaceCacheOptions,
} from 'src/engine/workspace-cache/decorators/workspace-cache.decorator';
import {
  WorkspaceCacheException,
  WorkspaceCacheExceptionCode,
} from 'src/engine/workspace-cache/exceptions/workspace-cache.exception';
import {
  WORKSPACE_CACHE_KEYS_V2,
  WorkspaceCacheKeyName,
  type WorkspaceCacheDataMap,
  type WorkspaceCacheResult,
} from 'src/engine/workspace-cache/types/workspace-cache-key.type';
import { type WorkspaceLocalCacheEntry } from 'src/engine/workspace-cache/types/workspace-local-cache-entry.type';

const LOCAL_TTL_MS = 100; // 100ms
const LOCAL_ENTRY_TTL_MS = 30 * 60 * 1000; // 30 minutes
const MEMOIZER_TTL_MS = 10_000; // 10 seconds
const STALE_VERSION_TTL_MS = 5_000; // 5 seconds
const MAX_LOCAL_STALE_VERSIONS = 5; // 5 stale versions

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
  private readonly localDataOnlyKeys = new Set<WorkspaceCacheKeyName>();
  private readonly memoizer = new PromiseMemoizer<
    Partial<WorkspaceCacheDataMap>
  >(MEMOIZER_TTL_MS);

  private readonly logger = new Logger(WorkspaceCacheService.name);

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

        const options: WorkspaceCacheOptions | undefined =
          this.reflector.get<WorkspaceCacheOptions>(
            WORKSPACE_CACHE_OPTIONS,
            instance.constructor,
          );

        if (options?.localDataOnly) {
          this.localDataOnlyKeys.add(workspaceCacheKeyName);
        }
      }
    }
  }

  public async getOrRecompute<const K extends WorkspaceCacheKeyName[]>(
    workspaceId: string,
    cacheKeyNames: K,
  ): Promise<WorkspaceCacheResult<K>> {
    this.evictExpiredLocalEntries();

    if (
      !isDefined(workspaceId) ||
      cacheKeyNames.length === 0 ||
      !isValidUuid(workspaceId)
    ) {
      throw new WorkspaceCacheException(
        'Invalid parameters: workspace ID and cache key names are required',
        WorkspaceCacheExceptionCode.INVALID_PARAMETERS,
      );
    }

    const memoKey =
      `${workspaceId}-${[...cacheKeyNames].sort().join(',')}` as const;

    const result = await this.memoizer.memoizePromiseAndExecute(
      memoKey,
      async () => {
        // Stage 1: Check local TTL
        const { freshKeys, staleKeys } = this.checkLocalTTL(
          workspaceId,
          cacheKeyNames,
        );
        const freshData = this.getFromLocalCache(workspaceId, freshKeys);

        if (staleKeys.length === 0) {
          return freshData;
        }

        // Stage 2: Validate ttl stale keys against Redis hash
        const { validKeys, keysNeedingDataFromRedis, keysNeedingRecompute } =
          await this.validateLocalHashAgainstRedisHash(workspaceId, staleKeys);
        const validatedData = this.getFromLocalCache(workspaceId, validKeys);

        // Stage 3: Fetch data from Redis
        const { redisData, missingInRedis } = await this.fetchDataFromRedis(
          workspaceId,
          keysNeedingDataFromRedis,
        );

        // Stage 4: Recompute remaining
        const keysToRecompute = [...keysNeedingRecompute, ...missingInRedis];
        const recomputedData = await this.recomputeDataFromProvider(
          workspaceId,
          keysToRecompute,
        );

        return {
          ...freshData,
          ...validatedData,
          ...redisData,
          ...recomputedData,
        };
      },
    );

    return result as WorkspaceCacheResult<K>;
  }

  public async invalidateAndRecompute(
    workspaceId: string,
    cacheKeyNames: WorkspaceCacheKeyName[],
  ): Promise<void> {
    await this.memoizer.clearKeys(`${workspaceId}-`);

    await this.flush(workspaceId, cacheKeyNames);
    await this.recomputeDataFromProvider(workspaceId, cacheKeyNames);
  }

  public async flush(
    workspaceId: string,
    cacheKeyNames: WorkspaceCacheKeyName[],
  ): Promise<void> {
    await this.deleteFromRedis(workspaceId, cacheKeyNames);

    this.deleteFromLocalCache(workspaceId, cacheKeyNames);
  }

  private checkLocalTTL<K extends WorkspaceCacheKeyName>(
    workspaceId: string,
    cacheKeyNames: readonly K[],
  ): { freshKeys: K[]; staleKeys: K[] } {
    const freshKeys: K[] = [];
    const staleKeys: K[] = [];
    const now = Date.now();

    for (const keyName of cacheKeyNames) {
      const localKey = this.buildCacheKey(workspaceId, keyName);
      const cached = this.localCache.get(localKey);

      if (isDefined(cached) && now - cached.lastHashCheckedAt < LOCAL_TTL_MS) {
        freshKeys.push(keyName);
      } else {
        staleKeys.push(keyName);
      }
    }

    return { freshKeys, staleKeys };
  }

  private async validateLocalHashAgainstRedisHash(
    workspaceId: string,
    cacheKeyNames: WorkspaceCacheKeyName[],
  ): Promise<{
    validKeys: WorkspaceCacheKeyName[];
    keysNeedingDataFromRedis: WorkspaceCacheKeyName[];
    keysNeedingRecompute: WorkspaceCacheKeyName[];
  }> {
    const validKeys: WorkspaceCacheKeyName[] = [];
    const keysNeedingDataFromRedis: WorkspaceCacheKeyName[] = [];
    const keysNeedingRecompute: WorkspaceCacheKeyName[] = [];

    if (cacheKeyNames.length === 0) {
      return { validKeys, keysNeedingDataFromRedis, keysNeedingRecompute };
    }

    const hashKeys = cacheKeyNames.map(
      (keyName) => `${this.buildCacheKey(workspaceId, keyName)}:hash`,
    );

    const redisHashes = await this.cacheStorage.mget<string>(hashKeys);

    for (const [index, keyName] of cacheKeyNames.entries()) {
      const redisHash = redisHashes[index];
      const localKey = this.buildCacheKey(workspaceId, keyName);
      const localEntry = this.localCache.get(localKey);

      if (
        isDefined(localEntry) &&
        isDefined(redisHash) &&
        localEntry.latestHash === redisHash
      ) {
        localEntry.lastHashCheckedAt = Date.now();
        validKeys.push(keyName);
      } else if (this.localDataOnlyKeys.has(keyName)) {
        keysNeedingRecompute.push(keyName);
      } else {
        keysNeedingDataFromRedis.push(keyName);
      }
    }

    return { validKeys, keysNeedingDataFromRedis, keysNeedingRecompute };
  }

  private async fetchDataFromRedis(
    workspaceId: string,
    cacheKeyNames: WorkspaceCacheKeyName[],
  ): Promise<{
    redisData: Partial<WorkspaceCacheDataMap>;
    missingInRedis: WorkspaceCacheKeyName[];
  }> {
    const redisData: Partial<WorkspaceCacheDataMap> = {};
    const missingInRedis: WorkspaceCacheKeyName[] = [];

    if (cacheKeyNames.length === 0) {
      return { redisData, missingInRedis };
    }

    // Interleave data and hash keys for atomic fetch: [data1, hash1, data2, hash2, ...]
    const allKeys = cacheKeyNames.flatMap((keyName) => {
      const baseKey = this.buildCacheKey(workspaceId, keyName);

      return [`${baseKey}:data`, `${baseKey}:hash`];
    });

    const allValues = await this.cacheStorage.mget<CacheDataType | string>(
      allKeys,
    );

    for (const [index, keyName] of cacheKeyNames.entries()) {
      const data = allValues[index * 2] as CacheDataType | undefined;
      const hash = allValues[index * 2 + 1] as string | undefined;

      if (isDefined(data) && isDefined(hash)) {
        Object.assign(redisData, { [keyName]: data });
        this.setInLocalCache(workspaceId, keyName, data, hash);
      } else {
        missingInRedis.push(keyName);
      }
    }

    return { redisData, missingInRedis };
  }

  private async recomputeDataFromProvider(
    workspaceId: string,
    cacheKeyNames: WorkspaceCacheKeyName[],
  ): Promise<Partial<WorkspaceCacheDataMap>> {
    const result: Partial<WorkspaceCacheDataMap> = {};

    if (cacheKeyNames.length === 0) {
      return result;
    }

    const computePromises = cacheKeyNames.map(async (keyName) => {
      const provider = this.getProviderOrThrow(keyName);
      const data = await provider.computeForCache(workspaceId);
      const hash = crypto.randomUUID();

      return { keyName, data, hash };
    });

    const computed = await Promise.all(computePromises);

    const redisEntries: Array<{ key: string; value: unknown }> = [];

    for (const { keyName, data, hash } of computed) {
      Object.assign(result, { [keyName]: data });

      const baseKey = this.buildCacheKey(workspaceId, keyName);

      redisEntries.push({ key: `${baseKey}:hash`, value: hash });

      if (!this.localDataOnlyKeys.has(keyName)) {
        redisEntries.push({ key: `${baseKey}:data`, value: data });
      }

      this.setInLocalCache(workspaceId, keyName, data, hash);
    }

    if (redisEntries.length > 0) {
      await this.cacheStorage.mset(redisEntries);
    }

    return result;
  }

  private getFromLocalCache(
    workspaceId: string,
    workspaceCacheKeyNames: WorkspaceCacheKeyName[],
  ): Partial<WorkspaceCacheDataMap> {
    const result: Partial<WorkspaceCacheDataMap> = {};

    for (const keyName of workspaceCacheKeyNames) {
      const localKey = this.buildCacheKey(workspaceId, keyName);
      const entry = this.localCache.get(localKey);
      const version = entry?.versions.get(entry.latestHash);

      if (isDefined(entry) && isDefined(version)) {
        version.lastReadAt = Date.now();
        Object.assign(result, { [keyName]: version.data });
        this.cleanupStaleVersions(entry);
      }
    }

    return result;
  }

  private deleteFromLocalCache(
    workspaceId: string,
    cacheKeyNames: WorkspaceCacheKeyName[],
  ): void {
    for (const keyName of cacheKeyNames) {
      const localKey = this.buildCacheKey(workspaceId, keyName);
      const entry = this.localCache.get(localKey);

      if (isDefined(entry)) {
        entry.lastHashCheckedAt = 0;
      }
    }
  }

  private async deleteFromRedis(
    workspaceId: string,
    cacheKeyNames: WorkspaceCacheKeyName[],
  ): Promise<void> {
    const keysToDelete = cacheKeyNames.flatMap((keyName) => {
      const baseKey = this.buildCacheKey(workspaceId, keyName);

      return [`${baseKey}:data`, `${baseKey}:hash`];
    });

    await this.cacheStorage.mdel(keysToDelete);
  }

  private setInLocalCache(
    workspaceId: string,
    keyName: WorkspaceCacheKeyName,
    data: CacheDataType,
    hash: string,
  ): void {
    const localKey = this.buildCacheKey(workspaceId, keyName);
    let entry = this.localCache.get(localKey);

    if (!isDefined(entry)) {
      entry = { versions: new Map(), latestHash: '', lastHashCheckedAt: 0 };
      this.localCache.set(localKey, entry);
    }

    entry.versions.set(hash, { data, lastReadAt: Date.now() });
    entry.latestHash = hash;
    entry.lastHashCheckedAt = Date.now();
  }

  private cleanupStaleVersions(
    entry: WorkspaceLocalCacheEntry<CacheDataType>,
  ): void {
    const now = Date.now();

    for (const [hash, version] of entry.versions) {
      if (
        hash !== entry.latestHash &&
        now - version.lastReadAt > STALE_VERSION_TTL_MS
      ) {
        entry.versions.delete(hash);
      }
    }

    if (entry.versions.size >= MAX_LOCAL_STALE_VERSIONS) {
      const sorted = [...entry.versions.entries()]
        .filter(([hash]) => hash !== entry.latestHash)
        .sort((entryA, entryB) => entryA[1].lastReadAt - entryB[1].lastReadAt);

      while (
        entry.versions.size >= MAX_LOCAL_STALE_VERSIONS &&
        sorted.length > 0
      ) {
        const oldestEntry = sorted.shift();

        if (isDefined(oldestEntry)) {
          entry.versions.delete(oldestEntry[0]);
        }
      }
    }
  }

  private evictExpiredLocalEntries(): void {
    const now = Date.now();

    for (const [localKey, entry] of this.localCache) {
      for (const [hash, version] of entry.versions) {
        if (now - version.lastReadAt > LOCAL_ENTRY_TTL_MS) {
          entry.versions.delete(hash);
        }
      }

      if (entry.versions.size === 0) {
        this.localCache.delete(localKey);
        continue;
      }

      if (!entry.versions.has(entry.latestHash)) {
        // Latest was evicted; drop the entire entry to avoid serving stale data.
        this.localCache.delete(localKey);
      }
    }
  }

  private getProviderOrThrow(
    keyName: WorkspaceCacheKeyName,
  ): WorkspaceCacheProvider<CacheDataType> {
    const provider = this.workspaceCacheProviders.get(keyName);

    if (!isDefined(provider)) {
      throw new Error(`Cache provider with key name "${keyName}" not found`);
    }

    return provider;
  }

  private buildCacheKey(
    workspaceId: string,
    keyName: WorkspaceCacheKeyName,
  ): string {
    return `${WORKSPACE_CACHE_KEYS_V2[keyName]}:${workspaceId}`;
  }
}
