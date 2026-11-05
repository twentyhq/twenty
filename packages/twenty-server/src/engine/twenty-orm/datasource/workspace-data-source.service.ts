import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';

import { DataSource } from 'typeorm';

import { WorkspaceRecordStockService } from 'src/engine/core-modules/usage-limit/services/workspace-record-stock.service';
import { RecordPermissionReadOrmService } from 'src/engine/permissions/record-permission-orm/services/record-permission-read-orm.service';
import { type WorkspaceInternalContext } from 'src/engine/twenty-orm/interfaces/workspace-internal-context.interface';
import { getWorkspaceContext } from 'src/engine/twenty-orm/storage/orm-workspace-context.storage';
import { WorkspaceDataSource } from 'src/engine/twenty-orm/datasource/workspace-data-source';
import { WorkspaceQueryExecutorService } from 'src/engine/workspace-query-executor/services/workspace-query-executor.service';
import { WorkspaceEventEmitter } from 'src/engine/workspace-event-emitter/workspace-event-emitter';

@Injectable()
export class WorkspaceDataSourceService {
  constructor(
    private readonly workspaceQueryExecutorService: WorkspaceQueryExecutorService,
    private readonly recordPermissionReadOrmService: RecordPermissionReadOrmService,
    private readonly workspaceEventEmitter: WorkspaceEventEmitter,
    @InjectDataSource()
    private readonly coreDataSource: DataSource,
    private readonly workspaceRecordStockService: WorkspaceRecordStockService,
  ) {}

  getDataSource({ useReplica }: { useReplica: boolean }): WorkspaceDataSource {
    const workspaceContext = getWorkspaceContext();

    return new WorkspaceDataSource({
      pool: this.workspaceQueryExecutorService.getPoolOrThrow({ useReplica }),
      internalContext: this.buildInternalContext(workspaceContext),
      authContext: workspaceContext.authContext,
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
      flatWorkspaceMemberMaps: workspaceContext.flatWorkspaceMemberMaps,
      flatValidationRuleMaps: workspaceContext.flatValidationRuleMaps,
      objectIdByNameSingular: workspaceContext.objectIdByNameSingular,
      featureFlagsMap: workspaceContext.featureFlagsMap,
      billingEntitlements: workspaceContext.billingEntitlements,
      userWorkspaceRoleMap: workspaceContext.userWorkspaceRoleMap,
      apiKeyRoleMap: workspaceContext.apiKeyRoleMap,
      rolesPermissions: workspaceContext.permissionsPerRoleId,
      flatRoleTargetByAgentIdMaps: workspaceContext.flatRoleTargetByAgentIdMaps,
      flatApplicationMaps: workspaceContext.flatApplicationMaps,
      eventEmitterService: this.workspaceEventEmitter,
      recordStock: this.workspaceRecordStockService,
      recordPermissionReadOrm: this.recordPermissionReadOrmService,
      coreDataSource: this.coreDataSource,
    };
  }
}
