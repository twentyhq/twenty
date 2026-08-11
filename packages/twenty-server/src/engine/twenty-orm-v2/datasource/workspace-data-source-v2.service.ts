import {
  Injectable,
  OnApplicationShutdown,
  OnModuleInit,
} from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';

import { Pool } from 'pg';
import { DataSource } from 'typeorm';
import { isDefined } from 'twenty-shared/utils';

import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { type WorkspaceInternalContext } from 'src/engine/twenty-orm/interfaces/workspace-internal-context.interface';
import { getWorkspaceContext } from 'src/engine/twenty-orm/storage/orm-workspace-context.storage';
import { WorkspaceDataSourceV2 } from 'src/engine/twenty-orm-v2/datasource/workspace-data-source-v2';
import { WorkspaceEventEmitter } from 'src/engine/workspace-event-emitter/workspace-event-emitter';

@Injectable()
export class WorkspaceDataSourceV2Service
  implements OnModuleInit, OnApplicationShutdown
{
  private primaryPool: Pool | null = null;
  private replicaPool: Pool | null = null;

  constructor(
    private readonly twentyConfigService: TwentyConfigService,
    private readonly workspaceEventEmitter: WorkspaceEventEmitter,
    @InjectDataSource()
    private readonly coreDataSource: DataSource,
  ) {}

  onModuleInit(): void {
    this.primaryPool = this.createPool({
      connectionString: this.twentyConfigService.get('PG_DATABASE_URL'),
      queryTimeoutMs: this.twentyConfigService.get(
        'PG_DATABASE_PRIMARY_TIMEOUT_MS',
      ),
    });

    const replicaUrl = this.twentyConfigService.get('PG_DATABASE_REPLICA_URL');

    if (isDefined(replicaUrl)) {
      this.replicaPool = this.createPool({
        connectionString: replicaUrl,
        queryTimeoutMs: this.twentyConfigService.get(
          'PG_DATABASE_REPLICA_TIMEOUT_MS',
        ),
      });
    }
  }

  getDataSource({
    useReplica,
  }: {
    useReplica: boolean;
  }): WorkspaceDataSourceV2 {
    const pool = useReplica
      ? (this.replicaPool ?? this.primaryPool)
      : this.primaryPool;

    if (!isDefined(pool)) {
      throw new Error(
        'WorkspaceDataSourceV2Service has not been initialized. Make sure the module has been initialized.',
      );
    }

    const workspaceContext = getWorkspaceContext();

    return new WorkspaceDataSourceV2({
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
    return new Pool({
      connectionString,
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
  }

  async onApplicationShutdown(): Promise<void> {
    await this.primaryPool?.end();
    await this.replicaPool?.end();
    this.primaryPool = null;
    this.replicaPool = null;
  }
}
