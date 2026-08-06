import { Injectable, Logger } from '@nestjs/common';

import { type Histogram } from '@opentelemetry/api';

import { isDefined } from 'twenty-shared/utils';

import { MetricsService } from 'src/engine/core-modules/metrics/metrics.service';
import { MetricsKeys } from 'src/engine/core-modules/metrics/types/metrics-keys.type';
import {
  type WorkspaceCacheDataMap,
  type WorkspaceCacheKeyName,
} from 'src/engine/workspace-cache/types/workspace-cache-key.type';
import { type WorkspaceLocalCacheEntry } from 'src/engine/workspace-cache/types/workspace-local-cache-entry.type';
import {
  type LocalCacheStats,
  computeLocalCacheStats,
} from 'src/engine/workspace-cache/utils/compute-local-cache-stats.util';
import { deepSizeBytes } from 'src/engine/workspace-cache/utils/deep-size-bytes.util';

type LocalCache = ReadonlyMap<
  string,
  WorkspaceLocalCacheEntry<WorkspaceCacheDataMap[WorkspaceCacheKeyName]>
>;

const CACHE_DURATION_BUCKETS_SECONDS = [
  0.001, 0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10,
];
const STATS_TTL_MS = 5_000;
const SIZE_REFRESH_MS = 5 * 60 * 1000;
const SIZE_STARTUP_DELAY_MS = 30 * 1000;
const SIZE_SAMPLE_PER_PROVIDER = 3;
const SIZE_WALK_NODE_CAP = 300_000;

// Cache observability, split from WorkspaceCacheService (which drives it via start()/stop()).
@Injectable()
export class WorkspaceCacheMetricsService {
  private readonly logger = new Logger(WorkspaceCacheMetricsService.name);
  private readonly recomputeDurationHistogram: Histogram;
  private readonly redisWriteDurationHistogram: Histogram;

  private localCache?: LocalCache;
  private cacheSizeByProvider: Record<string, number> = {};
  private cacheSizeTotalBytes = 0;
  private sizeSampler?: ReturnType<typeof setInterval>;
  private sizeStartupTimer?: ReturnType<typeof setTimeout>;
  private statsCache?: { computedAt: number } & LocalCacheStats;
  private sizeSampleInFlight = false;

  constructor(private readonly metricsService: MetricsService) {
    const meter = this.metricsService.getMeter();

    this.recomputeDurationHistogram = meter.createHistogram(
      'twenty_workspace_cache_recompute_duration_seconds',
      {
        description:
          'Wall-clock time to compute one workspace metadata cache entry from its provider',
        unit: 's',
        advice: { explicitBucketBoundaries: CACHE_DURATION_BUCKETS_SECONDS },
      },
    );
    this.redisWriteDurationHistogram = meter.createHistogram(
      'twenty_workspace_cache_redis_write_duration_seconds',
      {
        description:
          'Wall-clock time to serialize and write recomputed cache entries to Redis',
        unit: 's',
        advice: { explicitBucketBoundaries: CACHE_DURATION_BUCKETS_SECONDS },
      },
    );
  }

  start(localCache: LocalCache): void {
    this.localCache = localCache;
    this.registerGauges();
    this.scheduleSizeSampler();
  }

  stop(): void {
    if (isDefined(this.sizeStartupTimer)) {
      clearTimeout(this.sizeStartupTimer);
    }
    if (isDefined(this.sizeSampler)) {
      clearInterval(this.sizeSampler);
    }
  }

  recordRecompute(seconds: number, cacheKey: WorkspaceCacheKeyName): void {
    this.recomputeDurationHistogram.record(seconds, { cache_key: cacheKey });
  }

  recordRedisWrite(seconds: number): void {
    this.redisWriteDurationHistogram.record(seconds);
  }

  recordEviction(amount: number): void {
    this.metricsService.incrementCounterBy({
      key: MetricsKeys.WorkspaceMetadataCacheLocalEviction,
      amount,
    });
  }

  private getStats(): LocalCacheStats {
    const now = Date.now();

    if (
      isDefined(this.statsCache) &&
      now - this.statsCache.computedAt < STATS_TTL_MS
    ) {
      return this.statsCache;
    }

    const stats = computeLocalCacheStats(this.localCache ?? new Map());

    this.statsCache = { computedAt: now, ...stats };

    return this.statsCache;
  }

