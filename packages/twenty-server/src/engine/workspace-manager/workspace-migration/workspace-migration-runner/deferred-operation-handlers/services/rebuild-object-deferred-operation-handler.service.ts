import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { WorkspaceSchemaManagerService } from 'src/engine/twenty-orm/workspace-schema-manager/workspace-schema-manager.service';
import { DeferredWorkspaceOperationHandlerDecorator } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/deferred-operation-handlers/decorators/deferred-workspace-operation-handler.decorator';
import { type DeferredWorkspaceOperationHandler } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/deferred-operation-handlers/interfaces/deferred-workspace-operation-handler.interface';
import { type DeferredWorkspaceOperationExecutionArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/deferred-workspace-operation-execution-args.type';
import { type DeferredWorkspaceOperationPayload } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/deferred-workspace-operation.type';
import { getWorkspaceSchemaContextForMigration } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/utils/get-workspace-schema-context-for-migration.util';

@Injectable()
@DeferredWorkspaceOperationHandlerDecorator('rebuild_object')
export class RebuildObjectDeferredOperationHandlerService implements DeferredWorkspaceOperationHandler<'rebuild_object'> {
  readonly metadataNamesToLoad = ['objectMetadata' as const];

  constructor(
    private readonly workspaceSchemaManagerService: WorkspaceSchemaManagerService,
  ) {}

  async execute({
    workspaceId,
    payload: { objectMetadataId },
    allFlatEntityMaps: { flatObjectMetadataMaps },
    queryRunner,
  }: DeferredWorkspaceOperationExecutionArgs<
    DeferredWorkspaceOperationPayload<'rebuild_object'>
  >): Promise<void> {
    const flatObjectMetadata = findFlatEntityByIdInFlatEntityMaps({
      flatEntityMaps: flatObjectMetadataMaps,
      flatEntityId: objectMetadataId,
    });

    if (!isDefined(flatObjectMetadata)) {
      return;
    }

    const { schemaName, tableName } = getWorkspaceSchemaContextForMigration({
      workspaceId,
      objectMetadata: flatObjectMetadata,
    });

    const [columnSlotUsage] =
      await this.workspaceSchemaManagerService.tableRebuildManager.findColumnSlotUsages(
        { queryRunner, schemaName, tableNames: [tableName] },
      );

    if (
      !isDefined(columnSlotUsage) ||
      columnSlotUsage.droppedColumnCount === 0
    ) {
      return;
    }

    await this.workspaceSchemaManagerService.tableRebuildManager.rebuildTable({
      queryRunner,
      schemaName,
      tableName,
    });
  }
}
