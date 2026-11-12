import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';

import { DataSource } from 'typeorm';

import { WorkspaceRecordStockService } from 'src/engine/core-modules/usage-limit/services/workspace-record-stock.service';
import { RecordAccessGroupWriteService } from 'src/engine/permissions/record-access-group-write.service';
import { RecordFieldPermissionsReadService } from 'src/engine/permissions/record-field-permissions-read.service';
import { RecordPermissionsReadService } from 'src/engine/permissions/record-permissions-read.service';
import { type WorkspaceInternalContext } from 'src/engine/twenty-orm/interfaces/workspace-internal-context.interface';
import { getWorkspaceContext } from 'src/engine/twenty-orm/storage/orm-workspace-context.storage';
import { toTwentyOrmException } from 'src/engine/twenty-orm/utils/to-twenty-orm-exception.util';
import { WorkspaceDataSource } from 'src/engine/twenty-orm/datasource/workspace-data-source';
import { WorkspaceQueryExecutorService } from 'src/engine/workspace-query-executor/services/workspace-query-executor.service';
import { WorkspaceEventEmitter } from 'src/engine/workspace-event-emitter/workspace-event-emitter';

@Injectable()
export class WorkspaceDataSourceService {
  constructor(
    private readonly workspaceQueryExecutorService: WorkspaceQueryExecutorService,
    private readonly recordPermissionsReadService: RecordPermissionsReadService,
    private readonly recordFieldPermissionsReadService: RecordFieldPermissionsReadService,
    private readonly recordAccessGroupWriteService: RecordAccessGroupWriteService,
    private readonly workspaceEventEmitter: WorkspaceEventEmitter,
    @InjectDataSource()
    private readonly coreDataSource: DataSource,
    private readonly workspaceRecordStockService: WorkspaceRecordStockService,
  ) {}

  getDataSource({ useReplica }: { useReplica: boolean }): WorkspaceDataSource {
    const workspaceContext = getWorkspaceContext();

    return new WorkspaceDataSource({
      pool: this.getPoolOrThrow({ useReplica }),
      internalContext: this.buildInternalContext(workspaceContext),
      authContext: workspaceContext.authContext,
    });
  }

  private getPoolOrThrow({ useReplica }: { useReplica: boolean }) {
    try {
      return this.workspaceQueryExecutorService.getPoolOrThrow({ useReplica });
    } catch (error) {
      throw toTwentyOrmException(error);
    }
  }

  private buildInternalContext(
    workspaceContext: ReturnType<typeof getWorkspaceContext>,
  ): WorkspaceInternalContext {
    return {
      workspaceId: workspaceContext.authContext.workspace.id,
      flatObjectMetadataMaps: workspaceContext.flatObjectMetadataMaps,
      flatFieldMetadataMaps: workspaceContext.flatFieldMetadataMaps,
      flatIndexMaps: workspaceContext.flatIndexMaps,
      flatValidationRuleMaps: workspaceContext.flatValidationRuleMaps,
      objectIdByNameSingular: workspaceContext.objectIdByNameSingular,
      featureFlagsMap: workspaceContext.featureFlagsMap,
      billingEntitlements: workspaceContext.billingEntitlements,
      permissionsPrincipals: workspaceContext.permissionsPrincipals,
      recordReadRestrictions: workspaceContext.recordReadRestrictions,
      eventEmitterService: this.workspaceEventEmitter,
      recordStock: this.workspaceRecordStockService,
      recordPermissions: this.recordPermissionsReadService,
      recordFieldPermissions: this.recordFieldPermissionsReadService,
      recordAccessGroupWrite: this.recordAccessGroupWriteService,
      recordAccessGroupQueue: this.recordAccessGroupWriteService,
      coreDataSource: this.coreDataSource,
    };
  }
}
