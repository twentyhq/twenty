import { Injectable, Logger } from '@nestjs/common';

import pg, { Pool, PoolConfig } from 'pg';
import { isDefined } from 'twenty-shared/utils';

import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

interface PgWithPatchSymbol {
  Pool: typeof Pool;
  [key: symbol]: boolean;
}

interface SSLConfig {
  rejectUnauthorized?: boolean;
  [key: string]: unknown;
}

interface PoolWithEndTracker extends Pool {
  __hasEnded?: boolean;
}

interface ExtendedPoolConfig extends PoolConfig {
  allowExitOnIdle?: boolean;
}

interface PoolInternalStats {
  _clients?: Array<unknown>;
  _idle?: Array<unknown>;
  _pendingQueue?: {
    length: number;
  };
}

/**
 * Service that manages shared pg connection pools across tenants.
 * It patches the pg.Pool constructor to return cached instances for
 * identical connection parameters.
 */
@Injectable()
export class PgPoolSharedService {
  private readonly logger = new Logger('PgPoolSharedService');
  private initialized = false;
  private readonly PATCH_SYMBOL = Symbol.for('@@twenty/pg-shared-pool');
  private isDebugEnabled = false;
  private logStatsInterval: NodeJS.Timeout | null = null;

  // Internal pool cache - exposed for testing only
  private poolsMap = new Map<string, Pool>();

  private capturedOriginalPoolValue: typeof Pool | null = null;
  private originalPgPoolDescriptor: PropertyDescriptor | undefined = undefined;

  constructor(private readonly configService: TwentyConfigService) {
    this.detectDebugMode();
  }

  private detectDebugMode(): void {
    const logLevels = this.configService.get('LOG_LEVELS');

    this.isDebugEnabled =
      Array.isArray(logLevels) &&
      logLevels.some((level) => level === 'debug' || level === 'verbose');
  }

  /**
   * Provides access to the internal pools map for testing purposes
   */
  getPoolsMapForTesting(): Map<string, Pool> | null {
    if (!this.initialized) {
      return null;
    }

    return this.poolsMap;
  }

  /**
   * Applies the pg.Pool patch to enable connection pool sharing.
   * Safe to call multiple times - will only apply the patch once.
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      this.logger.debug('Pg pool sharing already initialized, skipping');

      return;
    }

    if (!this.isPoolSharingEnabled()) {
      this.logger.log('Pg pool sharing is disabled by configuration');

      return;
    }

    this.logPoolConfiguration();
    this.patchPgPool();

    if (!this.isPatchSuccessful()) {
      this.logger.error(
        'Failed to patch pg.Pool. PgPoolSharedService will not be active.',
      );
      this.initialized = false;

      return;
    }

    this.initialized = true;
    this.logger.log(
      'Pg pool sharing initialized - pools will be shared across tenants',
    );

    if (this.isDebugEnabled) {
      this.startPoolStatsLogging();
    }
  }

  private isPoolSharingEnabled(): boolean {
    return !!this.configService.get('PG_ENABLE_POOL_SHARING');
  }

  private logPoolConfiguration(): void {
    const maxConnections = this.configService.get('PG_POOL_MAX_CONNECTIONS');
    const idleTimeoutMs = this.configService.get('PG_POOL_IDLE_TIMEOUT_MS');
    const allowExitOnIdle = this.configService.get(
      'PG_POOL_ALLOW_EXIT_ON_IDLE',
    );

    this.logger.log(
      `Pool sharing will use max ${maxConnections} connections per pool with ${idleTimeoutMs}ms idle timeout and allowExitOnIdle=${allowExitOnIdle}`,
    );
  }

  private isPatchSuccessful(): boolean {
    const pgWithSymbol = pg as PgWithPatchSymbol;

    return !!pgWithSymbol[this.PATCH_SYMBOL];
  }

  /**
   * Stops the periodic logging of pool statistics.
   * Call this during application shutdown.
   */
  async onApplicationShutdown(): Promise<void> {
    this.stopStatsLogging();
    this.logger.log('onApplicationShutdown called in PgPoolSharedService');
    await this.closeAllPools();
  }

