import { Injectable } from '@nestjs/common';

import { WorkspaceMigrationRunnerActionHandler } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/interfaces/workspace-migration-runner-action-handler-service.interface';

import { IndexFieldMetadataEntity } from 'src/engine/metadata-modules/index-metadata/index-field-metadata.entity';
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
    const indexFieldMetadataRepository =
      queryRunner.manager.getRepository<IndexFieldMetadataEntity>(
        IndexFieldMetadataEntity,
      );

    const { flatIndexFieldMetadata } = action;

    await indexFieldMetadataRepository.save(flatIndexFieldMetadata);
  }

  async executeForWorkspaceSchema(
    _context: WorkspaceMigrationActionRunnerArgs<CreateIndexFieldAction>,
  ): Promise<void> {
    // Handled in create_index handler
    return;
  }
}
