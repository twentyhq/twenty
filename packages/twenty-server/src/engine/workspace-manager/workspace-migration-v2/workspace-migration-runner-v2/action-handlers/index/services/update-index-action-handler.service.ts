import { Injectable } from '@nestjs/common';

import { WorkspaceMigrationRunnerActionHandler } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/interfaces/workspace-migration-runner-action-handler-service.interface';

import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { WorkspaceSchemaManagerService } from 'src/engine/twenty-orm/workspace-schema-manager/workspace-schema-manager.service';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { type UpdateIndexAction } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/index/types/workspace-migration-index-action-v2';
import {
  createIndexInWorkspaceSchema,
  deleteIndexMetadata,
  dropIndexFromWorkspaceSchema,
  insertIndexMetadata,
} from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/action-handlers/index/utils/index-action-handler.utils';
import { type WorkspaceMigrationActionRunnerArgs } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/types/workspace-migration-action-runner-args.type';

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

  async executeForMetadata(
    context: WorkspaceMigrationActionRunnerArgs<UpdateIndexAction>,
  ): Promise<void> {
    const { action, queryRunner } = context;

    // Delete old index metadata
    await deleteIndexMetadata({
      entityId: action.entityId,
      queryRunner,
    });

    // Create new index metadata
    await insertIndexMetadata({
      flatIndexMetadata: action.updatedFlatEntity,
      queryRunner,
    });
  }

  async executeForWorkspaceSchema(
    context: WorkspaceMigrationActionRunnerArgs<UpdateIndexAction>,
  ): Promise<void> {
    const {
      action,
      allFlatEntityMaps: {
        flatIndexMaps,
        flatObjectMetadataMaps,
        flatFieldMetadataMaps,
      },
      queryRunner,
      workspaceId,
    } = context;

    const { entityId, updatedFlatEntity } = action;

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
