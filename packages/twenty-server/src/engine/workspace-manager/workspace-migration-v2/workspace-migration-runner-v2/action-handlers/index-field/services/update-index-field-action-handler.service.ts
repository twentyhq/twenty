import { Injectable } from '@nestjs/common';

import { WorkspaceMigrationRunnerActionHandler } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/interfaces/workspace-migration-runner-action-handler-service.interface';

import { IndexFieldMetadataEntity } from 'src/engine/metadata-modules/index-metadata/index-field-metadata.entity';
import { UpdateIndexFieldAction } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/workspace-migration-index-field-action-v2';
import { type WorkspaceMigrationActionRunnerArgs } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/types/workspace-migration-action-runner-args.type';
import { fromWorkspaceMigrationUpdateActionToPartialEntity } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/utils/from-workspace-migration-update-action-to-partial-field-or-object-entity.util';

@Injectable()
export class UpdateIndexFieldActionHandlerService extends WorkspaceMigrationRunnerActionHandler(
  'update_index_field',
) {
  async executeForMetadata(
    context: WorkspaceMigrationActionRunnerArgs<UpdateIndexFieldAction>,
  ): Promise<void> {
    const { action, queryRunner } = context;
    const indexFieldMetadataRepository =
      queryRunner.manager.getRepository<IndexFieldMetadataEntity>(
        IndexFieldMetadataEntity,
      );

    const { flatIndexFieldMetadataId } = action;

    await indexFieldMetadataRepository.update(
      flatIndexFieldMetadataId,
      fromWorkspaceMigrationUpdateActionToPartialEntity(action),
    );
  }

  async executeForWorkspaceSchema(
    _context: WorkspaceMigrationActionRunnerArgs<UpdateIndexFieldAction>,
  ): Promise<void> {
    // Handled in update_index handler
    return;
  }
}
