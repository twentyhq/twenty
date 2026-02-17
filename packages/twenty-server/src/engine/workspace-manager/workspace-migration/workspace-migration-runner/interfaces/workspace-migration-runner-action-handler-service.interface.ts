import { Inject, SetMetadata } from '@nestjs/common';

import { AllMetadataName } from 'twenty-shared/metadata';
import { QueryRunner } from 'typeorm';

import { LoggerService } from 'src/engine/core-modules/logger/logger.service';
import { ALL_METADATA_ENTITY_BY_METADATA_NAME } from 'src/engine/metadata-modules/flat-entity/constant/all-metadata-entity-by-metadata-name.constant';
import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { MetadataFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/metadata-flat-entity.type';
import { MetadataRelatedFlatEntityMapsKeys } from 'src/engine/metadata-modules/flat-entity/types/metadata-related-flat-entity-maps-keys.type';
import { MetadataToFlatEntityMapsKey } from 'src/engine/metadata-modules/flat-entity/types/metadata-to-flat-entity-maps-key';
import { WorkspaceMigrationActionType } from 'src/engine/metadata-modules/flat-entity/types/metadata-workspace-migration-action.type';
import { findFlatEntityByUniversalIdentifierOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier-or-throw.util';
import { getMetadataFlatEntityMapsKey } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-flat-entity-maps-key.util';
import { UniversalFlatEntityUpdate } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-entity-update.type';
import { sanitizeUniversalFlatEntityUpdate } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/utils/sanitize-universal-flat-entity-update.util';
import { BaseFlatDeleteWorkspaceMigrationAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/base-flat-delete-workspace-migration-action.type';
import {
  buildActionHandlerKey,
  type AllFlatWorkspaceMigrationAction,
  type AllUniversalWorkspaceMigrationAction,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/workspace-migration-action-common';
import { WORKSPACE_MIGRATION_ACTION_HANDLER_METADATA_KEY } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/constants/workspace-migration-action-handler-metadata-key.constant';
import {
  WorkspaceMigrationRunnerException,
  WorkspaceMigrationRunnerExceptionCode,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/exceptions/workspace-migration-runner.exception';
import { type MetadataEvent } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/metadata-event';
import {
  WorkspaceMigrationActionRunnerContext,
  type WorkspaceMigrationActionRunnerArgs,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/workspace-migration-action-runner-args.type';
import { deriveMetadataEventsFromCreateAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/utils/derive-metadata-events-from-create-action.util';
import { deriveMetadataEventsFromDeleteAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/utils/derive-metadata-events-from-delete-action.util';
import { deriveMetadataEventsFromUpdateAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/utils/derive-metadata-events-from-update-action.util';
import { flatEntityToScalarFlatEntity } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/utils/flat-entity-to-scalar-flat-entity.util';
import { optimisticallyApplyCreateActionOnAllFlatEntityMaps } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/utils/optimistically-apply-create-action-on-all-flat-entity-maps.util';
import { optimisticallyApplyDeleteActionOnAllFlatEntityMaps } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/utils/optimistically-apply-delete-action-on-all-flat-entity-maps.util';
import { optimisticallyApplyUpdateActionOnAllFlatEntityMaps } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/utils/optimistically-apply-update-action-on-all-flat-entity-maps.util';

type FlatActionWithAllFlatEntityMapsArgs<
  TFlatAction extends AllFlatWorkspaceMigrationAction,
> = {
  flatAction: TFlatAction;
  allFlatEntityMaps: AllFlatEntityMaps;
};

export type ActionHandlerExecuteResult<TMetadataName extends AllMetadataName> =
  {
    partialOptimisticCache: Pick<
      AllFlatEntityMaps,
      | MetadataRelatedFlatEntityMapsKeys<TMetadataName>
      | MetadataToFlatEntityMapsKey<TMetadataName>
    >;
    metadataEvents: MetadataEvent[];
  };

export abstract class BaseWorkspaceMigrationRunnerActionHandlerService<
  TActionType extends WorkspaceMigrationActionType,
  TMetadataName extends AllMetadataName,
  TUniversalAction extends // TODO create abstracted type utils
    AllUniversalWorkspaceMigrationAction = AllUniversalWorkspaceMigrationAction<
    TActionType,
    TMetadataName
  >,
  TFlatAction extends
    AllFlatWorkspaceMigrationAction = AllFlatWorkspaceMigrationAction<
    TActionType,
    TMetadataName
  >,
> {
  public actionType: TActionType;
  public metadataName: TMetadataName;

  @Inject(LoggerService)
  protected readonly logger: LoggerService;

  public abstract transpileUniversalActionToFlatAction(
    context: WorkspaceMigrationActionRunnerArgs<TUniversalAction>,
  ): Promise<TFlatAction>;

  protected async insertFlatEntitiesInRepository({
    flatEntities,
    queryRunner,
  }: {
    queryRunner: QueryRunner;
    flatEntities: MetadataFlatEntity<TMetadataName>[];
  }) {
    const metadataEntity =
      ALL_METADATA_ENTITY_BY_METADATA_NAME[this.metadataName];
    const repository = queryRunner.manager.getRepository(metadataEntity);
    const scalarFlatEntities = flatEntities.map((flatEntity) =>
      flatEntityToScalarFlatEntity({
        flatEntity,
        metadataName: this.metadataName,
      }),
    );

    await repository.insert(scalarFlatEntities);
  }

  protected transpileUniversalDeleteActionToFlatDeleteAction(
    context: 'delete' extends TActionType
      ? WorkspaceMigrationActionRunnerArgs<
          AllUniversalWorkspaceMigrationAction<'delete'>
        >
      : never,
  ): BaseFlatDeleteWorkspaceMigrationAction<TMetadataName> {
    const { action, allFlatEntityMaps } = context;

    const flatEntityMaps = allFlatEntityMaps[
      getMetadataFlatEntityMapsKey(action.metadataName)
    ] as FlatEntityMaps<MetadataFlatEntity<typeof action.metadataName>>;

    const flatEntity = findFlatEntityByUniversalIdentifierOrThrow({
      flatEntityMaps,
      universalIdentifier: action.universalIdentifier,
    });

    return {
      type: 'delete',
      metadataName: this.metadataName,
      entityId: flatEntity.id,
    };
  }

  executeForMetadata(
    _context: WorkspaceMigrationActionRunnerContext<TFlatAction>,
  ): Promise<void> {
    return Promise.resolve();
  }

  executeForWorkspaceSchema(
    _context: WorkspaceMigrationActionRunnerContext<TFlatAction>,
  ): Promise<void> {
    return Promise.resolve();
  }

  private optimisticallyApplyActionOnAllFlatEntityMaps({
    flatAction,
    allFlatEntityMaps,
  }: FlatActionWithAllFlatEntityMapsArgs<TFlatAction>): Pick<
    AllFlatEntityMaps,
    | MetadataRelatedFlatEntityMapsKeys<TMetadataName>
    | MetadataToFlatEntityMapsKey<TMetadataName>
  > {
    switch (flatAction.type) {
      case 'create': {
        return optimisticallyApplyCreateActionOnAllFlatEntityMaps({
          flatAction,
          allFlatEntityMaps,
        });
      }
      case 'delete': {
        return optimisticallyApplyDeleteActionOnAllFlatEntityMaps({
          flatAction,
          allFlatEntityMaps,
        });
      }
      case 'update': {
        return optimisticallyApplyUpdateActionOnAllFlatEntityMaps({
          flatAction,
          allFlatEntityMaps,
        });
      }
    }
  }

  private deriveMetadataEventsFromFlatAction({
    flatAction,
    allFlatEntityMaps,
  }: FlatActionWithAllFlatEntityMapsArgs<TFlatAction>): MetadataEvent[] {
    switch (flatAction.type) {
      case 'create': {
        return deriveMetadataEventsFromCreateAction(flatAction);
      }
      case 'delete': {
        return deriveMetadataEventsFromDeleteAction({
          flatAction,
          allFlatEntityMaps,
        });
      }
      case 'update': {
        return deriveMetadataEventsFromUpdateAction({
          flatAction,
          allFlatEntityMaps,
        });
      }
    }
  }

  rollbackForMetadata(
    _context: Omit<
      WorkspaceMigrationActionRunnerArgs<TUniversalAction>,
      'queryRunner'
    >,
  ): Promise<void> {
    return Promise.resolve();
  }

  private sanitizeUniversalAction(
    universalAction: TUniversalAction,
  ): TUniversalAction {
    if (universalAction.type === 'update') {
      const sanitizedFlatEntityUpdate = sanitizeUniversalFlatEntityUpdate({
        metadataName: universalAction.metadataName,
        flatEntityUpdate: universalAction.update as UniversalFlatEntityUpdate<
          typeof universalAction.metadataName
        >,
      });

      return {
        ...universalAction,
        update: sanitizedFlatEntityUpdate,
      };
    }

    return universalAction;
  }

  private async transpileUniversalActionToFlatActionOrThrow(
    context: WorkspaceMigrationActionRunnerArgs<TUniversalAction>,
  ): Promise<TFlatAction> {
    try {
      const sanitizedUniversalAction = this.sanitizeUniversalAction(
        context.action,
      );

      return await this.transpileUniversalActionToFlatAction({
        ...context,
        action: sanitizedUniversalAction,
      });
    } catch (error) {
      throw new WorkspaceMigrationRunnerException({
        action: context.action,
        errors: {
          actionTranspilation: error,
        },
        code: WorkspaceMigrationRunnerExceptionCode.EXECUTION_FAILED,
      });
    }
  }

  async execute(
    context: WorkspaceMigrationActionRunnerArgs<TUniversalAction>,
  ): Promise<ActionHandlerExecuteResult<TMetadataName>> {
    const flatAction =
      await this.transpileUniversalActionToFlatActionOrThrow(context);

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

    const metadataEvents = this.deriveMetadataEventsFromFlatAction({
      flatAction,
      allFlatEntityMaps: context.allFlatEntityMaps,
    });

    const partialOptimisticCache =
      this.optimisticallyApplyActionOnAllFlatEntityMaps({
        flatAction,
        allFlatEntityMaps: context.allFlatEntityMaps,
      });

    return { partialOptimisticCache, metadataEvents };
  }

  async rollback(
    context: Omit<
      WorkspaceMigrationActionRunnerArgs<TUniversalAction>,
      'queryRunner'
    >,
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