  private stopStatsLogging(): void {
    if (!this.logStatsInterval) {
      return;
    }

    clearInterval(this.logStatsInterval);
    this.logStatsInterval = null;
  }

  private async closeAllPools(): Promise<void> {
    if (this.poolsMap.size === 0) {
      return;
    }

    const closePromises: Promise<void>[] = [];

    for (const [key, pool] of this.poolsMap.entries()) {
      closePromises.push(
        pool
          .end()
          .catch((err) => {
            if (err?.message !== 'Called end on pool more than once') {
              this.logger.debug(
                `Pool[${key}] error during shutdown: ${err.message}`,
              );
            }
          })
          .then(() => {
            this.logger.debug(
              `Pool[${key}] closed during application shutdown`,
            );
          }),
      );
    }

    this.logger.debug('Attempting to close all pg pools...');
    await Promise.allSettled(closePromises);
    this.logger.debug('All pg pools closure attempts completed.');
  }

  /**
   * Logs detailed statistics about all connection pools
   */
  logPoolStats(): void {
    if (!this.initialized || this.poolsMap.size === 0) {
      this.logger.debug('No active pg pools to log stats for');

      return;
    }

    let totalActive = 0;
    let totalIdle = 0;
    let totalPoolSize = 0;
    let totalQueueSize = 0;

    this.logger.debug('=== PostgreSQL Connection Pool Stats ===');

    for (const [key, pool] of this.poolsMap.entries()) {
      const stats = this.collectPoolStats(key, pool);

      totalActive += stats.active;
      totalIdle += stats.idle;
      totalPoolSize += stats.poolSize;
      totalQueueSize += stats.queueSize;
    }

    this.logTotalStats(totalActive, totalIdle, totalPoolSize, totalQueueSize);
  }

  private collectPoolStats(key: string, pool: Pool) {
    const poolStats = pool as PoolInternalStats;

    const active =
      (poolStats._clients?.length || 0) - (poolStats._idle?.length || 0);
    const idle = poolStats._idle?.length || 0;
    const poolSize = poolStats._clients?.length || 0;
    const queueSize = poolStats._pendingQueue?.length || 0;

    this.logger.debug(
      `Pool [${key}]: active=${active}, idle=${idle}, size=${poolSize}, queue=${queueSize}`,
    );

    return { active, idle, poolSize, queueSize };
  }

  private logTotalStats(
    totalActive: number,
    totalIdle: number,
    totalPoolSize: number,
    totalQueueSize: number,
  ): void {
    this.logger.debug(
      `Total pools: ${this.poolsMap.size}, active=${totalActive}, idle=${totalIdle}, ` +
        `total connections=${totalPoolSize}, queued requests=${totalQueueSize}`,
    );
    this.logger.debug('=========================================');
  }

  /**
   * Starts periodically logging pool statistics if debug is enabled
   */
  private startPoolStatsLogging(): void {
    this.logPoolStats();

    this.logStatsInterval = setInterval(() => {
      this.logPoolStats();
    }, 30000);

    this.logger.debug('Pool statistics logging enabled (30s interval)');
  }

  /**
   * Patches the pg module's Pool constructor to provide shared instances
   * across all tenant workspaces.
   */
  private patchPgPool(): void {
    const pgWithSymbol = pg as PgWithPatchSymbol;

    if (this.isAlreadyPatched(pgWithSymbol)) {
      return;
    }

    if (!this.captureOriginalPool(pgWithSymbol)) {
      return;
    }

    this.applyPatchWithSharedPool(pgWithSymbol);
  }

  private isAlreadyPatched(pgWithSymbol: PgWithPatchSymbol): boolean {
    if (pgWithSymbol[this.PATCH_SYMBOL]) {
      this.logger.debug(
        'pg.Pool is already patched. Skipping patch operation for this instance.',
      );

      return true;
    }

    return false;
  }

