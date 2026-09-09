import { Injectable, Logger } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { isNonEmptyString } from '@sniptt/guards';

import { isDefined } from 'twenty-shared/utils';

import { InjectCacheStorage } from 'src/engine/core-modules/cache-storage/decorators/cache-storage.decorator';
import { CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import { NodeEnvironment } from 'src/engine/core-modules/twenty-config/interfaces/node-environment.interface';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { WRITE_BENCHMARK_CACHE_SCRIPT } from 'src/engine/metadata-modules/ai/ai-models/constants/write-benchmark-cache.script';
import {
  artificialAnalysisResponseSchema,
  type ArtificialAnalysisModel,
} from 'src/engine/metadata-modules/ai/ai-models/types/artificial-analysis-response.schema';

const REFRESH_INTERVAL_MS = 24 * 60 * 60 * 1000;
const RETRY_DELAY_MS = 60 * 60 * 1000;
const MAXIMUM_STALE_AGE_MS = 7 * REFRESH_INTERVAL_MS;
const MAXIMUM_PAGES = 10;
const MAXIMUM_REQUESTS_PER_WINDOW = 30;
const REQUEST_TIMEOUT_MS = 5_000;
const REFRESH_TIMEOUT_MS = MAXIMUM_PAGES * REQUEST_TIMEOUT_MS + 5_000;
const REFRESH_LOCK_TTL_MS = 60_000;
const CATALOG_KEY = 'catalog';
const REFRESH_STATE_KEY = 'refresh-state';
const REFRESH_LOCK_KEY = 'refresh-lock';

export type ArtificialAnalysisCatalog = {
  models: ArtificialAnalysisModel[];
  intelligenceIndexVersion: number;
  fetchedAt: string;
};

type RefreshState = {
  nextRefreshAt: number;
  consecutiveFailures: number;
  windowResetAt: number;
  requestsUsed: number;
  remainingRequests?: number;
};

@Injectable()
export class ArtificialAnalysisCatalogService {
  private readonly logger = new Logger(ArtificialAnalysisCatalogService.name);

  constructor(
    private readonly twentyConfigService: TwentyConfigService,
    @InjectCacheStorage(CacheStorageNamespace.EngineAiModelBenchmarks)
    private readonly cacheStorageService: CacheStorageService,
  ) {}

  isSyncEnabled(): boolean {
    return (
      isNonEmptyString(
        this.twentyConfigService.get('ARTIFICIAL_ANALYSIS_API_KEY'),
      ) &&
      (this.twentyConfigService.get('ARTIFICIAL_ANALYSIS_SYNC_ENABLED') ??
        this.twentyConfigService.get('NODE_ENV') === NodeEnvironment.PRODUCTION)
    );
  }

  async getCatalog(): Promise<ArtificialAnalysisCatalog | undefined> {
    if (
      !isNonEmptyString(
        this.twentyConfigService.get('ARTIFICIAL_ANALYSIS_API_KEY'),
      )
    ) {
      return undefined;
    }

    try {
      const catalog =
        await this.cacheStorageService.get<ArtificialAnalysisCatalog>(
          CATALOG_KEY,
        );

      return isDefined(catalog) &&
        Date.now() - Date.parse(catalog.fetchedAt) < MAXIMUM_STALE_AGE_MS
        ? catalog
        : undefined;
    } catch {
      this.logger.warn('Artificial Analysis cache is unavailable');

      return undefined;
    }
  }

  async refreshCatalog(): Promise<void> {
    const apiKey = this.twentyConfigService.get('ARTIFICIAL_ANALYSIS_API_KEY');

    if (!isNonEmptyString(apiKey) || !this.isSyncEnabled()) {
      return;
    }

    try {
      const signal = AbortSignal.timeout(REFRESH_TIMEOUT_MS);
      const owner = randomUUID();

      // Let the lease expire rather than risk releasing a newer worker's lock.
      // Its lifetime exceeds the total external request timeout.
      const acquired = await this.cacheStorageService.setIfAbsent(
        REFRESH_LOCK_KEY,
        owner,
        REFRESH_LOCK_TTL_MS,
      );

      if (!acquired) {
        return;
      }

      const state = (await this.cacheStorageService.get<RefreshState>(
        REFRESH_STATE_KEY,
      )) ?? {
        nextRefreshAt: 0,
        consecutiveFailures: 0,
        windowResetAt: 0,
        requestsUsed: 0,
      };
      const catalog = await this.getCatalog();

      if (
        Date.now() < state.nextRefreshAt ||
        (isDefined(catalog) &&
          Date.now() - Date.parse(catalog.fetchedAt) < REFRESH_INTERVAL_MS)
      ) {
        return;
      }

      signal.throwIfAborted();
      await this.refresh(apiKey, state, signal, owner);
    } catch {
      this.logger.warn(
        'Artificial Analysis background refresh unavailable; retaining cached benchmarks',
      );
    }
  }

  private async refresh(
    apiKey: string,
    state: RefreshState,
    signal: AbortSignal,
    owner: string,
  ): Promise<void> {
    state.nextRefreshAt = Date.now() + RETRY_DELAY_MS;

    try {
      const models: ArtificialAnalysisModel[] = [];
      let intelligenceIndexVersion: number | undefined;

      for (let page = 1; page <= MAXIMUM_PAGES; page++) {
        if (Date.now() >= state.windowResetAt) {
          state.windowResetAt = Date.now() + REFRESH_INTERVAL_MS;
          state.requestsUsed = 0;
          state.remainingRequests = undefined;
        }

        if (
          state.requestsUsed >= MAXIMUM_REQUESTS_PER_WINDOW ||
          state.remainingRequests === 0
        ) {
          state.nextRefreshAt = Math.max(
            state.nextRefreshAt,
            state.windowResetAt,
          );

          throw new Error('Benchmark request budget exhausted');
        }

        signal.throwIfAborted();
        state.requestsUsed += 1;

        if (isDefined(state.remainingRequests)) {
          state.remainingRequests -= 1;
        }

        // Reserve each page before sending it so crashes also consume budget.
        // The scope is shared across workspaces, workers and API key rotations.
        await this.writeCache(owner, REFRESH_STATE_KEY, state, 0);
        signal.throwIfAborted();

        const requestSignal = AbortSignal.any([
          signal,
          AbortSignal.timeout(REQUEST_TIMEOUT_MS),
        ]);
        const response = await fetch(
          `https://artificialanalysis.ai/api/v2/language/models/free?page=${page}`,
          { headers: { 'x-api-key': apiKey }, signal: requestSignal },
        );

        this.updateQuota(state, response);

        if (!response.ok) {
          if (response.status === 401 || response.status === 403) {
            state.nextRefreshAt = Date.now() + REFRESH_INTERVAL_MS;
          }

          throw new Error(`HTTP ${response.status}`);
        }

        const result = artificialAnalysisResponseSchema.parse(
          await response.json(),
        );

        requestSignal.throwIfAborted();

        if (
          result.pagination.page !== page ||
          (isDefined(intelligenceIndexVersion) &&
            intelligenceIndexVersion !== result.intelligence_index_version)
        ) {
          throw new Error('Inconsistent benchmark pagination');
        }

        intelligenceIndexVersion = result.intelligence_index_version;
        models.push(...result.data);

        if (!result.pagination.has_more) {
          const catalog: ArtificialAnalysisCatalog = {
            models,
            intelligenceIndexVersion,
            fetchedAt: new Date().toISOString(),
          };

          await this.writeCache(
            owner,
            CATALOG_KEY,
            catalog,
            MAXIMUM_STALE_AGE_MS,
          );
          state.nextRefreshAt = Date.now() + REFRESH_INTERVAL_MS;
          state.consecutiveFailures = 0;

          return;
        }
      }

      throw new Error('Benchmark pagination limit exceeded');
    } catch {
      const retryDelay = Math.min(
        RETRY_DELAY_MS * 2 ** Math.min(state.consecutiveFailures, 5),
        REFRESH_INTERVAL_MS,
      );

      state.consecutiveFailures += 1;
      state.nextRefreshAt = Math.max(
        state.nextRefreshAt,
        Date.now() + retryDelay,
      );
      this.logger.warn(
        'Artificial Analysis refresh failed; retaining the last complete catalog',
      );
    } finally {
      await this.writeCache(owner, REFRESH_STATE_KEY, state, 0);
    }
  }

  private async writeCache(
    owner: string,
    key: string,
    value: unknown,
    ttl: number,
  ): Promise<void> {
    const written = await this.cacheStorageService.runScript<number>({
      script: WRITE_BENCHMARK_CACHE_SCRIPT,
      keys: [REFRESH_LOCK_KEY, key],
      args: [JSON.stringify(owner), JSON.stringify(value), String(ttl)],
    });

    if (written !== 1) {
      throw new Error('Benchmark refresh lease expired');
    }
  }

  private updateQuota(state: RefreshState, response: Response): void {
    const remaining = this.getNumericHeader(response, 'x-ratelimit-remaining');
    const reset = this.getNumericHeader(response, 'x-ratelimit-reset');

    if (isDefined(remaining)) {
      state.remainingRequests = remaining;
    }

    if (isDefined(reset) && reset * 1000 > Date.now()) {
      state.windowResetAt = reset * 1000;
    }

    if (response.status === 429) {
      const retryAfter = this.getNumericHeader(response, 'retry-after');
      const retryAt = Math.max(
        isDefined(reset) ? reset * 1000 : 0,
        isDefined(retryAfter) ? Date.now() + retryAfter * 1000 : 0,
      );

      state.remainingRequests = 0;
      state.windowResetAt =
        retryAt > Date.now() ? retryAt : state.windowResetAt;
      state.nextRefreshAt = state.windowResetAt;
    }
  }

  private getNumericHeader(
    response: Response,
    name: string,
  ): number | undefined {
    const header = response.headers.get(name);

    if (!header?.trim()) {
      return undefined;
    }

    const value = Number(header);

    return Number.isFinite(value) && value >= 0 ? value : undefined;
  }
}
