import { Injectable } from '@nestjs/common';

import { WorkspaceMigrationObjectInput } from 'src/engine/workspace-manager/workspace-migration-v2/types/workspace-migration-object-input';
import { WorkspaceMigrationV2 } from 'src/engine/workspace-manager/workspace-migration-v2/types/workspace-migration-v2';
import { buildWorkspaceObjectMigrationV2 } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/workspace-migration-object-builder-v2.service copy';

type WorkspaceMigrationBuilderV2ServiceArgs = {
  from: WorkspaceMigrationObjectInput[];
  to: WorkspaceMigrationObjectInput[];
};
@Injectable()
export class WorkspaceMigrationBuilderV2Service {
  constructor() {}

  build({
    from,
    to,
  }: WorkspaceMigrationBuilderV2ServiceArgs): WorkspaceMigrationV2[] {
    const objectMetadataActions = buildWorkspaceObjectMigrationV2({
      from,
      to,
    });

    return objectMetadataActions;
  }
}
