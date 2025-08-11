import { Injectable } from '@nestjs/common';

import {
  type CreateIndexAction,
  type DeleteIndexAction,
  type WorkspaceMigrationIndexActionTypeV2,
} from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/workspace-migration-index-action-v2';
import { type RunnerMethodForActionType } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/types/runner-method-for-action-type';
import { type WorkspaceMigrationActionRunnerArgs } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/types/workspace-migration-action-runner-args.type';

@Injectable()
export class WorkspaceSchemaIndexActionRunnerService
  implements
    RunnerMethodForActionType<WorkspaceMigrationIndexActionTypeV2, 'schema'>
{
  runDeleteIndexSchemaMigration = async (
    _action: WorkspaceMigrationActionRunnerArgs<DeleteIndexAction>,
  ) => {
    return;
  };
  runCreateIndexSchemaMigration = async (
    _action: WorkspaceMigrationActionRunnerArgs<CreateIndexAction>,
  ) => {
    return;
  };
}
