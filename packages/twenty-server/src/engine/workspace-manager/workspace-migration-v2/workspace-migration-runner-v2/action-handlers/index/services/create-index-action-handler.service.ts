import { Injectable } from '@nestjs/common';

import { WorkspaceMigrationRunnerActionHandler } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/interfaces/workspace-migration-runner-action-handler-service.interface';

import { type CreateIndexAction } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/workspace-migration-index-action-v2';
import { type WorkspaceMigrationActionRunnerArgs } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/types/workspace-migration-action-runner-args.type';

@Injectable()
export class CreateIndexActionHandlerService extends WorkspaceMigrationRunnerActionHandler(
  'create_index',
) {
  async executeForMetadata(
    _context: WorkspaceMigrationActionRunnerArgs<CreateIndexAction>,
  ): Promise<void> {
    throw new Error('Not implemented');
  }

  async executeForWorkspaceSchema(
    _context: WorkspaceMigrationActionRunnerArgs<CreateIndexAction>,
  ): Promise<void> {
    throw new Error('Not implemented');
  }
}
