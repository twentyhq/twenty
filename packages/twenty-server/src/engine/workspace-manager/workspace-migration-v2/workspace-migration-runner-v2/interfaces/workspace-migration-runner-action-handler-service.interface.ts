import { Inject, SetMetadata } from '@nestjs/common';

import { AllMetadataName } from 'twenty-shared/metadata';
import { assertUnreachable } from 'twenty-shared/utils';

import { LoggerService } from 'src/engine/core-modules/logger/logger.service';
import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { AllFlatEntityTypesByMetadataName } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-types-by-metadata-name';
import { MetadataFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/metadata-flat-entity.type';
import { MetadataRelatedFlatEntityMapsKeys } from 'src/engine/metadata-modules/flat-entity/types/metadata-related-flat-entity-maps-keys.type';
import { MetadataToFlatEntityMapsKey } from 'src/engine/metadata-modules/flat-entity/types/metadata-to-flat-entity-maps-key';
import { WorkspaceMigrationActionType } from 'src/engine/metadata-modules/flat-entity/types/metadata-workspace-migration-action.type';
import { addFlatEntityToFlatEntityAndRelatedEntityMapsThroughMutationOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/add-flat-entity-to-flat-entity-and-related-entity-maps-through-mutation-or-throw.util';
import { deleteFlatEntityFromFlatEntityAndRelatedEntityMapsThroughMutationOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/delete-flat-entity-from-flat-entity-and-related-entity-maps-through-mutation-or-throw.util';
import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { getMetadataFlatEntityMapsKey } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-flat-entity-maps-key.util';
import { replaceFlatEntityInFlatEntityMapsThroughMutationOrThrow } from 'src/engine/workspace-manager/workspace-migration-v2/utils/replace-flat-entity-in-flat-entity-maps-through-mutation-or-throw.util';
import {
  buildActionHandlerKey,
  type WorkspaceMigrationActionV2,
} from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/workspace-migration-action-common-v2';
import { WORKSPACE_MIGRATION_ACTION_HANDLER_METADATA_KEY } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/constants/workspace-migration-action-handler-metadata-key.constant';
import { type WorkspaceMigrationActionRunnerArgs } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/types/workspace-migration-action-runner-args.type';
import { fromFlatEntityPropertiesUpdatesToPartialFlatEntity } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/utils/from-flat-entity-properties-updates-to-partial-flat-entity';

type OptimisticallyApplyActionOnAllFlatEntityMapsArgs<
  TActionType extends WorkspaceMigrationActionV2,
> = Pick<
  WorkspaceMigrationActionRunnerArgs<TActionType>,
  'allFlatEntityMaps' | 'action'
>;

export abstract class BaseWorkspaceMigrationRunnerActionHandlerService<
  TActionType extends WorkspaceMigrationActionType,
  TMetadataName extends AllMetadataName,
  TAction extends
    WorkspaceMigrationActionV2 = AllFlatEntityTypesByMetadataName[TMetadataName]['actions'][TActionType],
> {
  public actionType: TActionType;
  public metadataName: TMetadataName;

  @Inject(LoggerService)
  protected readonly logger: LoggerService;

  executeForMetadata(
    _context: WorkspaceMigrationActionRunnerArgs<TAction>,
  ): Promise<void> {
    return Promise.resolve();
  }

  executeForWorkspaceSchema(
    _context: WorkspaceMigrationActionRunnerArgs<TAction>,
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
        switch (action.metadataName) {
          case 'fieldMetadata': {
            action.flatFieldMetadatas.forEach((flatEntity) =>
              addFlatEntityToFlatEntityAndRelatedEntityMapsThroughMutationOrThrow(
                {
                  flatEntity,
                  flatEntityAndRelatedMapsToMutate: allFlatEntityMaps,
                  metadataName: action.metadataName,
                },
              ),
            );

            return allFlatEntityMaps;
          }
          case 'objectMetadata': {
            addFlatEntityToFlatEntityAndRelatedEntityMapsThroughMutationOrThrow(
              {
                flatEntity: action.flatEntity,
                flatEntityAndRelatedMapsToMutate: allFlatEntityMaps,
                metadataName: action.metadataName,
              },
            );

            action.flatFieldMetadatas.forEach((flatField) =>
              addFlatEntityToFlatEntityAndRelatedEntityMapsThroughMutationOrThrow(
                {
                  flatEntity: flatField,
                  flatEntityAndRelatedMapsToMutate: allFlatEntityMaps,
                  metadataName: 'fieldMetadata',
                },
              ),
            );

            return allFlatEntityMaps;
          }
          case 'view':
          case 'viewField':
          case 'viewGroup':
          case 'rowLevelPermissionPredicate':
          case 'rowLevelPermissionPredicateGroup':
          case 'viewFilterGroup':
          case 'index':
          case 'serverlessFunction':
          case 'cronTrigger':
          case 'databaseEventTrigger':
          case 'routeTrigger':
          case 'viewFilter':
          case 'role':
          case 'roleTarget':
          case 'agent':
          case 'skill':
          case 'pageLayout':
          case 'pageLayoutWidget':
          case 'pageLayoutTab': {
            addFlatEntityToFlatEntityAndRelatedEntityMapsThroughMutationOrThrow(
              {
                flatEntity: action.flatEntity,
                flatEntityAndRelatedMapsToMutate: allFlatEntityMaps,
                metadataName: action.metadataName,
              },
            );

            return allFlatEntityMaps;
          }
          default: {
            assertUnreachable(action);
          }
        }
        break;
      }
      case 'delete': {
        switch (action.metadataName) {
          case 'fieldMetadata':
          case 'objectMetadata':
          case 'view':
          case 'viewField':
          case 'viewGroup':
          case 'rowLevelPermissionPredicate':
          case 'rowLevelPermissionPredicateGroup':
          case 'viewFilterGroup':
          case 'index':
          case 'serverlessFunction':
          case 'cronTrigger':
          case 'databaseEventTrigger':
          case 'routeTrigger':
          case 'viewFilter':
          case 'role':
          case 'roleTarget':
          case 'agent':
          case 'skill':
          case 'pageLayout':
          case 'pageLayoutWidget':
          case 'pageLayoutTab': {
            const flatEntityToDelete =
              findFlatEntityByIdInFlatEntityMapsOrThrow<
                MetadataFlatEntity<typeof action.metadataName>
              >({
                flatEntityId: action.entityId,
                flatEntityMaps:
                  allFlatEntityMaps[
                    getMetadataFlatEntityMapsKey(action.metadataName)
                  ],
              });

            deleteFlatEntityFromFlatEntityAndRelatedEntityMapsThroughMutationOrThrow(
              {
                flatEntity: flatEntityToDelete,
                flatEntityAndRelatedMapsToMutate: allFlatEntityMaps,
                metadataName: action.metadataName,
              },
            );

            return allFlatEntityMaps;
          }
          default: {
            assertUnreachable(action);
          }
        }
        break;
      }
      case 'update': {
        switch (action.metadataName) {
          case 'index': {
            const flatIndex = findFlatEntityByIdInFlatEntityMapsOrThrow({
              flatEntityId: action.entityId,
              flatEntityMaps: allFlatEntityMaps['flatIndexMaps'],
            });

            deleteFlatEntityFromFlatEntityAndRelatedEntityMapsThroughMutationOrThrow(
              {
                flatEntity: flatIndex,
                flatEntityAndRelatedMapsToMutate: allFlatEntityMaps,
                metadataName: action.metadataName,
              },
            );

            addFlatEntityToFlatEntityAndRelatedEntityMapsThroughMutationOrThrow(
              {
                flatEntity: action.updatedFlatEntity,
                flatEntityAndRelatedMapsToMutate: allFlatEntityMaps,
                metadataName: action.metadataName,
              },
            );

            return allFlatEntityMaps;
          }
          case 'fieldMetadata':
          case 'objectMetadata':
          case 'view':
          case 'viewField':
          case 'viewGroup':
          case 'rowLevelPermissionPredicate':
          case 'rowLevelPermissionPredicateGroup':
          case 'viewFilterGroup':
          case 'serverlessFunction':
          case 'cronTrigger':
          case 'databaseEventTrigger':
          case 'routeTrigger':
          case 'viewFilter':
          case 'role':
          case 'roleTarget':
          case 'agent':
          case 'skill':
          case 'pageLayout':
          case 'pageLayoutWidget':
          case 'pageLayoutTab': {
            const flatEntityMapsKey = getMetadataFlatEntityMapsKey(
              action.metadataName,
            );
            const fromFlatEntity = findFlatEntityByIdInFlatEntityMapsOrThrow<
              MetadataFlatEntity<typeof action.metadataName>
            >({
              flatEntityId: action.entityId,
              flatEntityMaps: allFlatEntityMaps[flatEntityMapsKey],
            });

            const toFlatEntity = {
              ...fromFlatEntity,
              ...fromFlatEntityPropertiesUpdatesToPartialFlatEntity(action),
            };

            replaceFlatEntityInFlatEntityMapsThroughMutationOrThrow({
              flatEntity: toFlatEntity,
              flatEntityMapsToMutate: allFlatEntityMaps[flatEntityMapsKey],
            });

            return allFlatEntityMaps;
          }
          default: {
            assertUnreachable(action);
          }
        }
      }
    }
  }

  rollbackForMetadata(
    _context: WorkspaceMigrationActionRunnerArgs<TAction>,
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
    context: WorkspaceMigrationActionRunnerArgs<TAction>,
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
