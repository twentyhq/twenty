import { Injectable } from '@nestjs/common';

import { In } from 'typeorm';

import { WorkspaceMigrationRunnerActionHandler } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/interfaces/workspace-migration-runner-action-handler-service.interface';

import { FlatIndexMetadata } from 'src/engine/metadata-modules/flat-index-metadata/types/flat-index-metadata.type';
import { findFlatObjectMetadataInFlatObjectMetadataMapsOrThrow } from 'src/engine/metadata-modules/flat-object-metadata-maps/utils/find-flat-object-metadata-in-flat-object-metadata-maps-or-throw.util';
import { IndexMetadataEntity } from 'src/engine/metadata-modules/index-metadata/index-metadata.entity';
import { type DeleteIndexAction } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/workspace-migration-index-action-v2';
import { type WorkspaceMigrationActionRunnerArgs } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/types/workspace-migration-action-runner-args.type';
import { getWorkspaceSchemaContextForMigration } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/utils/get-workspace-schema-context-for-migration.util';

@Injectable()
export class DeleteIndexActionHandlerService extends WorkspaceMigrationRunnerActionHandler(
  'delete_index',
) {
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
      id: In([flatIndexMetadataId]),
    });
  }

  async executeForWorkspaceSchema(
    context: WorkspaceMigrationActionRunnerArgs<DeleteIndexAction>,
  ): Promise<void> {
    const { action, flatObjectMetadataMaps, queryRunner, workspaceId } =
      context;

    // TODO find in cache
    const flatIndexMetadataToDelete = {
      id: action.flatIndexMetadataId,
    } as FlatIndexMetadata;

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
