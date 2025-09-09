import { Injectable } from '@nestjs/common';

import { WorkspaceMigrationRunnerActionHandler } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/interfaces/workspace-migration-runner-action-handler-service.interface';

import { FlatIndexMetadata } from 'src/engine/metadata-modules/flat-index-metadata/types/flat-index-metadata.type';
import { findFlatObjectMetadataInFlatObjectMetadataMapsOrThrow } from 'src/engine/metadata-modules/flat-object-metadata-maps/utils/find-flat-object-metadata-in-flat-object-metadata-maps-or-throw.util';
import { IndexMetadataEntity } from 'src/engine/metadata-modules/index-metadata/index-metadata.entity';
import { UpdateIndexAction } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/workspace-migration-index-action-v2';
import { computeIndexCreationQuery } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/action-handlers/index/utils/compute-index-creation-query.util';
import { type WorkspaceMigrationActionRunnerArgs } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/types/workspace-migration-action-runner-args.type';
import { fromWorkspaceMigrationUpdateActionToPartialEntity } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/utils/from-workspace-migration-update-action-to-partial-field-or-object-entity.util';
import { getWorkspaceSchemaContextForMigration } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/utils/get-workspace-schema-context-for-migration.util';

@Injectable()
export class UpdateIndexActionHandlerService extends WorkspaceMigrationRunnerActionHandler(
  'update_index',
) {
  async executeForMetadata(
    context: WorkspaceMigrationActionRunnerArgs<UpdateIndexAction>,
  ): Promise<void> {
    const { action, queryRunner } = context;
    const fieldMetadataRepository =
      queryRunner.manager.getRepository<IndexMetadataEntity>(
        IndexMetadataEntity,
      );

    const { flatIndexMetadataId } = action;

    await fieldMetadataRepository.update(
      flatIndexMetadataId,
      fromWorkspaceMigrationUpdateActionToPartialEntity(action),
    );
  }

  async executeForWorkspaceSchema(
    context: WorkspaceMigrationActionRunnerArgs<UpdateIndexAction>,
  ): Promise<void> {
    const { action, flatObjectMetadataMaps, queryRunner, workspaceId } =
      context;
    // TODO find from cache
    const fromFlatIndexMetadata = {
      id: action.flatIndexMetadataId,
    } as FlatIndexMetadata;

    const flatObjectMetadata =
      findFlatObjectMetadataInFlatObjectMetadataMapsOrThrow({
        flatObjectMetadataMaps,
        objectMetadataId: fromFlatIndexMetadata.objectMetadataId,
      });
    const { schemaName, tableName } = getWorkspaceSchemaContextForMigration({
      workspaceId,
      flatObjectMetadata,
    });

    await queryRunner.dropIndex(
      `${schemaName}.${tableName}`,
      fromFlatIndexMetadata.name,
    );

    const toFlatIndexMetadata = {
      ...fromFlatIndexMetadata,
      ...fromWorkspaceMigrationUpdateActionToPartialEntity(action),
    };

    const indexCreationQuery = await computeIndexCreationQuery({
      flatObjectMetadataMaps,
      flatIndexMetadata: toFlatIndexMetadata,
      schemaName,
      tableName,
    });

    await queryRunner.query(indexCreationQuery);
  }
}
