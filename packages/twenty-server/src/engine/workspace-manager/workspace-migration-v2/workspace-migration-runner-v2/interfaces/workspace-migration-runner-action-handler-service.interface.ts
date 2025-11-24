import { Inject, SetMetadata } from '@nestjs/common';

import { AllMetadataName } from 'twenty-shared/metadata';

import { LoggerService } from 'src/engine/core-modules/logger/logger.service';
import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { MetadataRelatedFlatEntityMapsKeys } from 'src/engine/metadata-modules/flat-entity/types/metadata-related-flat-entity-maps-keys.type';
import { MetadataToFlatEntityMapsKey } from 'src/engine/metadata-modules/flat-entity/types/metadata-to-flat-entity-maps-key';
import { FromWorkspaceMigrationActionToMetadataName } from 'src/engine/metadata-modules/flat-entity/types/metadata-workspace-migration-action.type';
import {
  type ExtractAction,
  type WorkspaceMigrationActionTypeV2,
  type WorkspaceMigrationActionV2,
} from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/workspace-migration-action-common-v2';
import { WORKSPACE_MIGRATION_ACTION_HANDLER_METADATA_KEY } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/constants/workspace-migration-action-handler-metadata-key.constant';
import { type WorkspaceMigrationActionRunnerArgs } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/types/workspace-migration-action-runner-args.type';

// TODO deprecated prastoin
export type OptimisticallyApplyActionOnAllFlatEntityMapsArgs<
  TActionType extends WorkspaceMigrationActionV2,
> = Pick<
  WorkspaceMigrationActionRunnerArgs<TActionType>,
  'allFlatEntityMaps' | 'action'
>;
///

export abstract class BaseWorkspaceMigrationRunnerActionHandlerService<
  TActionType extends WorkspaceMigrationActionTypeV2,
  TMetadataName extends
    AllMetadataName = FromWorkspaceMigrationActionToMetadataName<TActionType>,
> {
  public actionType: TActionType;

  @Inject(LoggerService)
  protected readonly logger: LoggerService;

  executeForMetadata(
    _context: WorkspaceMigrationActionRunnerArgs<ExtractAction<TActionType>>,
  ): Promise<void> {
    return Promise.resolve();
  }

  executeForWorkspaceSchema(
    _context: WorkspaceMigrationActionRunnerArgs<ExtractAction<TActionType>>,
  ): Promise<void> {
    return Promise.resolve();
  }

  optimisticallyApplyActionOnAllFlatEntityMaps(
    args: OptimisticallyApplyActionOnAllFlatEntityMapsArgs<
      ExtractAction<TActionType>
    >,
  ): Pick<
    AllFlatEntityMaps,
    | MetadataRelatedFlatEntityMapsKeys<TMetadataName>
    | MetadataToFlatEntityMapsKey<TMetadataName>
  > {
    return args.allFlatEntityMaps;
  }

  rollbackForMetadata(
    _context: WorkspaceMigrationActionRunnerArgs<ExtractAction<TActionType>>,
  ): Promise<void> {
    return Promise.resolve();
  }

  async execute(
    context: WorkspaceMigrationActionRunnerArgs<ExtractAction<TActionType>>,
  ): Promise<
    Pick<
      AllFlatEntityMaps,
      | MetadataRelatedFlatEntityMapsKeys<TMetadataName>
      | MetadataToFlatEntityMapsKey<TMetadataName>
    >
  > {
    try {
      await Promise.all([
        this.asyncMethodPerformanceMetricWrapper({
          label: 'executeForMetadata',
          method: async () => this.executeForMetadata(context),
        }),
        this.asyncMethodPerformanceMetricWrapper({
          label: 'executeForWorkspaceSchema',
          method: async () => this.executeForWorkspaceSchema(context),
        }),
      ]);

      return this.optimisticallyApplyActionOnAllFlatEntityMaps({
        action: context.action,
        allFlatEntityMaps: context.allFlatEntityMaps,
      });
    } catch (error) {
      this.logger.error(`${this.actionType} execution failed`, error);
      throw error;
    }
  }

  async rollback(
    context: WorkspaceMigrationActionRunnerArgs<ExtractAction<TActionType>>,
  ): Promise<void> {
    await this.rollbackForMetadata(context);
  }

  private async asyncMethodPerformanceMetricWrapper({
    label,
    method,
  }: {
    label: string;
    method: () => Promise<void>;
  }): Promise<void> {
    this.logger.time(
      'BaseWorkspaceMigrationRunnerActionHandlerService',
      `${this.actionType} ${label}`,
    );
    await method();
    this.logger.timeEnd(
      'BaseWorkspaceMigrationRunnerActionHandlerService',
      `${this.actionType} ${label}`,
    );
  }
}

export function WorkspaceMigrationRunnerActionHandler<
  TActionType extends WorkspaceMigrationActionTypeV2,
>(
  actionType: TActionType,
): typeof BaseWorkspaceMigrationRunnerActionHandlerService<TActionType> {
  abstract class ActionHandlerService extends BaseWorkspaceMigrationRunnerActionHandlerService<TActionType> {
    actionType = actionType;
  }

  SetMetadata(
    WORKSPACE_MIGRATION_ACTION_HANDLER_METADATA_KEY,
    actionType,
  )(ActionHandlerService);

  return ActionHandlerService;
}
