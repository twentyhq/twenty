import { Injectable, Logger, type OnModuleInit } from '@nestjs/common';
import { isDefined } from 'twenty-shared/utils';

import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { artificialAnalysisSnapshotSchema } from 'src/engine/metadata-modules/ai/ai-models/types/artificial-analysis-snapshot.schema';
import { type ArtificialAnalysisModel } from 'src/engine/metadata-modules/ai/ai-models/types/artificial-analysis-response.schema';

const REFRESH_INTERVAL_MS = 24 * 60 * 60 * 1000;
const RETRY_DELAY_MS = 60 * 60 * 1000;
const MAXIMUM_STALE_AGE_MS = 7 * REFRESH_INTERVAL_MS;
const REQUEST_TIMEOUT_MS = 5_000;

export type ArtificialAnalysisCatalog = {
  models: ArtificialAnalysisModel[];
  intelligenceIndexVersion: number;
  fetchedAt: string;
};

@Injectable()
export class ArtificialAnalysisCatalogService implements OnModuleInit {
  private readonly logger = new Logger(ArtificialAnalysisCatalogService.name);
  private catalog: ArtificialAnalysisCatalog | undefined;
  private sourceUrl: string | undefined;
  private nextRefreshAt = 0;
  private pendingRefresh: Promise<void> | undefined;

  constructor(private readonly twentyConfigService: TwentyConfigService) {}

  onModuleInit(): void {
    void this.getCatalog();
  }

  async getCatalog(): Promise<ArtificialAnalysisCatalog | undefined> {
    const sourceUrl = this.twentyConfigService.get(
      'AI_BENCHMARKS_SNAPSHOT_URL',
    );
    const enabled = this.twentyConfigService.get('AI_BENCHMARKS_ENABLED');

    if (sourceUrl !== this.sourceUrl || !enabled) {
      this.catalog = undefined;
      this.nextRefreshAt = 0;
      this.sourceUrl = enabled ? sourceUrl : undefined;
    }

    if (!enabled || !sourceUrl) {
      return undefined;
    }

    if (!this.pendingRefresh && Date.now() >= this.nextRefreshAt) {
      // Snapshot availability must never delay client-config or application startup.
      this.pendingRefresh = this.refreshCatalog(sourceUrl).finally(() => {
        this.pendingRefresh = undefined;
      });
    }

    return isDefined(this.catalog) &&
      Date.now() - Date.parse(this.catalog.fetchedAt) < MAXIMUM_STALE_AGE_MS
      ? this.catalog
      : undefined;
  }

  private async refreshCatalog(sourceUrl: string): Promise<void> {
    try {
      const response = await fetch(sourceUrl, {
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
        redirect: 'error',
      });

      if (!response.ok) {
        throw new Error('Snapshot request failed');
      }

      const snapshot = artificialAnalysisSnapshotSchema.parse(
        await response.json(),
      );
      const age = Date.now() - Date.parse(snapshot.fetchedAt);

      if (age < 0 || age >= MAXIMUM_STALE_AGE_MS) {
        throw new Error('Snapshot timestamp is outside the supported window');
      }

      if (this.isCurrentSource(sourceUrl)) {
        this.catalog = snapshot;
        this.nextRefreshAt = Date.now() + REFRESH_INTERVAL_MS;
      }
    } catch {
      if (this.isCurrentSource(sourceUrl)) {
        this.nextRefreshAt = Date.now() + RETRY_DELAY_MS;
      }
      this.logger.warn(
        'Benchmark snapshot unavailable; retaining the last valid snapshot',
      );
    }
  }

  private isCurrentSource(sourceUrl: string): boolean {
    return (
      this.sourceUrl === sourceUrl &&
      this.twentyConfigService.get('AI_BENCHMARKS_SNAPSHOT_URL') ===
        sourceUrl &&
      this.twentyConfigService.get('AI_BENCHMARKS_ENABLED')
    );
  }
}
