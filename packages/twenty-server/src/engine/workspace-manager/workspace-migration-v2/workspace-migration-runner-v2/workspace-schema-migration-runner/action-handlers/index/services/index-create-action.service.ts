import { type WorkspaceMigrationActionService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/workspace-schema-migration-runner/core/interfaces/workspace-migration-action-service.interface';

import { type CreateIndexAction } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/workspace-migration-index-action-v2';
import { WorkspaceMigrationActionRunnerArgs } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/types/workspace-migration-action-runner-args.type';
import { WorkspaceMigrationActionHandler } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/workspace-schema-migration-runner/core/decorators/workspace-migration-action-handler.decorator';

@WorkspaceMigrationActionHandler('create_index')
export class IndexCreateActionService
  implements WorkspaceMigrationActionService
{
  async execute(
    _context: WorkspaceMigrationActionRunnerArgs<CreateIndexAction>,
  ): Promise<void> {
    throw new Error('Not implemented');
  }
}
