import { Injectable } from '@nestjs/common';

import { WorkspaceMigrationActionV2 } from 'src/engine/workspace-manager/workspace-migration-v2/types/workspace-migration-action-v2';
import { WorkspaceMigrationObjectInput } from 'src/engine/workspace-manager/workspace-migration-v2/types/workspace-migration-object-input';
import { WorkspaceMigrationV2 } from 'src/engine/workspace-manager/workspace-migration-v2/types/workspace-migration-v2';

@Injectable()
export class WorkspaceMigrationBuilderV2Service {
  constructor() {}

  build(
    from: WorkspaceMigrationObjectInput,
    to: WorkspaceMigrationObjectInput,
  ): WorkspaceMigrationV2[] {
    const actions: WorkspaceMigrationActionV2[] = [];

    // Note: naive diff logic, need to call the diff lib used in the sync-metadata
    if (from.nameSingular !== to.nameSingular) {
      actions.push({
        type: 'update_object',
        object: { nameSingular: to.nameSingular },
      });
    }

    if (actions.length === 0) return [];

    return [{ actions }];
  }
}
