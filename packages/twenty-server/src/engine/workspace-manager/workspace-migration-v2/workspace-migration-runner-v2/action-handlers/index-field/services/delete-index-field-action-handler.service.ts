import { Injectable } from '@nestjs/common';

import { In } from 'typeorm';

import { WorkspaceMigrationRunnerActionHandler } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/interfaces/workspace-migration-runner-action-handler-service.interface';

import { IndexFieldMetadataEntity } from 'src/engine/metadata-modules/index-metadata/index-field-metadata.entity';
import { DeleteIndexFieldAction } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/workspace-migration-index-field-action-v2';
import { type WorkspaceMigrationActionRunnerArgs } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/types/workspace-migration-action-runner-args.type';

@Injectable()
export class DeleteIndexFieldActionHandlerService extends WorkspaceMigrationRunnerActionHandler(
  'delete_index_field',
) {
  async executeForMetadata(
    context: WorkspaceMigrationActionRunnerArgs<DeleteIndexFieldAction>,
  ): Promise<void> {
    const { action, queryRunner } = context;
    const fieldMetadataRepository =
      queryRunner.manager.getRepository<IndexFieldMetadataEntity>(
        IndexFieldMetadataEntity,
      );

    const { flatIndexFieldMetadataId } = action;

    await fieldMetadataRepository.delete({
      id: In([flatIndexFieldMetadataId]),
    });
  }

  async executeForWorkspaceSchema(
    _context: WorkspaceMigrationActionRunnerArgs<DeleteIndexFieldAction>,
  ): Promise<void> {
    throw new Error('Not implemented');
  }
}