  private captureOriginalPool(pgWithSymbol: PgWithPatchSymbol): boolean {
    this.originalPgPoolDescriptor = Object.getOwnPropertyDescriptor(
      pgWithSymbol,
      'Pool',
    );

    if (
      !this.originalPgPoolDescriptor ||
      typeof this.originalPgPoolDescriptor.value !== 'function'
    ) {
      this.logger.error(
        'Could not get original pg.Pool constructor or descriptor is invalid. Aborting patch.',
      );

      return false;
    }

    this.capturedOriginalPoolValue = this.originalPgPoolDescriptor
      .value as typeof Pool;

    return true;
  }

  private applyPatchWithSharedPool(pgWithSymbol: PgWithPatchSymbol): void {
    const OriginalPool = this.capturedOriginalPoolValue as typeof Pool;
    const SharedPool = this.createSharedPoolConstructor(OriginalPool);

    // Preserve prototype chain for instanceof checks
    SharedPool.prototype = Object.create(OriginalPool.prototype);
    SharedPool.prototype.constructor = SharedPool;

    // Replace the original Pool with our patched version
    Object.defineProperty(pgWithSymbol, 'Pool', {
      value: SharedPool as unknown as typeof Pool,
      writable: true,
      configurable: true,
      enumerable: this.originalPgPoolDescriptor?.enumerable,
    });

    pgWithSymbol[this.PATCH_SYMBOL] = true;
    this.logger.log('pg.Pool patched successfully by this service instance.');
  }

  private createSharedPoolConstructor(OriginalPool: typeof Pool) {
    const maxConnections = this.configService.get('PG_POOL_MAX_CONNECTIONS');
    const idleTimeoutMs = this.configService.get('PG_POOL_IDLE_TIMEOUT_MS');
    const allowExitOnIdle = this.configService.get(
      'PG_POOL_ALLOW_EXIT_ON_IDLE',
    );

    // Store references to service functions/properties that we need in our constructor
    const buildPoolKey = this.buildPoolKey.bind(this);
    const poolsMap = this.poolsMap;
    const logger = this.logger;
    const isDebugEnabled = this.isDebugEnabled;
    const setupPoolEvents = this.setupPoolEvents.bind(this);
    const replacePoolEndMethod = this.replacePoolEndMethod.bind(this);

    // Define a proper constructor function that can be used with "new"
    function SharedPool(this: Pool, config?: PoolConfig): Pool {
      // When called as a function (without new), make sure to return a new instance
      if (!(this instanceof SharedPool)) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error We know this works at runtime
        return new SharedPool(config);
      }

      const poolConfig = config
        ? ({ ...config } as ExtendedPoolConfig)
        : ({} as ExtendedPoolConfig);

      if (maxConnections) {
        poolConfig.max = maxConnections;
      }

      if (idleTimeoutMs) {
        poolConfig.idleTimeoutMillis = idleTimeoutMs;
      }

      if (allowExitOnIdle) {
        poolConfig.allowExitOnIdle = allowExitOnIdle;
      }

      const key = buildPoolKey(poolConfig);
      const existing = poolsMap.get(key);

      if (existing) {
        if (isDebugEnabled) {
          logger.debug(`Reusing existing pg Pool for key "${key}"`);
        }

        return existing;
      }

      const pool = new OriginalPool(poolConfig);

      poolsMap.set(key, pool);

      logger.log(
        `Created new shared pg Pool for key "${key}" with ${poolConfig.max ?? 'default'} max connections and ${poolConfig.idleTimeoutMillis ?? 'default'} ms idle timeout. Total pools: ${poolsMap.size}`,
      );

      if (isDebugEnabled) {
        setupPoolEvents(pool, key);
      }

      replacePoolEndMethod(pool, key);

      return pool;
    }

