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
export class WorkspaceSchemaObjectActionRunnerService
  implements
    RunnerMethodForActionType<WorkspaceMigrationObjectActionTypeV2, 'schema'>
{
  runDeleteObjectSchemaMigration = async (
    _action: WorkspaceMigrationActionRunnerArgs<DeleteObjectAction>,
  ) => {
    return;
  };
  runCreateObjectSchemaMigration = async (
    _action: WorkspaceMigrationActionRunnerArgs<CreateObjectAction>,
  ) => {
    return;
  };
  runUpdateObjectSchemaMigration = async (
    _action: WorkspaceMigrationActionRunnerArgs<UpdateObjectAction>,
  ) => {
    return;
  };
}
