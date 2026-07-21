import {
  Injectable,
  OnApplicationShutdown,
  OnModuleInit,
} from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';

import { type Pool } from 'pg';
import { isDefined } from 'twenty-shared/utils';
import { DataSource } from 'typeorm';

import { MetricsService } from 'src/engine/core-modules/metrics/metrics.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { GlobalWorkspaceDataSource } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-datasource';
import { WorkspaceEventEmitter } from 'src/engine/workspace-event-emitter/workspace-event-emitter';

type PostgresPool = Pick<Pool, 'totalCount' | 'idleCount' | 'waitingCount'>;

@Injectable()
export class GlobalWorkspaceDataSourceService
  implements OnModuleInit, OnApplicationShutdown
{
  private globalWorkspaceDataSource: GlobalWorkspaceDataSource | null = null;
  private globalWorkspaceDataSourceReplica: GlobalWorkspaceDataSource | null =
    null;

  constructor(
    private readonly twentyConfigService: TwentyConfigService,
    private readonly workspaceEventEmitter: WorkspaceEventEmitter,
    @InjectDataSource()
    private readonly coreDataSource: DataSource,
    private readonly metricsService: MetricsService,
  ) {}

  async onModuleInit(): Promise<void> {
    this.globalWorkspaceDataSource = new GlobalWorkspaceDataSource(
      {
        url: this.twentyConfigService.get('PG_DATABASE_URL'),
        type: 'postgres',
        logging: this.twentyConfigService.getLoggingConfig(),
        entities: [],
        ssl: this.twentyConfigService.get('PG_SSL_ALLOW_SELF_SIGNED')
          ? {
              rejectUnauthorized: false,
            }
          : undefined,
        poolSize: this.twentyConfigService.get('PG_POOL_MAX_CONNECTIONS'),
        extra: {
          query_timeout: this.twentyConfigService.get(
            'PG_DATABASE_PRIMARY_TIMEOUT_MS',
          ),
          idleTimeoutMillis: this.twentyConfigService.get(
            'PG_POOL_IDLE_TIMEOUT_MS',
          ),
          allowExitOnIdle: this.twentyConfigService.get(
            'PG_POOL_ALLOW_EXIT_ON_IDLE',
          ),
        },
      },
      this.workspaceEventEmitter,
      this.coreDataSource,
    );

    await this.globalWorkspaceDataSource.initialize();

    const shouldInitializeReplicaDataSource = isDefined(
      this.twentyConfigService.get('PG_DATABASE_REPLICA_URL'),
    );

    if (shouldInitializeReplicaDataSource) {
      this.globalWorkspaceDataSourceReplica = new GlobalWorkspaceDataSource(
        {
          url: this.twentyConfigService.get('PG_DATABASE_REPLICA_URL'),
          type: 'postgres',
          logging: this.twentyConfigService.getLoggingConfig(),
          entities: [],
          ssl: this.twentyConfigService.get('PG_SSL_ALLOW_SELF_SIGNED')
            ? {
                rejectUnauthorized: false,
              }
            : undefined,
          poolSize: this.twentyConfigService.get('PG_POOL_MAX_CONNECTIONS'),
          extra: {
            query_timeout: this.twentyConfigService.get(
              'PG_DATABASE_REPLICA_TIMEOUT_MS',
            ),
            idleTimeoutMillis: this.twentyConfigService.get(
              'PG_POOL_IDLE_TIMEOUT_MS',
            ),
            allowExitOnIdle: this.twentyConfigService.get(
              'PG_POOL_ALLOW_EXIT_ON_IDLE',
            ),
          },
        },
        this.workspaceEventEmitter,
        this.coreDataSource,
      );
      await this.globalWorkspaceDataSourceReplica.initialize();
    }

    this.registerDatabasePoolMetrics();
  }

  public getGlobalWorkspaceDataSource(): GlobalWorkspaceDataSource {
    if (!isDefined(this.globalWorkspaceDataSource)) {
      throw new Error(
        'GlobalWorkspaceDataSource has not been initialized. Make sure the module has been initialized.',
      );
    }

    return this.globalWorkspaceDataSource;
  }

  public getGlobalWorkspaceDataSourceReplica(): GlobalWorkspaceDataSource {
    if (!isDefined(this.globalWorkspaceDataSourceReplica)) {
      return this.getGlobalWorkspaceDataSource();
    }

    return this.globalWorkspaceDataSourceReplica;
  }

  async onApplicationShutdown(): Promise<void> {
    if (this.globalWorkspaceDataSource) {
      await this.globalWorkspaceDataSource.destroy();
      this.globalWorkspaceDataSource = null;
    }
    if (this.globalWorkspaceDataSourceReplica) {
      await this.globalWorkspaceDataSourceReplica.destroy();
      this.globalWorkspaceDataSourceReplica = null;
    }
  }

  private registerDatabasePoolMetrics(): void {
    this.metricsService.createMultiObservableGauge({
      metricName: 'twenty_database_pool_connections',
      options: {
        description: 'PostgreSQL connections held by each application pool',
      },
      callback: async () =>
        this.getPostgresPools().flatMap(({ poolName, pool }) => [
          {
            value: pool.totalCount - pool.idleCount,
            attributes: { pool: poolName, state: 'used' },
          },
          {
            value: pool.idleCount,
            attributes: { pool: poolName, state: 'idle' },
          },
        ]),
    });

    this.metricsService.createMultiObservableGauge({
      metricName: 'twenty_database_pool_waiting_requests',
      options: {
        description:
          'Requests waiting to acquire a PostgreSQL connection from each application pool',
      },
      callback: async () =>
        this.getPostgresPools().map(({ poolName, pool }) => ({
          value: pool.waitingCount,
          attributes: { pool: poolName },
        })),
    });
  }

  private getPostgresPools(): Array<{
    poolName: 'core' | 'workspace-primary' | 'workspace-replica';
    pool: PostgresPool;
  }> {
    const dataSources: Array<{
      poolName: 'core' | 'workspace-primary' | 'workspace-replica';
      dataSource: DataSource;
    }> = [{ poolName: 'core', dataSource: this.coreDataSource }];

    if (this.globalWorkspaceDataSource) {
      dataSources.push({
        poolName: 'workspace-primary',
        dataSource: this.globalWorkspaceDataSource,
      });
    }

    if (this.globalWorkspaceDataSourceReplica) {
      dataSources.push({
        poolName: 'workspace-replica',
        dataSource: this.globalWorkspaceDataSourceReplica,
      });
    }

    return dataSources.flatMap(({ poolName, dataSource }) => {
      const pool = (dataSource.driver as { master?: PostgresPool }).master;

      return pool ? [{ poolName, pool }] : [];
    });
  }
}
