import { type WorkspaceMigrationActionService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/workspace-schema-migration-runner/core/interfaces/workspace-migration-action-service.interface';

import { type DeleteIndexAction } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/workspace-migration-index-action-v2';
import { WorkspaceMigrationActionHandler } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/workspace-schema-migration-runner/core/decorators/workspace-migration-action-handler.decorator';
import { type SchemaActionContext } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/workspace-schema-migration-runner/core/types/schema-action-context.type';

@WorkspaceMigrationActionHandler('delete_index')
export class IndexDeleteActionService
  implements WorkspaceMigrationActionService<DeleteIndexAction>
{
  async execute(
    _context: SchemaActionContext<DeleteIndexAction>,
  ): Promise<void> {
    throw new Error('Not implemented');
  }
}
