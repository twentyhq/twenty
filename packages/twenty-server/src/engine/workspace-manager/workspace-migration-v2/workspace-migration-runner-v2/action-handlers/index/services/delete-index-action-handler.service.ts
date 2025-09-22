import { Injectable } from '@nestjs/common';

import {
  OptimisticallyApplyActionOnAllFlatEntityMapsArgs,
  WorkspaceMigrationRunnerActionHandler,
} from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/interfaces/workspace-migration-runner-action-handler-service.interface';

import { AllFlatEntityMaps } from 'src/engine/core-modules/common/types/all-flat-entity-maps.type';
import { deleteFlatEntityFromFlatEntityMapsOrThrow } from 'src/engine/core-modules/common/utils/delete-flat-entity-from-flat-entity-maps-or-throw.util';
import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/core-modules/common/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { IndexMetadataEntity } from 'src/engine/metadata-modules/index-metadata/index-metadata.entity';
import { WorkspaceSchemaManagerService } from 'src/engine/twenty-orm/workspace-schema-manager/workspace-schema-manager.service';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { type DeleteIndexAction } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/workspace-migration-index-action-v2';
import { type WorkspaceMigrationActionRunnerArgs } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/types/workspace-migration-action-runner-args.type';

@Injectable()
export class DeleteIndexActionHandlerService extends WorkspaceMigrationRunnerActionHandler(
  'delete_index',
) {
  constructor(
    private readonly workspaceSchemaManagerService: WorkspaceSchemaManagerService,
  ) {
    super();
  }
  optimisticallyApplyActionOnAllFlatEntityMaps({
    action,
    allFlatEntityMaps: { flatIndexMaps },
  }: OptimisticallyApplyActionOnAllFlatEntityMapsArgs<DeleteIndexAction>): Partial<AllFlatEntityMaps> {
    return {
      flatIndexMaps: deleteFlatEntityFromFlatEntityMapsOrThrow({
        entityToDeleteId: action.flatIndexMetadataId,
        flatEntityMaps: flatIndexMaps,
      }),
    };
  }

  async executeForMetadata(
    context: WorkspaceMigrationActionRunnerArgs<DeleteIndexAction>,
  ): Promise<void> {
    const { action, queryRunner } = context;
    const indexMetadataRepository =
      queryRunner.manager.getRepository<IndexMetadataEntity>(
        IndexMetadataEntity,
      );

    const { flatIndexMetadataId } = action;

    await indexMetadataRepository.delete({
      id: flatIndexMetadataId,
    });
  }

  async executeForWorkspaceSchema(
    context: WorkspaceMigrationActionRunnerArgs<DeleteIndexAction>,
  ): Promise<void> {
    const {
      action,
      allFlatEntityMaps: { flatIndexMaps },
      queryRunner,
      workspaceId,
    } = context;

    const flatIndexMetadataToDelete = findFlatEntityByIdInFlatEntityMapsOrThrow(
      {
        flatEntityId: action.flatIndexMetadataId,
        flatEntityMaps: flatIndexMaps,
      },
    );

    const schemaName = getWorkspaceSchemaName(workspaceId);
    await this.workspaceSchemaManagerService.indexManager.dropIndex({
      indexName: flatIndexMetadataToDelete.name,
      queryRunner,
      schemaName,
    });
  }
}
