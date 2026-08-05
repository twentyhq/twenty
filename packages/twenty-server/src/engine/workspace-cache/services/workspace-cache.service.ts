import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { DiscoveryService, Reflector } from '@nestjs/core';

import * as Sentry from '@sentry/node';
import crypto from 'crypto';

import { isDefined, isValidUuid } from 'twenty-shared/utils';

import { WorkspaceCacheProvider } from 'src/engine/workspace-cache/interfaces/workspace-cache-provider.service';

import { InjectCacheStorage } from 'src/engine/core-modules/cache-storage/decorators/cache-storage.decorator';
import { CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { PromiseMemoizer } from 'src/engine/twenty-orm/storage/promise-memoizer.storage';
import { WorkspaceCacheMetricsService } from 'src/engine/workspace-cache/services/workspace-cache-metrics.service';
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
  type WorkspaceCacheResultWithHashes,
} from 'src/engine/workspace-cache/types/workspace-cache-key.type';
import { type WorkspaceLocalCacheEntry } from 'src/engine/workspace-cache/types/workspace-local-cache-entry.type';
import { combineCacheHashes } from 'src/engine/workspace-cache/utils/combine-cache-hashes.util';

const LOCAL_TTL_MS = 100; // 100ms
const MEMOIZER_TTL_MS = 10_000; // 10 seconds
const STALE_VERSION_TTL_MS = 5_000; // 5 seconds
const MAX_LOCAL_STALE_VERSIONS = 5; // 5 stale versions
// Sized against 4 GiB pods (--max-old-space-size=3500): 7,500 sat at the heap ceiling.
const MAX_LOCAL_CACHE_ENTRIES = 6_000;
const MIN_EVICT_KEYS = 100;
// ORM graphs are ~5 MB, so cap residency rather than pin gigabytes across many workspaces.
const LOCAL_ENTRY_COUNT_OVERRIDES: {
  keyName: WorkspaceCacheKeyName;
  maxEntries: number;
}[] = [{ keyName: 'ORMEntityMetadatas', maxEntries: 128 }];
const LOCAL_ENTRY_COUNT_BY_PREFIX = new Map<string, number>(
  LOCAL_ENTRY_COUNT_OVERRIDES.map(({ keyName, maxEntries }) => [
    WORKSPACE_CACHE_KEYS_V2[keyName],
    maxEntries,
  ]),
);
const LOCAL_ENTRY_TTL_MS = 30 * 60 * 1000; // 30 minutes idle
const LOCAL_CACHE_EXPIRATION_SWEEP_INTERVAL_MS = 60 * 1000;
type CacheDataType = WorkspaceCacheDataMap[WorkspaceCacheKeyName];

type CacheEntriesResult = {
  data: Partial<WorkspaceCacheDataMap>;
  hashes: Partial<Record<WorkspaceCacheKeyName, string>>;
};

type RecomputeHashResolution =
  | { strategy: 'mint' }
  | {
      strategy: 'recover';
      adoptableHashes: Partial<Record<WorkspaceCacheKeyName, string>>;
    };

@Injectable()
export class WorkspaceCacheService implements OnModuleInit, OnModuleDestroy {
  private readonly localCache = new Map<
    string,
    WorkspaceLocalCacheEntry<CacheDataType>
  >();
  private lastLocalCacheExpirationSweepAt: number | undefined;
  private readonly workspaceCacheProviders = new Map<
    WorkspaceCacheKeyName,
    WorkspaceCacheProvider<CacheDataType>
  >();
  private readonly localDataOnlyKeys = new Set<WorkspaceCacheKeyName>();
  private readonly memoizer = new PromiseMemoizer<CacheEntriesResult>(
    MEMOIZER_TTL_MS,
  );

  private readonly logger = new Logger(WorkspaceCacheService.name);

  constructor(
    @InjectCacheStorage(CacheStorageNamespace.EngineWorkspace)
    private readonly cacheStorage: CacheStorageService,
    private readonly discoveryService: DiscoveryService,
    private readonly reflector: Reflector,
    private readonly cacheMetricsService: WorkspaceCacheMetricsService,
    private readonly twentyConfigService: TwentyConfigService,
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

    this.cacheMetricsService.start(this.localCache);
  }

  onModuleDestroy(): void {
    this.cacheMetricsService.stop();
  }

  public async getOrRecompute<const K extends WorkspaceCacheKeyName[]>(
    workspaceId: string,
    cacheKeyNames: K,
  ): Promise<WorkspaceCacheResult<K>> {
    const { data } = await this.getOrRecomputeWithHashes(
      workspaceId,
      cacheKeyNames,
    );

    return data;
  }