    return SharedPool;
  }

  private setupPoolEvents(pool: Pool, key: string): void {
    pool.on('connect', () => {
      this.logger.debug(`Pool[${key}]: New connection established`);
    });

    pool.on('acquire', () => {
      this.logger.debug(`Pool[${key}]: Client acquired from pool`);
    });

    pool.on('remove', () => {
      this.logger.debug(`Pool[${key}]: Connection removed from pool`);
    });

    pool.on('error', (err) => {
      this.logger.warn(`Pool[${key}]: Connection error: ${err.message}`);
    });
  }

  private replacePoolEndMethod(pool: Pool, key: string): void {
    const originalEnd = pool.end.bind(pool) as {
      (callback?: (err?: Error) => void): void;
    };

    (pool as PoolWithEndTracker).end = (
      callback?: (err?: Error) => void,
    ): Promise<void> => {
      if ((pool as PoolWithEndTracker).__hasEnded) {
        if (callback) {
          callback();
        }

        this.logger.debug(`Ignoring duplicate end() call for pool "${key}"`);

        return Promise.resolve();
      }

      // Mark this pool as ended to prevent subsequent calls
      (pool as PoolWithEndTracker).__hasEnded = true;
      this.poolsMap.delete(key);

      this.logger.log(
        `pg Pool for key "${key}" has been closed. Remaining pools: ${this.poolsMap.size}`,
      );

      return new Promise<void>((resolve, reject) => {
        originalEnd((err) => {
          if (err) {
            // If error is about duplicate end, suppress it
            if (err.message === 'Called end on pool more than once') {
              if (callback) callback();
              resolve();

              return;
            }

            if (callback) callback(err);
            reject(err);

            return;
          }

          if (callback) callback();
          resolve();
        });
      });
    };
  }

  /**
   * Builds a unique key for a pool configuration to identify identical connections
   */
  private buildPoolKey(config: PoolConfig = {}): string {
    // We identify pools only by parameters that open a *physical* connection.
    // `search_path`/schema is not included because it is changed at session level.
    const {
      host = 'localhost',
      port = 5432,
      user = 'postgres',
      database = '',
      ssl,
    } = config;

    // Note: SSL object can contain certificates, so only stringify relevant
    // properties that influence connection reuse.
    const sslKey = isDefined(ssl)
      ? typeof ssl === 'object'
        ? JSON.stringify({
            rejectUnauthorized: (ssl as SSLConfig).rejectUnauthorized,
          })
        : String(ssl)
      : 'no-ssl';

    return [host, port, user, database, sslKey].join('|');
  }

  /**
   * Resets the pg.Pool patch and clears service state. For testing purposes only.
   */
  public unpatchForTesting(): void {
    this.logger.debug('Attempting to unpatch pg.Pool for testing...');
    const pgWithSymbol = pg as PgWithPatchSymbol;

    if (!pgWithSymbol[this.PATCH_SYMBOL]) {
      this.logger.debug(
        'pg.Pool was not patched by this instance or PATCH_SYMBOL not found, no unpatch needed from this instance.',
      );
      this.resetStateForTesting();

      return;
    }

    this.restoreOriginalPool(pgWithSymbol);
    delete pgWithSymbol[this.PATCH_SYMBOL];
    this.logger.debug('PATCH_SYMBOL removed from pg module.');
    this.resetStateForTesting();
  }

  private restoreOriginalPool(pgWithSymbol: PgWithPatchSymbol): void {
    if (this.originalPgPoolDescriptor) {
      Object.defineProperty(
        pgWithSymbol,
        'Pool',
        this.originalPgPoolDescriptor,
      );
      this.logger.debug('pg.Pool restored using original property descriptor.');

      return;
    }

    if (this.capturedOriginalPoolValue) {
      // Fallback if descriptor wasn't captured
      pgWithSymbol.Pool = this.capturedOriginalPoolValue;
      this.logger.warn(
        'pg.Pool restored using captured value (descriptor method preferred).',
      );

      return;
    }

    this.logger.error(
      'Cannot unpatch pg.Pool: no original Pool reference or descriptor was captured by this instance.',
    );
  }

  private resetStateForTesting(): void {
    this.initialized = false;
    this.poolsMap.clear();
    this.capturedOriginalPoolValue = null;
    this.originalPgPoolDescriptor = undefined;

    if (this.logStatsInterval) {
      clearInterval(this.logStatsInterval);
      this.logStatsInterval = null;
    }

    this.logger.debug(
      'Service instance state (initialized, poolsMap, captured originals, timers) reset for testing.',
    );
  }
}
