import { SetMetadata } from '@nestjs/common';

import { type AllFlatEntityMaps } from 'src/engine/core-modules/common/types/all-flat-entity-maps.type';
import {
  type ExtractAction,
  type WorkspaceMigrationActionTypeV2,
  type WorkspaceMigrationActionV2,
} from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/workspace-migration-action-common-v2';
import { WORKSPACE_MIGRATION_ACTION_HANDLER_METADATA_KEY } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/constants/workspace-migration-action-handler-metadata-key.constant';
import { type WorkspaceMigrationActionRunnerArgs } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/types/workspace-migration-action-runner-args.type';

export interface WorkspaceMigrationRunnerActionHandlerService<
  TActionType extends WorkspaceMigrationActionTypeV2,
> {
  execute(
    context: WorkspaceMigrationActionRunnerArgs<ExtractAction<TActionType>>,
  ): Promise<Partial<AllFlatEntityMaps>>;

  rollback(
    context: WorkspaceMigrationActionRunnerArgs<ExtractAction<TActionType>>,
  ): Promise<void>;
}

export type OptimisticallyApplyActionOnAllFlatEntityMapsArgs<
  TActionType extends WorkspaceMigrationActionV2,
> = Pick<
  WorkspaceMigrationActionRunnerArgs<TActionType>,
  'allFlatEntityMaps' | 'action'
>;

export abstract class BaseWorkspaceMigrationRunnerActionHandlerService<
  TActionType extends WorkspaceMigrationActionTypeV2,
> implements WorkspaceMigrationRunnerActionHandlerService<TActionType>
{
  executeForMetadata(
    // eslint-disable-next-line unused-imports/no-unused-vars
    context: WorkspaceMigrationActionRunnerArgs<ExtractAction<TActionType>>,
  ): Promise<void> {
    return Promise.resolve();
  }

  executeForWorkspaceSchema(
    // eslint-disable-next-line unused-imports/no-unused-vars
    context: WorkspaceMigrationActionRunnerArgs<ExtractAction<TActionType>>,
  ): Promise<void> {
    return Promise.resolve();
  }

  optimisticallyApplyActionOnAllFlatEntityMaps(
    args: OptimisticallyApplyActionOnAllFlatEntityMapsArgs<
      ExtractAction<TActionType>
    >,
  ): Partial<AllFlatEntityMaps> {
    return args.allFlatEntityMaps;
  }

  rollbackForMetadata(
    // eslint-disable-next-line unused-imports/no-unused-vars
    context: WorkspaceMigrationActionRunnerArgs<ExtractAction<TActionType>>,
  ): Promise<void> {
    return Promise.resolve();
  }

  async execute(
    context: WorkspaceMigrationActionRunnerArgs<ExtractAction<TActionType>>,
  ): Promise<Partial<AllFlatEntityMaps>> {
    await Promise.all([
      this.executeForMetadata(context),
      this.executeForWorkspaceSchema(context),
    ]);

    return this.optimisticallyApplyActionOnAllFlatEntityMaps({
      action: context.action,
      allFlatEntityMaps: context.allFlatEntityMaps,
    });
  }

  async rollback(
    context: WorkspaceMigrationActionRunnerArgs<ExtractAction<TActionType>>,
  ): Promise<void> {
    await this.rollbackForMetadata(context);
  }
}

export function WorkspaceMigrationRunnerActionHandler<
  TActionType extends WorkspaceMigrationActionTypeV2,
>(
  actionType: TActionType,
): typeof BaseWorkspaceMigrationRunnerActionHandlerService<TActionType> {
  abstract class ActionHandlerService extends BaseWorkspaceMigrationRunnerActionHandlerService<TActionType> {}

  SetMetadata(
    WORKSPACE_MIGRATION_ACTION_HANDLER_METADATA_KEY,
    actionType,
  )(ActionHandlerService);

  return ActionHandlerService;
}
