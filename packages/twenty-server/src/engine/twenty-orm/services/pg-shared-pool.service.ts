import { Injectable, Logger } from '@nestjs/common';

import pg, { Pool, PoolConfig } from 'pg';
import { isDefined } from 'twenty-shared/utils';

import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

// Define type extension for pg module to support our symbol property
interface PgWithPatchSymbol {
  Pool: typeof Pool;
  [key: symbol]: boolean;
}

interface SSLConfig {
  rejectUnauthorized?: boolean;
  [key: string]: unknown;
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

  // Internal pool cache - exposed for testing only
  private poolsMap = new Map<string, Pool>();

  constructor(private readonly configService: TwentyConfigService) {}

  /**
   * Provides access to the internal pools map for testing purposes
   */
  getPoolsMapForTesting(): Map<string, Pool> | null {
    return this.initialized ? this.poolsMap : null;
  }

  /**
   * Applies the pg.Pool patch to enable connection pool sharing.
   * Safe to call multiple times - will only apply the patch once.
   */
  initialize(): void {
    if (this.initialized) {
      this.logger.debug('Pg pool sharing already initialized, skipping');

      return;
    }

    const isPoolSharingEnabled = this.configService.get(
      'PG_ENABLE_POOL_SHARING',
    );

    if (!isPoolSharingEnabled) {
      this.logger.log('Pg pool sharing is disabled by configuration');

      return;
    }

    // Read max connections here to ensure it's always read during initialization
    const maxConnections = this.configService.get('PG_POOL_MAX_CONNECTIONS');

    this.logger.log(
      `Pool sharing will use max ${maxConnections} connections per pool`,
    );

    this.patchPgPool();
    this.initialized = true;
    this.logger.log(
      'Pg pool sharing initialized - pools will be shared across tenants',
    );
  }

  /**
   * Patches the pg module's Pool constructor to provide shared instances
   * across all tenant workspaces.
   */
  private patchPgPool(): void {
    const pgWithSymbol = pg as PgWithPatchSymbol;

    // Don't patch twice
    if (pgWithSymbol[this.PATCH_SYMBOL]) {
      return;
    }

    // Keep reference to the original constructor
    const OriginalPool = pgWithSymbol.Pool;

    // Retrieve max connections from config
    const maxConnections = this.configService.get('PG_POOL_MAX_CONNECTIONS');

    // Store references to service functions/properties that we need in our constructor
    const buildPoolKey = this.buildPoolKey.bind(this);
    const poolsMap = this.poolsMap;
    const logger = this.logger;

    // Define a proper constructor function that can be used with "new"
    // Use a function declaration to be compatible with 'new' keyword
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function SharedPool(this: any, config?: PoolConfig): Pool {
      // When called as a function (without new), make sure to return a new instance
      if (!(this instanceof SharedPool)) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error We know this works at runtime
        return new SharedPool(config);
      }

      // Initialize config if not provided
      const poolConfig = config ? { ...config } : {};

      // Apply max connections setting from config
      if (maxConnections) {
        poolConfig.max = maxConnections;
      }

      const key = buildPoolKey(poolConfig);
      const existing = poolsMap.get(key);

      if (existing) {
        return existing;
      }

      // Create a new Pool instance
      const pool = new OriginalPool(poolConfig);

      // Store it in our map
      poolsMap.set(key, pool);

      logger.log(
        `Created new shared pg Pool for key "${key}" with ${poolConfig.max ?? 'default'} max connections. Total pools: ${poolsMap.size}`,
      );

      // Replace the pool's end method to clean up our cache
      const originalEnd = pool.end.bind(pool) as {
        (callback?: (err?: Error) => void): void;
      };

      // Replace the `end` method to clean up the pool from our cache
      (pool as { end: unknown }).end = (
        callback?: (err?: Error) => void,
      ): Promise<void> => {
        poolsMap.delete(key);
        logger.log(
          `pg Pool for key "${key}" has been closed. Remaining pools: ${poolsMap.size}`,
        );

        return new Promise<void>((resolve, reject) => {
          originalEnd((err) => {
            if (callback) callback(err);
            if (err) reject(err);
            else resolve();
          });
        });
      };

      return pool;
    }

    // Preserve prototype chain for instanceof checks
    SharedPool.prototype = Object.create(OriginalPool.prototype);

    // Set the constructor property correctly
    SharedPool.prototype.constructor = SharedPool;

    // Replace the original Pool with our patched version
    pgWithSymbol.Pool = SharedPool as unknown as typeof Pool;

    // Mark as patched
    pgWithSymbol[this.PATCH_SYMBOL] = true;
  }

  /**
   * Builds a unique key for a pool configuration to identify identical connections
   */
  private buildPoolKey(config: PoolConfig = {}): string {
    // We identify pools only by parameters that open a *physical* connection.
    // `search_path`/schema is not included because it can be changed via
    // `SET search_path` at session level.
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
}
