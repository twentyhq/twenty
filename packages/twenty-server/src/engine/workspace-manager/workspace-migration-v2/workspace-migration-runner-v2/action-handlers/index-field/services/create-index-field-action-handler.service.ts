import { Injectable } from '@nestjs/common';

import { WorkspaceMigrationRunnerActionHandler } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/interfaces/workspace-migration-runner-action-handler-service.interface';

import { IndexMetadataEntity } from 'src/engine/metadata-modules/index-metadata/index-metadata.entity';
import { CreateIndexFieldAction } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/workspace-migration-index-field-action-v2';
import { type WorkspaceMigrationActionRunnerArgs } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/types/workspace-migration-action-runner-args.type';

@Injectable()
export class CreateIndexFieldActionHandlerService extends WorkspaceMigrationRunnerActionHandler(
  'create_index_field',
) {
  async executeForMetadata(
    context: WorkspaceMigrationActionRunnerArgs<CreateIndexFieldAction>,
  ): Promise<void> {
    const { action, queryRunner } = context;
    const fieldMetadataRepository =
      queryRunner.manager.getRepository<IndexMetadataEntity>(
        IndexMetadataEntity,
      );

    const { flatIndexFieldMetadata } = action;

    await fieldMetadataRepository.save(flatIndexFieldMetadata);
  }

  async executeForWorkspaceSchema(
    _context: WorkspaceMigrationActionRunnerArgs<CreateIndexFieldAction>,
  ): Promise<void> {
    // Handled in create_index handler
    return;
  }
}
