import { type WorkspaceMigrationActionService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/workspace-schema-migration-runner-v2/core/interfaces/workspace-migration-action-service.interface';

import { type CreateIndexAction } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/workspace-migration-index-action-v2';
import { WorkspaceMigrationActionHandler } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/workspace-schema-migration-runner-v2/core/decorators/workspace-migration-action-handler.decorator';
import { type SchemaActionContext } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/workspace-schema-migration-runner-v2/core/types/schema-action-context.type';

@WorkspaceMigrationActionHandler('create_index')
export class IndexCreateActionService
  implements WorkspaceMigrationActionService<CreateIndexAction>
{
  async execute(
    _context: SchemaActionContext<CreateIndexAction>,
  ): Promise<void> {
    throw new Error('Not implemented');
  }
}
