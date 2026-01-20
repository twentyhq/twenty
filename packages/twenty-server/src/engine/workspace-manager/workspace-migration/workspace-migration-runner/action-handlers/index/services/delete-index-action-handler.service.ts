import { Injectable } from '@nestjs/common';

import { WorkspaceMigrationRunnerActionHandler } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/interfaces/workspace-migration-runner-action-handler-service.interface';

import { findFlatEntityByUniversalIdentifierOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier-or-throw.util';
import { WorkspaceSchemaManagerService } from 'src/engine/twenty-orm/workspace-schema-manager/workspace-schema-manager.service';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { type DeleteIndexAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/index/types/workspace-migration-index-action';
import {
  deleteIndexMetadata,
  dropIndexFromWorkspaceSchema,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/action-handlers/index/utils/index-action-handler.utils';
import { type WorkspaceMigrationActionRunnerArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/workspace-migration-action-runner-args.type';

@Injectable()
export class DeleteIndexActionHandlerService extends WorkspaceMigrationRunnerActionHandler(
  'delete',
  'index',
) {
  constructor(
    private readonly workspaceSchemaManagerService: WorkspaceSchemaManagerService,
  ) {
    super();
  }

  async executeForMetadata(
    context: WorkspaceMigrationActionRunnerArgs<DeleteIndexAction>,
  ): Promise<void> {
    const { action, queryRunner, allFlatEntityMaps, workspaceId } = context;
    const { universalIdentifier } = action;

    const flatIndex = findFlatEntityByUniversalIdentifierOrThrow({
      flatEntityMaps: allFlatEntityMaps.flatIndexMaps,
      universalIdentifier,
    });

    await deleteIndexMetadata({
      entityId: flatIndex.id,
      queryRunner,
      workspaceId,
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
    const { universalIdentifier } = action;

    const flatIndexMetadataToDelete =
      findFlatEntityByUniversalIdentifierOrThrow({
        universalIdentifier,
        flatEntityMaps: flatIndexMaps,
      });

    const schemaName = getWorkspaceSchemaName(workspaceId);

    await dropIndexFromWorkspaceSchema({
      indexName: flatIndexMetadataToDelete.name,
      workspaceSchemaManagerService: this.workspaceSchemaManagerService,
      queryRunner,
      schemaName,
    });
  }
}
