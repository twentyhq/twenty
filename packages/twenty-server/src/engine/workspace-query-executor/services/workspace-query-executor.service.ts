import {
  Injectable,
  Logger,
  OnApplicationShutdown,
  OnModuleInit,
} from '@nestjs/common';

import { Pool, type PoolConfig, types } from 'pg';
import { isDefined } from 'twenty-shared/utils';

import {
  DatabasePoolMetricsService,
  DatabasePoolName,
} from 'src/database/typeorm/database-pool-metrics.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import {
  WorkspaceQueryExecutorException,
  WorkspaceQueryExecutorExceptionCode,
} from 'src/engine/workspace-query-executor/exceptions/workspace-query-executor.exception';
import { ClientQueryExecutor } from 'src/engine/workspace-query-executor/client-query-executor';
import { PoolQueryExecutor } from 'src/engine/workspace-query-executor/pool-query-executor';
import { type QueryExecutor } from 'src/engine/workspace-query-executor/types/query-executor.type';
import { runInRollbackSafeTransaction } from 'src/engine/workspace-query-executor/utils/run-in-rollback-safe-transaction.util';

// Workspace DATE fields are date-only: keep Postgres's raw 'YYYY-MM-DD' instead of a JS Date, like the v1 datasource
const DATE_ONLY_POOL_TYPES: PoolConfig['types'] = {
  getTypeParser: ((oid: number, format?: unknown) =>
    oid === types.builtins.DATE
      ? (value: string) => value
      : types.getTypeParser(
          oid,
          format as never,
        )) as typeof types.getTypeParser,
};

@Injectable()
export class WorkspaceQueryExecutorService
  implements OnModuleInit, OnApplicationShutdown
{
  private readonly logger = new Logger(WorkspaceQueryExecutorService.name);
  private primaryPool: Pool | null = null;
  private replicaPool: Pool | null = null;

  constructor(
    private readonly twentyConfigService: TwentyConfigService,
    private readonly databasePoolMetricsService: DatabasePoolMetricsService,
  ) {}

  onModuleInit(): void {
    this.primaryPool = this.createPool({
      connectionString: this.twentyConfigService.get('PG_DATABASE_URL'),
      queryTimeoutMs: this.twentyConfigService.get(
        'PG_DATABASE_PRIMARY_TIMEOUT_MS',
      ),
    });

    this.databasePoolMetricsService.registerPool({
      poolName: DatabasePoolName.WorkspacePrimary,
      pool: this.primaryPool,
    });

    const replicaUrl = this.twentyConfigService.get('PG_DATABASE_REPLICA_URL');

    if (isDefined(replicaUrl)) {
      this.replicaPool = this.createPool({
        connectionString: replicaUrl,
        queryTimeoutMs: this.twentyConfigService.get(
          'PG_DATABASE_REPLICA_TIMEOUT_MS',
        ),
      });

      this.databasePoolMetricsService.registerPool({
        poolName: DatabasePoolName.WorkspaceReplica,
        pool: this.replicaPool,
      });
    }
  }

  getPoolOrThrow({ useReplica }: { useReplica: boolean }): Pool {
    const pool = useReplica
      ? (this.replicaPool ?? this.primaryPool)
      : this.primaryPool;

    if (!isDefined(pool)) {
      throw new WorkspaceQueryExecutorException({
        message:
          'WorkspaceQueryExecutorService has not been initialized. Make sure the module has been initialized.',
        code: WorkspaceQueryExecutorExceptionCode.UNSUPPORTED_OPERATION,
      });
    }

    return pool;
  }

  getPrimaryQueryExecutorOrThrow(): QueryExecutor {
    return new PoolQueryExecutor({
      pool: this.getPoolOrThrow({ useReplica: false }),
    });
  }

  runInTransaction<TResult>(
    work: (executor: QueryExecutor) => Promise<TResult>,
  ): Promise<TResult> {
    return runInRollbackSafeTransaction({
      pool: this.getPoolOrThrow({ useReplica: false }),
      work: (client) => work(new ClientQueryExecutor({ client })),
    });
  }

  private createPool({
    connectionString,
    queryTimeoutMs,
  }: {
    connectionString: string;
    queryTimeoutMs: number;
  }): Pool {
    const pool = new Pool({
      connectionString,
      types: DATE_ONLY_POOL_TYPES,
      max: this.twentyConfigService.get('PG_POOL_MAX_CONNECTIONS'),
      idleTimeoutMillis: this.twentyConfigService.get(
        'PG_POOL_IDLE_TIMEOUT_MS',
      ),
      allowExitOnIdle: this.twentyConfigService.get(
        'PG_POOL_ALLOW_EXIT_ON_IDLE',
      ),
      query_timeout: queryTimeoutMs,
      ssl: this.twentyConfigService.get('PG_SSL_ALLOW_SELF_SIGNED')
        ? { rejectUnauthorized: false }
        : undefined,
    });

    pool.on('error', (error) => {
      this.logger.error(`Idle client error: ${error.message}`, error.stack);
    });

    return pool;
  }

  async onApplicationShutdown(): Promise<void> {
    this.databasePoolMetricsService.unregisterPool(
      DatabasePoolName.WorkspacePrimary,
    );
    this.databasePoolMetricsService.unregisterPool(
      DatabasePoolName.WorkspaceReplica,
    );

    await this.primaryPool?.end();
    await this.replicaPool?.end();
    this.primaryPool = null;
    this.replicaPool = null;
  }
}
