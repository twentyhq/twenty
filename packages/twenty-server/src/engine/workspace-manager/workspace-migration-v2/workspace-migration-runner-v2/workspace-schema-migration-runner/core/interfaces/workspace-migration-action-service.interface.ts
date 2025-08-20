import {
  type ExtractAction,
  type WorkspaceMigrationActionTypeV2,
} from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/workspace-migration-action-common-v2';
import { type WorkspaceMigrationActionRunnerArgs } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/types/workspace-migration-action-runner-args.type';
import { WorkspaceMigrationActionHandler } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/workspace-schema-migration-runner/core/decorators/workspace-migration-action-handler.decorator';

export interface WorkspaceMigrationActionService<
  T extends WorkspaceMigrationActionTypeV2,
> {
  execute(
    context: WorkspaceMigrationActionRunnerArgs<ExtractAction<T>>,
  ): Promise<void>;
}

export abstract class BaseWorkspaceMigrationActionService<
  T extends WorkspaceMigrationActionTypeV2,
> implements WorkspaceMigrationActionService<T>
{
  abstract execute(
    context: WorkspaceMigrationActionRunnerArgs<ExtractAction<T>>,
  ): Promise<void>;
}

export function createWorkspaceMigrationActionHandler<
  T extends WorkspaceMigrationActionTypeV2,
>(actionType: T) {
  @WorkspaceMigrationActionHandler(actionType)
  abstract class ActionServiceBase extends BaseWorkspaceMigrationActionService<T> {}

  return ActionServiceBase;
}
