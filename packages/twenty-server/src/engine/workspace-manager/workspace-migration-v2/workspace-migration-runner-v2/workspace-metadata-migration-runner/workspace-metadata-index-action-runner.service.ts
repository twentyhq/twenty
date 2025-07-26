import { Injectable } from '@nestjs/common';

import {
  CreateIndexAction,
  DeleteIndexAction,
  WorkspaceMigrationIndexActionTypeV2,
} from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/workspace-migration-index-action-v2';
import { RunnerMethodForActionType } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/types/runner-method-for-action-type';
import { WorkspaceMigrationActionRunnerArgs } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/types/workspace-migration-action-runner-args.type';

@Injectable()
export class WorkspaceMetadataIndexActionRunnerService
  implements
    RunnerMethodForActionType<WorkspaceMigrationIndexActionTypeV2, 'metadata'>
{
  runDeleteIndexMetadataMigration = async (
    _action: WorkspaceMigrationActionRunnerArgs<DeleteIndexAction>,
  ) => {
    return;
  };
  runCreateIndexMetadataMigration = async (
    _action: WorkspaceMigrationActionRunnerArgs<CreateIndexAction>,
  ) => {
    return;
  };
}