  private scheduleSizeSampler(): void {
    const sample = (): void => {
      if (this.sizeSampleInFlight) {
        return;
      }

      this.sizeSampleInFlight = true;
      this.refreshSizeBreakdown()
        .catch((error) =>
          this.logger.error('Failed to sample local cache size', error),
        )
        .finally(() => {
          this.sizeSampleInFlight = false;
        });
    };

    // Prime once after startup so the gauges aren't 0 until the first 5-minute interval.
    this.sizeStartupTimer = setTimeout(sample, SIZE_STARTUP_DELAY_MS);
    this.sizeStartupTimer.unref();

    this.sizeSampler = setInterval(sample, SIZE_REFRESH_MS);
    this.sizeSampler.unref();
  }

  private async refreshSizeBreakdown(): Promise<void> {
    const localCache = this.localCache;

    if (!isDefined(localCache)) {
      return;
    }

    const perProvider: Record<
      string,
      { count: number; sampledBytes: number; sampled: number }
    > = {};

    for (const [key, entry] of localCache) {
      const provider = key.slice(0, key.lastIndexOf(':'));
      const stats = (perProvider[provider] ??= {
        count: 0,
        sampledBytes: 0,
        sampled: 0,
      });

      stats.count += 1;

      if (stats.sampled < SIZE_SAMPLE_PER_PROVIDER && entry.versions.size > 0) {
        // Size every retained version, not just the latest — stale versions still occupy heap.
        let entryBytes = 0;

        for (const version of entry.versions.values()) {
          // A cold version reports its exact serialized length; only a live object graph needs
          // the sampled walk, whose byte model is an upper bound.
          entryBytes +=
            version.state === 'cold'
              ? version.blob.byteLength
              : deepSizeBytes(version.data, SIZE_WALK_NODE_CAP);
        }

        stats.sampledBytes += entryBytes;
        stats.sampled += 1;
        await new Promise((resolve) => setImmediate(resolve));
      }
    }

    const byProvider: Record<string, number> = {};
    let total = 0;

    for (const [provider, stats] of Object.entries(perProvider)) {
      const estimate =
        stats.sampled === 0
          ? 0
          : Math.round((stats.sampledBytes / stats.sampled) * stats.count);

      byProvider[provider] = estimate;
      total += estimate;
    }

    this.cacheSizeByProvider = byProvider;
    this.cacheSizeTotalBytes = total;
  }

  private registerGauges(): void {
    this.metricsService.createObservableGauge({
      metricName: 'twenty_workspace_cache_local_entries',
      options: {
        description: 'Entries in the per-pod local workspace metadata cache',
      },
      callback: async () => this.getStats().entries,
    });
    this.metricsService.createObservableGauge({
      metricName: 'twenty_workspace_cache_local_workspaces',
      options: {
        description:
          'Distinct workspaces held in the per-pod local workspace metadata cache',
      },
      callback: async () => this.getStats().workspaces,
    });
    this.metricsService.createObservableGauge({
      metricName: 'twenty_workspace_cache_local_versions_total',
      options: {
        description:
          'Total versions across local workspace metadata cache entries',
      },
      callback: async () => this.getStats().versionsTotal,
    });
    this.metricsService.createObservableGauge({
      metricName: 'twenty_workspace_cache_local_bytes_estimate',
      options: {
        description:
          'Estimated retained bytes (deep-size, includes local-only providers) in the local workspace metadata cache',
        unit: 'By',
      },
      callback: async () => this.cacheSizeTotalBytes,
    });
    this.metricsService.createMultiObservableGauge({
      metricName: 'twenty_workspace_cache_local_entries_by_version_count',
      options: {
        description:
          'Local workspace metadata cache entries bucketed by version count',
      },
      callback: async () =>
        Object.entries(this.getStats().versionsByCount).map(
          ([versions, value]) => ({ value, attributes: { versions } }),
        ),
    });
    this.metricsService.createMultiObservableGauge({
      metricName: 'twenty_workspace_cache_local_bytes_by_provider',
      options: {
        description:
          'Estimated retained bytes in the local workspace metadata cache per provider',
        unit: 'By',
      },
      callback: async () =>
        Object.entries(this.cacheSizeByProvider).map(([provider, value]) => ({
          value,
          attributes: { provider },
        })),
    });
  }
}
