import { Injectable } from '@nestjs/common';

import { WorkspaceMigrationRunnerActionHandler } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/interfaces/workspace-migration-runner-action-handler-service.interface';

import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { WorkspaceSchemaManagerService } from 'src/engine/twenty-orm/workspace-schema-manager/workspace-schema-manager.service';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { type FlatUpdateIndexAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/index/types/workspace-migration-index-action';
import {
  createIndexInWorkspaceSchema,
  deleteIndexMetadata,
  dropIndexFromWorkspaceSchema,
  insertIndexMetadata,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/action-handlers/index/utils/index-action-handler.utils';
import {
  type WorkspaceMigrationActionRunnerArgs,
  type WorkspaceMigrationActionRunnerContext,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/workspace-migration-action-runner-args.type';

@Injectable()
export class UpdateIndexActionHandlerService extends WorkspaceMigrationRunnerActionHandler(
  'update',
  'index',
) {
  constructor(
    private readonly workspaceSchemaManagerService: WorkspaceSchemaManagerService,
  ) {
    super();
  }

  override async transpileUniversalActionToFlatAction(
    context: WorkspaceMigrationActionRunnerArgs<FlatUpdateIndexAction>,
  ): Promise<FlatUpdateIndexAction> {
    return context.action;
  }

  async executeForMetadata(
    context: WorkspaceMigrationActionRunnerContext<FlatUpdateIndexAction>,
  ): Promise<void> {
    const { flatAction, queryRunner, workspaceId } = context;

    // Delete old index metadata
    await deleteIndexMetadata({
      entityId: flatAction.entityId,
      queryRunner,
      workspaceId,
    });

    // Create new index metadata
    await insertIndexMetadata({
      flatIndexMetadata: flatAction.updatedFlatEntity,
      queryRunner,
    });
  }

  async executeForWorkspaceSchema(
    context: WorkspaceMigrationActionRunnerContext<FlatUpdateIndexAction>,
  ): Promise<void> {
    const {
      flatAction,
      allFlatEntityMaps: {
        flatIndexMaps,
        flatObjectMetadataMaps,
        flatFieldMetadataMaps,
      },
      queryRunner,
      workspaceId,
    } = context;

    const { entityId, updatedFlatEntity } = flatAction;

    // Get the old index to drop it
    const flatIndexMetadataToDelete = findFlatEntityByIdInFlatEntityMapsOrThrow(
      {
        flatEntityId: entityId,
        flatEntityMaps: flatIndexMaps,
      },
    );

    const schemaName = getWorkspaceSchemaName(workspaceId);

    // Drop old index
    await dropIndexFromWorkspaceSchema({
      indexName: flatIndexMetadataToDelete.name,
      workspaceSchemaManagerService: this.workspaceSchemaManagerService,
      queryRunner,
      schemaName,
    });

    // Create new index
    const flatObjectMetadata = findFlatEntityByIdInFlatEntityMapsOrThrow({
      flatEntityMaps: flatObjectMetadataMaps,
      flatEntityId: updatedFlatEntity.objectMetadataId,
    });

    await createIndexInWorkspaceSchema({
      flatIndexMetadata: updatedFlatEntity,
      flatObjectMetadata,
      flatFieldMetadataMaps,
      workspaceSchemaManagerService: this.workspaceSchemaManagerService,
      queryRunner,
      workspaceId,
    });
  }
}
