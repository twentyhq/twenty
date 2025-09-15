import { SetMetadata } from '@nestjs/common';

import { type AllFlatEntityMaps } from 'src/engine/core-modules/common/types/all-flat-entity-maps.type';
import {
  type WorkspaceMigrationActionV2,
  type ExtractAction,
  type WorkspaceMigrationActionTypeV2,
} from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/workspace-migration-action-common-v2';
import { WORKSPACE_MIGRATION_ACTION_HANDLER_METADATA_KEY } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/constants/workspace-migration-action-handler-metadata-key.constant';
import { type WorkspaceMigrationActionRunnerArgs } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/types/workspace-migration-action-runner-args.type';

export interface WorkspaceMigrationRunnerActionHandlerService<
  T extends WorkspaceMigrationActionTypeV2,
> {
  execute(
    context: WorkspaceMigrationActionRunnerArgs<ExtractAction<T>>,
  ): Promise<AllFlatEntityMaps>;
}

export type OptimisticallyApplyActionOnAllFlatEntityMapsArgs<
  T extends WorkspaceMigrationActionV2,
> = Pick<WorkspaceMigrationActionRunnerArgs<T>, 'allFlatEntityMaps' | 'action'>;

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

  abstract optimisticallyApplyActionOnAllFlatEntityMaps(
    args: OptimisticallyApplyActionOnAllFlatEntityMapsArgs<ExtractAction<T>>,
  ): AllFlatEntityMaps;

  async execute(
    context: WorkspaceMigrationActionRunnerArgs<ExtractAction<T>>,
  ): Promise<AllFlatEntityMaps> {
    await Promise.all([
      this.executeForMetadata(context),
      this.executeForWorkspaceSchema(context),
    ]);

    return this.optimisticallyApplyActionOnAllFlatEntityMaps({
      action: context.action,
      allFlatEntityMaps: context.allFlatEntityMaps,
    });
  }
}

export function WorkspaceMigrationRunnerActionHandler<
  T extends WorkspaceMigrationActionTypeV2,
>(actionType: T): typeof BaseWorkspaceMigrationRunnerActionHandlerService<T> {
  abstract class ActionHandlerService extends BaseWorkspaceMigrationRunnerActionHandlerService<T> {}

  SetMetadata(
    WORKSPACE_MIGRATION_ACTION_HANDLER_METADATA_KEY,
    actionType,
  )(ActionHandlerService);

  return ActionHandlerService;
}
