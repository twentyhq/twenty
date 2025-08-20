import { createWorkspaceMigrationActionHandler } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/workspace-schema-migration-runner/core/interfaces/workspace-migration-action-service.interface';

import { type DeleteIndexAction } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/workspace-migration-index-action-v2';
import { type WorkspaceMigrationActionRunnerArgs } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/types/workspace-migration-action-runner-args.type';

export class DeleteIndexActionHandlerService extends createWorkspaceMigrationActionHandler(
  'delete_index',
) {
  async execute(
    _context: WorkspaceMigrationActionRunnerArgs<DeleteIndexAction>,
  ): Promise<void> {
    throw new Error('Not implemented');
  }
}
