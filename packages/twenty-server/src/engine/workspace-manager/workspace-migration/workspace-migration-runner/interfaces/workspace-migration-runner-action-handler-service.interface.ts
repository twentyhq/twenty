import { Inject, SetMetadata } from '@nestjs/common';

import { AllMetadataName } from 'twenty-shared/metadata';

import { LoggerService } from 'src/engine/core-modules/logger/logger.service';
import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { AllFlatEntityTypesByMetadataName } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-types-by-metadata-name';
import { MetadataRelatedFlatEntityMapsKeys } from 'src/engine/metadata-modules/flat-entity/types/metadata-related-flat-entity-maps-keys.type';
import { MetadataToFlatEntityMapsKey } from 'src/engine/metadata-modules/flat-entity/types/metadata-to-flat-entity-maps-key';
import { WorkspaceMigrationActionType } from 'src/engine/metadata-modules/flat-entity/types/metadata-workspace-migration-action.type';
import { IsMetadataRunnerUniversalMigrated } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/is-metadata-runner-universal-migrated.type';
import { TranspileActionUniversalToFlat } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/transpile-action-to-flat.type';
import {
  buildActionHandlerKey,
  type WorkspaceMigrationAction,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/workspace-migration-action-common';
import { WORKSPACE_MIGRATION_ACTION_HANDLER_METADATA_KEY } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/constants/workspace-migration-action-handler-metadata-key.constant';
import {
  WorkspaceMigrationActionExecutionException,
  WorkspaceMigrationActionExecutionExceptionCode,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/exceptions/workspace-migration-action-execution.exception';
import {
  WorkspaceMigrationRunnerException,
  WorkspaceMigrationRunnerExceptionCode,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/exceptions/workspace-migration-runner.exception';
import {
  WorkspaceMigrationActionRunnerContext,
  type WorkspaceMigrationActionRunnerArgs,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/workspace-migration-action-runner-args.type';
import { optimisticallyApplyCreateActionOnAllFlatEntityMaps } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/utils/optimistically-apply-create-action-on-all-flat-entity-maps.util';
import { optimisticallyApplyDeleteActionOnAllFlatEntityMaps } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/utils/optimistically-apply-delete-action-on-all-flat-entity-maps.util';
import { optimisticallyApplyUpdateActionOnAllFlatEntityMaps } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/utils/optimistically-apply-update-action-on-all-flat-entity-maps.util';

type PrastoinNoName<TAction extends WorkspaceMigrationAction> =
  IsMetadataRunnerUniversalMigrated<TAction['metadataName']> extends true
    ? TranspileActionUniversalToFlat<TAction>
    : TAction;

type OptimisticallyApplyActionOnAllFlatEntityMapsArgs<
  TActionType extends WorkspaceMigrationAction,
> = {
  action: TActionType;
  allFlatEntityMaps: AllFlatEntityMaps;
};
export abstract class BaseWorkspaceMigrationRunnerActionHandlerService<
  TActionType extends WorkspaceMigrationActionType,
  TMetadataName extends AllMetadataName,
  TAction extends
    WorkspaceMigrationAction = AllFlatEntityTypesByMetadataName[TMetadataName]['actions'][TActionType],
> {
  public actionType: TActionType;
  public metadataName: TMetadataName;

  @Inject(LoggerService)
  protected readonly logger: LoggerService;

  public async transpileUniversalActionToFlatAction(
    context: WorkspaceMigrationActionRunnerArgs<TAction>,
  ): Promise<PrastoinNoName<TAction>> {
    switch (true) {
      // Actions add custom properties to base actions that custom transpilers ( next when migrated logic function create and index update too)
      case context.action.metadataName === 'objectMetadata' &&
        context.action.type === 'create':
      case context.action.metadataName === 'fieldMetadata' &&
        context.action.type === 'create': {
        throw new WorkspaceMigrationActionExecutionException({
          code: WorkspaceMigrationActionExecutionExceptionCode.INTERNAL_SERVER_ERROR,
          message: `transpileUniversalActionToFlatAction should be implemented for ${context.action.type} ${context.action.metadataName}`,
        });
      }
    }

    return context.action as PrastoinNoName<TAction>;
  }

  executeForMetadata(
    _context: WorkspaceMigrationActionRunnerContext<TAction>,
  ): Promise<void> {
    return Promise.resolve();
  }

  executeForWorkspaceSchema(
    _context: WorkspaceMigrationActionRunnerContext<TAction>,
  ): Promise<void> {
    return Promise.resolve();
  }

  private optimisticallyApplyActionOnAllFlatEntityMaps({
    action,
    allFlatEntityMaps,
  }: OptimisticallyApplyActionOnAllFlatEntityMapsArgs<TAction>): Pick<
    AllFlatEntityMaps,
    | MetadataRelatedFlatEntityMapsKeys<TMetadataName>
    | MetadataToFlatEntityMapsKey<TMetadataName>
  > {
    switch (action.type) {
      case 'create': {
        return optimisticallyApplyCreateActionOnAllFlatEntityMaps({
          action,
          allFlatEntityMaps,
        });
      }
      case 'delete': {
        return optimisticallyApplyDeleteActionOnAllFlatEntityMaps({
          action,
          allFlatEntityMaps,
        });
      }
      case 'update': {
        return optimisticallyApplyUpdateActionOnAllFlatEntityMaps({
          action,
          allFlatEntityMaps,
        });
      }
    }
  }

  rollbackForMetadata(
    _context: Omit<WorkspaceMigrationActionRunnerArgs<TAction>, 'queryRunner'>,
  ): Promise<void> {
    return Promise.resolve();
  }

  async execute(
    context: WorkspaceMigrationActionRunnerArgs<TAction>,
  ): Promise<
    Pick<
      AllFlatEntityMaps,
      | MetadataRelatedFlatEntityMapsKeys<TMetadataName>
      | MetadataToFlatEntityMapsKey<TMetadataName>
    >
  > {
    const flatAction = await this.transpileUniversalActionToFlatAction(context);

    const [metadataResult, workspaceSchemaResult] = await Promise.allSettled([
      this.asyncMethodPerformanceMetricWrapper({
        label: 'executeForMetadata',
        method: async () => this.executeForMetadata({ ...context, flatAction }),
      }),
      this.asyncMethodPerformanceMetricWrapper({
        label: 'executeForWorkspaceSchema',
        method: async () =>
          this.executeForWorkspaceSchema({ ...context, flatAction }),
      }),
    ]);

    const hasMetadataError = metadataResult.status === 'rejected';
    const hasWorkspaceSchemaError = workspaceSchemaResult.status === 'rejected';

    if (hasMetadataError || hasWorkspaceSchemaError) {
      throw new WorkspaceMigrationRunnerException({
        action: context.action,
        errors: {
          ...(hasMetadataError && { metadata: metadataResult.reason }),
          ...(hasWorkspaceSchemaError && {
            workspaceSchema: workspaceSchemaResult.reason,
          }),
        },
        code: WorkspaceMigrationRunnerExceptionCode.EXECUTION_FAILED,
      });
    }

    const partialOptimisticCache =
      this.optimisticallyApplyActionOnAllFlatEntityMaps({
        action: context.action, // Not sure about that this should get the flat action hein
        allFlatEntityMaps: context.allFlatEntityMaps,
      });

    return partialOptimisticCache;
  }

  async rollback(
    context: Omit<WorkspaceMigrationActionRunnerArgs<TAction>, 'queryRunner'>,
  ): Promise<void> {
    try {
      await this.rollbackForMetadata(context);
    } catch (error) {
      this.logger.error(
        `Failed to rollback ${context.action.type} action for ${context.action.metadataName}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'BaseWorkspaceMigrationRunnerActionHandlerService',
      );
    }
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
      `${this.actionType}_${this.metadataName} ${label}`,
    );
    await method();
    this.logger.timeEnd(
      'BaseWorkspaceMigrationRunnerActionHandlerService',
      `${this.actionType}_${this.metadataName} ${label}`,
    );
  }
}

export function WorkspaceMigrationRunnerActionHandler<
  TActionType extends WorkspaceMigrationActionType,
  TMetadataName extends AllMetadataName,
>(
  actionType: TActionType,
  metadataName: TMetadataName,
): typeof BaseWorkspaceMigrationRunnerActionHandlerService<
  TActionType,
  TMetadataName
> {
  abstract class ActionHandlerService extends BaseWorkspaceMigrationRunnerActionHandlerService<
    TActionType,
    TMetadataName
  > {
    actionType = actionType;
    metadataName = metadataName;
  }

  SetMetadata(
    WORKSPACE_MIGRATION_ACTION_HANDLER_METADATA_KEY,
    buildActionHandlerKey(actionType, metadataName),
  )(ActionHandlerService);

  return ActionHandlerService;
}
