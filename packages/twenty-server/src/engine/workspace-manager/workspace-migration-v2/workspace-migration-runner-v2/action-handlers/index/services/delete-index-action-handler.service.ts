import { Injectable } from '@nestjs/common';

import {
  OptimisticallyApplyActionOnAllFlatEntityMapsArgs,
  WorkspaceMigrationRunnerActionHandler,
} from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/interfaces/workspace-migration-runner-action-handler-service.interface';

import { AllFlatEntityMaps } from 'src/engine/core-modules/common/types/all-flat-entity-maps.type';
import { deleteFlatEntityFromFlatEntityMapsOrThrow } from 'src/engine/core-modules/common/utils/delete-flat-entity-from-flat-entity-maps-or-throw.util';
import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/core-modules/common/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { findFlatObjectMetadataInFlatObjectMetadataMapsOrThrow } from 'src/engine/metadata-modules/flat-object-metadata-maps/utils/find-flat-object-metadata-in-flat-object-metadata-maps-or-throw.util';
import { IndexMetadataEntity } from 'src/engine/metadata-modules/index-metadata/index-metadata.entity';
import { type DeleteIndexAction } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/workspace-migration-index-action-v2';
import { type WorkspaceMigrationActionRunnerArgs } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/types/workspace-migration-action-runner-args.type';
import { getWorkspaceSchemaContextForMigration } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/utils/get-workspace-schema-context-for-migration.util';

@Injectable()
export class DeleteIndexActionHandlerService extends WorkspaceMigrationRunnerActionHandler(
  'delete_index',
) {
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
      allFlatEntityMaps: { flatObjectMetadataMaps, flatIndexMaps },
      queryRunner,
      workspaceId,
    } = context;

    const flatIndexMetadataToDelete = findFlatEntityByIdInFlatEntityMapsOrThrow(
      {
        flatEntityId: action.flatIndexMetadataId,
        flatEntityMaps: flatIndexMaps,
      },
    );

    const flatObjectMetadata =
      findFlatObjectMetadataInFlatObjectMetadataMapsOrThrow({
        flatObjectMetadataMaps,
        objectMetadataId: flatIndexMetadataToDelete.objectMetadataId,
      });
    const { schemaName, tableName } = getWorkspaceSchemaContextForMigration({
      workspaceId,
      flatObjectMetadata,
    });

    await queryRunner.dropIndex(
      `${schemaName}.${tableName}`,
      flatIndexMetadataToDelete.name,
    );
  }
}