  public async getOrRecomputeWithHashes<
    const K extends WorkspaceCacheKeyName[],
  >(
    workspaceId: string,
    cacheKeyNames: K,
  ): Promise<WorkspaceCacheResultWithHashes<K>> {
    this.evictExpiredAndOverBudgetLocalEntriesIfNeeded();
    this.assertValidCacheParameters(workspaceId, cacheKeyNames);

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
        const freshEntries = this.getFromLocalCache(workspaceId, freshKeys);

        if (staleKeys.length === 0) {
          return freshEntries;
        }

        // Stage 2: Validate ttl stale keys against Redis hash
        const {
          validKeys,
          keysNeedingDataFromRedis,
          keysNeedingRecompute,
          adoptableHashes,
        } = await this.validateLocalHashAgainstRedisHash(
          workspaceId,
          staleKeys,
        );
        const validatedEntries = this.getFromLocalCache(workspaceId, validKeys);

        // Stage 3: Fetch data from Redis
        const { redisEntries, missingInRedis } = await this.fetchDataFromRedis(
          workspaceId,
          keysNeedingDataFromRedis,
        );

        // Stage 4: Recompute remaining
        const keysToRecompute = [...keysNeedingRecompute, ...missingInRedis];
        const recomputedEntries = await this.recomputeDataFromProvider(
          workspaceId,
          keysToRecompute,
          { strategy: 'recover', adoptableHashes },
        );

        return {
          data: {
            ...freshEntries.data,
            ...validatedEntries.data,
            ...redisEntries.data,
            ...recomputedEntries.data,
          },
          hashes: {
            ...freshEntries.hashes,
            ...validatedEntries.hashes,
            ...redisEntries.hashes,
            ...recomputedEntries.hashes,
          },
        };
      },
    );

    return result as WorkspaceCacheResultWithHashes<K>;
  }

  public async getOrRecomputeCombinedHash(
    workspaceId: string,
    cacheKeyNames: WorkspaceCacheKeyName[],
  ): Promise<string> {
    this.assertValidCacheParameters(workspaceId, cacheKeyNames);

    const cachedHashes = await this.getCacheHashes(workspaceId, cacheKeyNames);
    const missingKeys = cacheKeyNames.filter(
      (cacheKeyName) => !isDefined(cachedHashes[cacheKeyName]),
    );

    if (missingKeys.length === 0) {
      return combineCacheHashes(cachedHashes, cacheKeyNames);
    }

    const { hashes: recomputedHashes } = await this.getOrRecomputeWithHashes(
      workspaceId,
      missingKeys,
    );

    return combineCacheHashes(
      { ...cachedHashes, ...recomputedHashes },
      cacheKeyNames,
    );
  }

  public async invalidateAndRecompute(
    workspaceId: string,
    cacheKeyNames: WorkspaceCacheKeyName[],
  ): Promise<void> {
    return Sentry.startSpan(
      {
        name: 'invalidate and recompute workspace metadata cache',
        op: 'cache.invalidate',
        onlyIfParent: true,
        attributes: { 'cache.key_count': cacheKeyNames.length },
      },
      async () => {
        await this.memoizer.clearKeys(`${workspaceId}-`);

        await this.flush(workspaceId, cacheKeyNames);
        await this.recomputeDataFromProvider(workspaceId, cacheKeyNames, {
          strategy: 'mint',
        });

        // Clear memoizer again after recomputation to evict any stale entries
        // cached by concurrent getOrRecompute calls during the flush window.
        await this.memoizer.clearKeys(`${workspaceId}-`);
      },
    );
  }

  public async getCacheHashes(
    workspaceId: string,
    cacheKeyNames: WorkspaceCacheKeyName[],
  ): Promise<Partial<Record<WorkspaceCacheKeyName, string>>> {
    if (cacheKeyNames.length === 0) {
      return {};
    }

    const hashKeys = cacheKeyNames.map(
      (keyName) => `${this.buildCacheKey(workspaceId, keyName)}:hash`,
    );

    const hashes = await this.cacheStorage.mget<string>(hashKeys);

    const result: Partial<Record<WorkspaceCacheKeyName, string>> = {};

    for (const [index, keyName] of cacheKeyNames.entries()) {
      if (isDefined(hashes[index])) {
        result[keyName] = hashes[index];
      }
    }

    return result;
  }

  public async flush(
    workspaceId: string,
    cacheKeyNames: WorkspaceCacheKeyName[],
  ): Promise<void> {
    await this.deleteFromRedis(workspaceId, cacheKeyNames);

    this.deleteFromLocalCache(workspaceId, cacheKeyNames);
  }

  private assertValidCacheParameters(
    workspaceId: string,
    cacheKeyNames: WorkspaceCacheKeyName[],
  ): void {
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
    adoptableHashes: Partial<Record<WorkspaceCacheKeyName, string>>;
  }> {
    const validKeys: WorkspaceCacheKeyName[] = [];
    const keysNeedingDataFromRedis: WorkspaceCacheKeyName[] = [];
    const keysNeedingRecompute: WorkspaceCacheKeyName[] = [];
    const adoptableHashes: Partial<Record<WorkspaceCacheKeyName, string>> = {};

    if (cacheKeyNames.length === 0) {
      return {
        validKeys,
        keysNeedingDataFromRedis,
        keysNeedingRecompute,
        adoptableHashes,
      };
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

        if (isDefined(redisHash)) {
          adoptableHashes[keyName] = redisHash;
        }
      } else {
        keysNeedingDataFromRedis.push(keyName);
      }
    }

    return {
      validKeys,
      keysNeedingDataFromRedis,
      keysNeedingRecompute,
      adoptableHashes,
    };
  }

  private async fetchDataFromRedis(
    workspaceId: string,
    cacheKeyNames: WorkspaceCacheKeyName[],
  ): Promise<{
    redisEntries: CacheEntriesResult;
    missingInRedis: WorkspaceCacheKeyName[];
  }> {
    const redisEntries: CacheEntriesResult = { data: {}, hashes: {} };
    const missingInRedis: WorkspaceCacheKeyName[] = [];

    if (cacheKeyNames.length === 0) {
      return { redisEntries, missingInRedis };
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
        Object.assign(redisEntries.data, { [keyName]: data });
        redisEntries.hashes[keyName] = hash;
        this.setInLocalCache(workspaceId, keyName, data, hash);
      } else {
        missingInRedis.push(keyName);
      }
    }

    return { redisEntries, missingInRedis };
  }

  private async recomputeDataFromProvider(
    workspaceId: string,
    cacheKeyNames: WorkspaceCacheKeyName[],
    hashResolution: RecomputeHashResolution,
  ): Promise<CacheEntriesResult> {
    const result: CacheEntriesResult = { data: {}, hashes: {} };

    if (cacheKeyNames.length === 0) {
      return result;
    }

    const computePromises = cacheKeyNames.map(async (keyName) => {
      const provider = this.getProviderOrThrow(keyName);
      const isLocalDataOnly = this.localDataOnlyKeys.has(keyName);
      const computeStartedAt = performance.now();

      try {
        const data = await Sentry.startSpan(
          {
            name: 'compute workspace metadata cache entry from provider',
            op: 'cache.recompute',
            onlyIfParent: true,
            attributes: {
              'cache.key_name': keyName,
              'cache.recompute.strategy': hashResolution.strategy,
              'cache.local_data_only': isLocalDataOnly,
            },
          },
          () => provider.computeForCache(workspaceId),
        );

        if (hashResolution.strategy === 'mint') {
          return { keyName, data, hash: crypto.randomUUID(), isAdopted: false };
        }

        const adoptableHash = hashResolution.adoptableHashes[keyName];

        return {
          keyName,
          data,
          hash: adoptableHash ?? crypto.randomUUID(),
          isAdopted: isDefined(adoptableHash),
        };
      } finally {
        this.cacheMetricsService.recordRecompute(
          (performance.now() - computeStartedAt) / 1000,
          keyName,
        );
      }
    });

    const computed = await Promise.all(computePromises);

    const redisEntries: Array<{ key: string; value: unknown }> = [];
    const bootstrapHashEntries: Array<{ key: string; value: string }> = [];

    for (const { keyName, data, hash, isAdopted } of computed) {
      Object.assign(result.data, { [keyName]: data });
      result.hashes[keyName] = hash;

      const baseKey = this.buildCacheKey(workspaceId, keyName);
      const isLocalDataOnly = this.localDataOnlyKeys.has(keyName);
      const isRecoveryBootstrap =
        hashResolution.strategy === 'recover' && !isAdopted && isLocalDataOnly;

      if (isRecoveryBootstrap) {
        bootstrapHashEntries.push({ key: `${baseKey}:hash`, value: hash });
      } else if (!isAdopted) {
        redisEntries.push({ key: `${baseKey}:hash`, value: hash });
      }

      if (!isLocalDataOnly) {
        redisEntries.push({ key: `${baseKey}:data`, value: data });
      }

      this.setInLocalCache(workspaceId, keyName, data, hash);
    }

    if (redisEntries.length > 0) {
      const redisWriteStartedAt = performance.now();

      try {
        await this.cacheStorage.mset(redisEntries);
      } finally {
        this.cacheMetricsService.recordRedisWrite(
          (performance.now() - redisWriteStartedAt) / 1000,
        );
      }
    }

    if (bootstrapHashEntries.length > 0) {
      const bootstrapHashTtlMs =
        this.twentyConfigService.get('CACHE_STORAGE_TTL') * 1000;

      await Promise.all(
        bootstrapHashEntries.map(({ key, value }) =>
          this.cacheStorage.setIfAbsent(key, value, bootstrapHashTtlMs),
        ),
      );
    }

    return result;
  }

  private getFromLocalCache(
    workspaceId: string,
    workspaceCacheKeyNames: WorkspaceCacheKeyName[],
  ): CacheEntriesResult {
    const result: CacheEntriesResult = { data: {}, hashes: {} };

    for (const keyName of workspaceCacheKeyNames) {
      const localKey = this.buildCacheKey(workspaceId, keyName);
      const entry = this.localCache.get(localKey);
      const version = entry?.versions.get(entry.latestHash);

      if (isDefined(entry) && isDefined(version)) {
        version.lastReadAt = Date.now();
        Object.assign(result.data, { [keyName]: version.data });
        result.hashes[keyName] = entry.latestHash;
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

    this.cleanupStaleVersions(entry);
    this.evictOverGlobalCapIfNeeded();
  }

  private entryLastReadAt(
    entry: WorkspaceLocalCacheEntry<CacheDataType>,
  ): number {
    return entry.versions.get(entry.latestHash)?.lastReadAt ?? 0;
  }

  // Hard total ceiling, enforced on every write; per-provider caps and idle expiry run in the sweep.
  private evictOverGlobalCapIfNeeded(): void {
    if (this.localCache.size <= MAX_LOCAL_CACHE_ENTRIES) {
      return;
    }

    this.evictLeastRecentlyRead(
      () => true,
      MAX_LOCAL_CACHE_ENTRIES,
      MIN_EVICT_KEYS,
    );
  }

  // Throttled periodic sweep: expire versions idle past the TTL (dropping any entry left without a
  // current version), then trim each provider back to its per-provider entry cap.
  private evictExpiredAndOverBudgetLocalEntriesIfNeeded(): void {
    const now = Date.now();

    if (
      isDefined(this.lastLocalCacheExpirationSweepAt) &&
      now - this.lastLocalCacheExpirationSweepAt <
        LOCAL_CACHE_EXPIRATION_SWEEP_INTERVAL_MS
    ) {
      return;
    }

    this.evictExpiredAndOverBudgetLocalEntries(now);
    this.lastLocalCacheExpirationSweepAt = now;
  }

  private evictExpiredAndOverBudgetLocalEntries(now: number): void {
    const survivorsByProvider = new Map<
      string,
      [string, WorkspaceLocalCacheEntry<CacheDataType>][]
    >();
    let evicted = 0;

    for (const [localKey, entry] of this.localCache) {
      for (const [hash, version] of entry.versions) {
        if (now - version.lastReadAt > LOCAL_ENTRY_TTL_MS) {
          entry.versions.delete(hash);
        }
      }

      if (entry.versions.size === 0 || !entry.versions.has(entry.latestHash)) {
        this.localCache.delete(localKey);
        evicted += 1;
        continue;
      }

      const prefix = localKey.slice(0, localKey.lastIndexOf(':'));
      const survivors = survivorsByProvider.get(prefix) ?? [];

      survivors.push([localKey, entry]);
      survivorsByProvider.set(prefix, survivors);
    }

    for (const [prefix, survivors] of survivorsByProvider) {
      const cap = LOCAL_ENTRY_COUNT_BY_PREFIX.get(prefix);

      if (!isDefined(cap) || survivors.length <= cap) {
        continue;
      }

      survivors.sort(
        (a, b) => this.entryLastReadAt(a[1]) - this.entryLastReadAt(b[1]),
      );

      const overflow = survivors.length - cap;

      for (let index = 0; index < overflow; index += 1) {
        this.localCache.delete(survivors[index][0]);
        evicted += 1;
      }
    }

    if (evicted > 0) {
      this.cacheMetricsService.recordEviction(evicted);
    }
  }

  private evictLeastRecentlyRead(
    matches: (key: string) => boolean,
    maxEntries: number,
    minEvict = 0,
  ): void {
    const matching: [string, WorkspaceLocalCacheEntry<CacheDataType>][] = [];

    for (const keyEntry of this.localCache) {
      if (matches(keyEntry[0])) {
        matching.push(keyEntry);
      }
    }

    if (matching.length <= maxEntries) {
      return;
    }

    matching.sort(
      (a, b) => this.entryLastReadAt(a[1]) - this.entryLastReadAt(b[1]),
    );

    const evictCount = Math.min(
      matching.length,
      Math.max(minEvict, matching.length - maxEntries),
    );

    for (let index = 0; index < evictCount; index += 1) {
      this.localCache.delete(matching[index][0]);
    }

    this.cacheMetricsService.recordEviction(evictCount);
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
