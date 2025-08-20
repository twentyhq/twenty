import {
  type ExtractAction,
  type WorkspaceMigrationActionTypeV2,
} from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/workspace-migration-action-common-v2';
import { WorkspaceMigrationRunnerActionHandler } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/decorators/workspace-migration-runner-action-handler.decorator';
import { type WorkspaceMigrationActionRunnerArgs } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/types/workspace-migration-action-runner-args.type';

export interface WorkspaceMigrationRunnerActionHandlerService<
  T extends WorkspaceMigrationActionTypeV2,
> {
  execute(
    context: WorkspaceMigrationActionRunnerArgs<ExtractAction<T>>,
  ): Promise<void>;
}

export abstract class BaseWorkspaceMigrationRunnerActionHandlerService<
  T extends WorkspaceMigrationActionTypeV2,
> implements WorkspaceMigrationRunnerActionHandlerService<T>
{
  abstract executeForMetadata(
    context: WorkspaceMigrationActionRunnerArgs<ExtractAction<T>>,
  ): Promise<void>;

  abstract executeForWorkspaceSchema(
    context: WorkspaceMigrationActionRunnerArgs<ExtractAction<T>>,
  ): Promise<void>;

  async execute(
    context: WorkspaceMigrationActionRunnerArgs<ExtractAction<T>>,
  ): Promise<void> {
    await Promise.all([
      this.executeForMetadata(context),
      this.executeForWorkspaceSchema(context),
    ]);
  }
}

export function createWorkspaceMigrationRunnerActionHandler<
  T extends WorkspaceMigrationActionTypeV2,
>(actionType: T) {
  @WorkspaceMigrationRunnerActionHandler(actionType)
  abstract class ActionServiceBase extends BaseWorkspaceMigrationRunnerActionHandlerService<T> {}

  return ActionServiceBase;
}
