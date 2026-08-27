import {
  Injectable,
  Logger,
  OnApplicationShutdown,
  OnModuleInit,
} from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';

import { Pool, type PoolConfig, types } from 'pg';
import { DataSource } from 'typeorm';
import { isDefined } from 'twenty-shared/utils';

import {
  DatabasePoolMetricsService,
  DatabasePoolName,
} from 'src/database/typeorm/database-pool-metrics.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { type WorkspaceInternalContext } from 'src/engine/twenty-orm/interfaces/workspace-internal-context.interface';
import { getWorkspaceContext } from 'src/engine/twenty-orm/storage/orm-workspace-context.storage';
import { WorkspaceDataSource } from 'src/engine/twenty-orm/datasource/workspace-data-source';
import {
  TwentyOrmException,
  TwentyOrmExceptionCode,
} from 'src/engine/twenty-orm/exceptions/twenty-orm.exception';
import { WorkspaceEventEmitter } from 'src/engine/workspace-event-emitter/workspace-event-emitter';

// node-postgres parses a `date` column into a JS Date (which serializes with a
// time component). Workspace DATE fields are date-only, so parse them as the raw
// 'YYYY-MM-DD' string Postgres returns, matching the v1 TypeORM datasource.
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
export class WorkspaceDataSourceService
  implements OnModuleInit, OnApplicationShutdown
{
  private readonly logger = new Logger(WorkspaceDataSourceService.name);
  private primaryPool: Pool | null = null;
  private replicaPool: Pool | null = null;

  constructor(
    private readonly twentyConfigService: TwentyConfigService,
    private readonly workspaceEventEmitter: WorkspaceEventEmitter,
    @InjectDataSource()
    private readonly coreDataSource: DataSource,
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
      poolName: DatabasePoolName.WorkspaceV2Primary,
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
        poolName: DatabasePoolName.WorkspaceV2Replica,
        pool: this.replicaPool,
      });
    }
  }

  getDataSource({ useReplica }: { useReplica: boolean }): WorkspaceDataSource {
    const pool = useReplica
      ? (this.replicaPool ?? this.primaryPool)
      : this.primaryPool;

    if (!isDefined(pool)) {
      throw new TwentyOrmException(
        'WorkspaceDataSourceService has not been initialized. Make sure the module has been initialized.',
        TwentyOrmExceptionCode.UNSUPPORTED_OPERATION,
      );
    }

    const workspaceContext = getWorkspaceContext();

    return new WorkspaceDataSource({
      pool,
      internalContext: this.buildInternalContext(workspaceContext),
      authContext: workspaceContext.authContext,
      objectPermissionsByRoleId: workspaceContext.permissionsPerRoleId,
    });
  }

  private buildInternalContext(
    workspaceContext: ReturnType<typeof getWorkspaceContext>,
  ): WorkspaceInternalContext {
    return {
      workspaceId: workspaceContext.authContext.workspace.id,
      flatObjectMetadataMaps: workspaceContext.flatObjectMetadataMaps,
      flatFieldMetadataMaps: workspaceContext.flatFieldMetadataMaps,
      flatIndexMaps: workspaceContext.flatIndexMaps,
      flatRowLevelPermissionPredicateMaps:
        workspaceContext.flatRowLevelPermissionPredicateMaps,
      flatRowLevelPermissionPredicateGroupMaps:
        workspaceContext.flatRowLevelPermissionPredicateGroupMaps,
      objectIdByNameSingular: workspaceContext.objectIdByNameSingular,
      featureFlagsMap: workspaceContext.featureFlagsMap,
      userWorkspaceRoleMap: workspaceContext.userWorkspaceRoleMap,
      apiKeyRoleMap: workspaceContext.apiKeyRoleMap,
      eventEmitterService: this.workspaceEventEmitter,
      coreDataSource: this.coreDataSource,
    };
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
      DatabasePoolName.WorkspaceV2Primary,
    );
    this.databasePoolMetricsService.unregisterPool(
      DatabasePoolName.WorkspaceV2Replica,
    );

    await this.primaryPool?.end();
    await this.replicaPool?.end();
    this.primaryPool = null;
    this.replicaPool = null;
  }
}
