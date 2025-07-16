import { Injectable } from '@nestjs/common';

import {
  CreateObjectAction,
  DeleteObjectAction,
  UpdateObjectAction,
  WorkspaceMigrationObjectActionTypeV2,
} from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/workspace-migration-object-action-v2';
import { RunnerMethodForActionType } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/types/runner-method-for-action-type';
import { WorkspaceMigrationActionRunnerArgs } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/types/workspace-migration-action-runner-args.type';

@Injectable()
export class WorkspaceMetadataObjectActionRunnerService
  implements
    RunnerMethodForActionType<WorkspaceMigrationObjectActionTypeV2, 'metadata'>
{
  runDeleteObjectMetadataMigration = async (
    _action: WorkspaceMigrationActionRunnerArgs<DeleteObjectAction>,
  ) => {
    return;
  };
  runCreateObjectMetadataMigration = async (
    _action: WorkspaceMigrationActionRunnerArgs<CreateObjectAction>,
  ) => {
    return;
  };
  runUpdateObjectMetadataMigration = async (
    _action: WorkspaceMigrationActionRunnerArgs<UpdateObjectAction>,
  ) => {
    return;
  };
}
