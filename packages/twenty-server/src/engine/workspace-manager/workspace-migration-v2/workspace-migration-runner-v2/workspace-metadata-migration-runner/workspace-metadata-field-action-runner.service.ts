import { Injectable } from '@nestjs/common';

import {
  CreateFieldAction,
  DeleteFieldAction,
  UpdateFieldAction,
  WorkspaceMigrationFieldActionTypeV2,
} from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/workspace-migration-field-action-v2';
import { RunnerMethodForActionType } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/types/runner-method-for-action-type';
import { WorkspaceMigrationActionRunnerArgs } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/types/workspace-migration-action-runner-args.type';

@Injectable()
export class WorkspaceMetadataFieldActionRunnerService
  implements
    RunnerMethodForActionType<WorkspaceMigrationFieldActionTypeV2, 'metadata'>
{
  runDeleteFieldMetadataMigration = async (
    _action: WorkspaceMigrationActionRunnerArgs<DeleteFieldAction>,
  ) => {
    return;
  };
  runCreateFieldMetadataMigration = async (
    _action: WorkspaceMigrationActionRunnerArgs<CreateFieldAction>,
  ) => {
    return;
  };
  runUpdateFieldMetadataMigration = async (
    _action: WorkspaceMigrationActionRunnerArgs<UpdateFieldAction>,
  ) => {
    return;
  };
}
