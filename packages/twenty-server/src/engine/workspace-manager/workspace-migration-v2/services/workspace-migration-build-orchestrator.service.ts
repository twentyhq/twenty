import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { EMPTY_ALL_FLAT_ENTITY_MAPS } from 'src/engine/core-modules/common/constant/empty-all-flat-entity-maps.constant';
import { EMPTY_FLAT_ENTITY_MAPS } from 'src/engine/core-modules/common/constant/empty-flat-entity-maps.constant';
import { AllFlatEntityMaps } from 'src/engine/core-modules/common/types/all-flat-entity-maps.type';
import { EMPTY_ORCHESTRATOR_ACTIONS_REPORT } from 'src/engine/workspace-manager/workspace-migration-v2/constant/empty-orchestrator-actions-report.constant';
import {
  OrchestratorFailureReport,
  WorkspaceMigrationOrchestratorBuildArgs,
  WorkspaceMigrationOrchestratorFailedResult,
  WorkspaceMigrationOrchestratorSuccessfulResult,
} from 'src/engine/workspace-manager/workspace-migration-v2/types/workspace-migration-orchestrator.type';
import { WorkspaceMigrationV2CronTriggerActionsBuilderService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/cron-trigger/workspace-migration-v2-cron-trigger-action-builder.service';
import { WorkspaceMigrationV2DatabaseEventTriggerActionsBuilderService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/database-event-trigger/workspace-migration-v2-database-event-trigger-actions-builder.service';
import { WorkspaceMigrationV2FieldActionsBuilderService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/field/services/workspace-migration-v2-field-actions-builder.service';
import { WorkspaceMigrationV2IndexActionsBuilderService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/index/workspace-migration-v2-index-actions-builder.service';
import { WorkspaceMigrationV2ObjectActionsBuilderService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/object/services/workspace-migration-v2-object-actions-builder.service';
import { WorkspaceMigrationV2ServerlessFunctionActionsBuilderService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/serverless-function/workspace-migration-v2-serverless-function-actions-builder.service';
import { WorkspaceMigrationV2ViewFieldActionsBuilderService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/view-field/workspace-migration-v2-view-field-actions-builder.service';
import { WorkspaceMigrationV2ViewActionsBuilderService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/view/workspace-migration-v2-view-actions-builder.service';
import { CreateFieldAction } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/workspace-migration-field-action-v2';
import { CreateObjectAction } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/workspace-migration-object-action-v2';

@Injectable()
export class WorkspaceMigrationBuildOrchestratorService {
  constructor(
    private readonly workspaceMigrationV2ObjectActionsBuilderService: WorkspaceMigrationV2ObjectActionsBuilderService,
    private readonly workspaceMigrationV2IndexActionsBuilderService: WorkspaceMigrationV2IndexActionsBuilderService,
    private readonly workspaceMigrationV2ViewActionsBuilderService: WorkspaceMigrationV2ViewActionsBuilderService,
    private readonly workspaceMigrationV2ViewFieldActionsBuilderService: WorkspaceMigrationV2ViewFieldActionsBuilderService,
    private readonly workspaceMigrationV2ServerlessFunctionActionsBuilderService: WorkspaceMigrationV2ServerlessFunctionActionsBuilderService,
    private readonly workspaceMigrationV2DatabaseEventTriggerActionsBuilderService: WorkspaceMigrationV2DatabaseEventTriggerActionsBuilderService,
    private readonly workspaceMigrationV2CronTriggerActionsBuilderService: WorkspaceMigrationV2CronTriggerActionsBuilderService,
    private readonly workspaceMigrationV2FieldActionsBuilderService: WorkspaceMigrationV2FieldActionsBuilderService,
  ) {}

  private setupOptimisticCache({
    fromToAllFlatEntityMaps,
    dependencyAllFlatEntityMaps,
  }: Pick<
    WorkspaceMigrationOrchestratorBuildArgs,
    'fromToAllFlatEntityMaps' | 'dependencyAllFlatEntityMaps'
  >): AllFlatEntityMaps {
    const allFromToFlatEntityMapsKeys = Object.keys(
      fromToAllFlatEntityMaps,
    ) as (keyof AllFlatEntityMaps)[];

    return allFromToFlatEntityMapsKeys.reduce<AllFlatEntityMaps>(
      (allFlatEntityMaps, currFlatMaps) => {
        const fromToOccurence = fromToAllFlatEntityMaps[currFlatMaps];

        if (!isDefined(fromToOccurence)) {
          return allFlatEntityMaps;
        }

        return {
          ...allFlatEntityMaps,
          [currFlatMaps]: fromToOccurence.from,
        };
      },
      {
        ...EMPTY_ALL_FLAT_ENTITY_MAPS,
        ...dependencyAllFlatEntityMaps,
      },
    );
  }

  public async buildWorkspaceMigration({
    workspaceId,
    buildOptions,
    fromToAllFlatEntityMaps,
    dependencyAllFlatEntityMaps,
  }: WorkspaceMigrationOrchestratorBuildArgs): Promise<
    | WorkspaceMigrationOrchestratorFailedResult
    | WorkspaceMigrationOrchestratorSuccessfulResult
  > {
    const orchestratorActionsReport = structuredClone({
      ...EMPTY_ORCHESTRATOR_ACTIONS_REPORT,
    });
    const orchestratorFailureReport: OrchestratorFailureReport = {
      objectMetadata: [],
      view: [],
      viewField: [],
      index: [],
      serverlessFunction: [],
      databaseEventTrigger: [],
      cronTrigger: [],
      fieldMetadata: [],
    };

    const optimisticAllFlatEntityMaps = this.setupOptimisticCache({
      fromToAllFlatEntityMaps,
      dependencyAllFlatEntityMaps,
    });
    const {
      flatObjectMetadataMaps,
      flatViewFieldMaps,
      flatViewMaps,
      flatIndexMaps,
      flatServerlessFunctionMaps,
      flatDatabaseEventTriggerMaps,
      flatCronTriggerMaps,
      flatFieldMetadataMaps,
    } = fromToAllFlatEntityMaps;

    if (isDefined(flatObjectMetadataMaps)) {
      const { from: fromFlatObjectMetadataMaps, to: toFlatObjectMetadataMaps } =
        flatObjectMetadataMaps;

      const objectResult =
        await this.workspaceMigrationV2ObjectActionsBuilderService.validateAndBuild(
          {
            buildOptions,
            dependencyOptimisticFlatEntityMaps: {
              // TODO That's hacky also not reliable ?
              flatFieldMetadataMaps:
                flatFieldMetadataMaps?.to ?? EMPTY_FLAT_ENTITY_MAPS,
            },
            from: fromFlatObjectMetadataMaps,
            to: toFlatObjectMetadataMaps,
            workspaceId,
          },
        );

      optimisticAllFlatEntityMaps.flatObjectMetadataMaps =
        objectResult.optimisticFlatEntityMaps;

      if (objectResult.status === 'fail') {
        orchestratorFailureReport.objectMetadata.push(...objectResult.errors);
      } else {
        orchestratorActionsReport.objectMetadata = objectResult.actions;
      }
    }

    if (isDefined(flatFieldMetadataMaps)) {
      const { from: fromFlatFieldMetadataMaps, to: toFlatFieldMetadataMaps } =
        flatFieldMetadataMaps;
      const fieldResult =
        await this.workspaceMigrationV2FieldActionsBuilderService.validateAndBuild(
          {
            from: fromFlatFieldMetadataMaps,
            to: toFlatFieldMetadataMaps,
            buildOptions,
            dependencyOptimisticFlatEntityMaps: {
              flatObjectMetadataMaps:
                optimisticAllFlatEntityMaps.flatObjectMetadataMaps,
            },
            workspaceId,
          },
        );

      optimisticAllFlatEntityMaps.flatFieldMetadataMaps =
        fieldResult.optimisticFlatEntityMaps;

      if (fieldResult.status === 'fail') {
        orchestratorFailureReport.fieldMetadata.push(...fieldResult.errors);
      } else {
        orchestratorActionsReport.index = fieldResult.actions;
      }
    }

    if (isDefined(flatIndexMaps)) {
      const { from: fromFlatIndexMaps, to: toFlatIndexMaps } = flatIndexMaps;
      const indexResult =
        await this.workspaceMigrationV2IndexActionsBuilderService.validateAndBuild(
          {
            from: fromFlatIndexMaps,
            to: toFlatIndexMaps,
            buildOptions,
            dependencyOptimisticFlatEntityMaps: {
              flatFieldMetadataMaps:
                optimisticAllFlatEntityMaps.flatFieldMetadataMaps,
              flatObjectMetadataMaps:
                optimisticAllFlatEntityMaps.flatObjectMetadataMaps,
            },
            workspaceId,
          },
        );

      optimisticAllFlatEntityMaps.flatIndexMaps =
        indexResult.optimisticFlatEntityMaps;

      if (indexResult.status === 'fail') {
        orchestratorFailureReport.index.push(...indexResult.errors);
      } else {
        orchestratorActionsReport.index = indexResult.actions;
      }
    }

    if (isDefined(flatViewMaps)) {
      const { from: fromFlatViewMaps, to: toFlatViewMaps } = flatViewMaps;
      const viewResult =
        await this.workspaceMigrationV2ViewActionsBuilderService.validateAndBuild(
          {
            dependencyOptimisticFlatEntityMaps: {
              flatObjectMetadataMaps:
                optimisticAllFlatEntityMaps.flatObjectMetadataMaps,
            },
            from: fromFlatViewMaps,
            to: toFlatViewMaps,
            buildOptions,
            workspaceId,
          },
        );

      optimisticAllFlatEntityMaps.flatViewMaps =
        viewResult.optimisticFlatEntityMaps;

      if (viewResult.status === 'fail') {
        orchestratorFailureReport.view.push(...viewResult.errors);
      } else {
        orchestratorActionsReport.view = viewResult.actions;
      }
    }

    if (isDefined(flatViewFieldMaps)) {
      const { from: fromFlatViewFieldMaps, to: toFlatViewFieldMaps } =
        flatViewFieldMaps;
      const viewFieldResult =
        await this.workspaceMigrationV2ViewFieldActionsBuilderService.validateAndBuild(
          {
            from: fromFlatViewFieldMaps,
            to: toFlatViewFieldMaps,
            buildOptions,
            dependencyOptimisticFlatEntityMaps: {
              flatObjectMetadataMaps:
                optimisticAllFlatEntityMaps.flatObjectMetadataMaps,
              flatViewMaps: optimisticAllFlatEntityMaps.flatViewMaps,
            },
            workspaceId,
          },
        );

      optimisticAllFlatEntityMaps.flatViewFieldMaps =
        viewFieldResult.optimisticFlatEntityMaps;

      if (viewFieldResult.status === 'fail') {
        orchestratorFailureReport.viewField.push(...viewFieldResult.errors);
      } else {
        orchestratorActionsReport.viewField = viewFieldResult.actions;
      }
    }

    if (isDefined(flatServerlessFunctionMaps)) {
      const {
        from: fromFlatServerlessFunctionMaps,
        to: toFlatServerlessFunctionMaps,
      } = flatServerlessFunctionMaps;

      const serverlessFunctionResult =
        await this.workspaceMigrationV2ServerlessFunctionActionsBuilderService.validateAndBuild(
          {
            from: fromFlatServerlessFunctionMaps,
            to: toFlatServerlessFunctionMaps,
            buildOptions,
            dependencyOptimisticFlatEntityMaps: undefined,
            workspaceId,
          },
        );

      optimisticAllFlatEntityMaps.flatServerlessFunctionMaps =
        serverlessFunctionResult.optimisticFlatEntityMaps;

      if (serverlessFunctionResult.status === 'fail') {
        orchestratorFailureReport.serverlessFunction.push(
          ...serverlessFunctionResult.errors,
        );
      } else {
        orchestratorActionsReport.serverlessFunction =
          serverlessFunctionResult.actions;
      }
    }

    if (isDefined(flatDatabaseEventTriggerMaps)) {
      const {
        from: fromFlatDatabaseEventTriggerMaps,
        to: toFlatDatabaseEventTriggerMaps,
      } = flatDatabaseEventTriggerMaps;

      const databaseEventTriggerResult =
        await this.workspaceMigrationV2DatabaseEventTriggerActionsBuilderService.validateAndBuild(
          {
            from: fromFlatDatabaseEventTriggerMaps,
            to: toFlatDatabaseEventTriggerMaps,
            buildOptions,
            workspaceId,
            dependencyOptimisticFlatEntityMaps: undefined,
          },
        );

      optimisticAllFlatEntityMaps.flatDatabaseEventTriggerMaps =
        databaseEventTriggerResult.optimisticFlatEntityMaps;

      if (databaseEventTriggerResult.status === 'fail') {
        orchestratorFailureReport.databaseEventTrigger.push(
          ...databaseEventTriggerResult.errors,
        );
      } else {
        orchestratorActionsReport.databaseEventTrigger =
          databaseEventTriggerResult.actions;
      }
    }

    if (isDefined(flatCronTriggerMaps)) {
      const { from: fromFlatCronTriggerMaps, to: toFlatCronTriggerMaps } =
        flatCronTriggerMaps;

      const cronTriggerResult =
        await this.workspaceMigrationV2CronTriggerActionsBuilderService.validateAndBuild(
          {
            from: fromFlatCronTriggerMaps,
            to: toFlatCronTriggerMaps,
            buildOptions,
            workspaceId,
            dependencyOptimisticFlatEntityMaps: undefined,
          },
        );

      optimisticAllFlatEntityMaps.flatCronTriggerMaps =
        cronTriggerResult.optimisticFlatEntityMaps;

      if (cronTriggerResult.status === 'fail') {
        orchestratorFailureReport.cronTrigger.push(...cronTriggerResult.errors);
      } else {
        orchestratorActionsReport.cronTrigger = cronTriggerResult.actions;
      }
    }

    const allErrors = Object.values(orchestratorFailureReport);

    if (allErrors.some((report) => report.length > 0)) {
      return {
        status: 'fail',
        report: orchestratorFailureReport,
      };
    }

    const relatedFlatEntityMapsKeys = Object.keys(
      fromToAllFlatEntityMaps,
    ) as (keyof AllFlatEntityMaps)[];

    // Create util
    const { createFieldActions, createObjectActions } = (
      orchestratorActionsReport.fieldMetadata.created as CreateFieldAction[]
    ).reduce<{
      createFieldActions: Record<string, CreateFieldAction>;
      createObjectActions: Record<string, CreateObjectAction>;
    }>(
      (acc, createFieldAction) => {
        const createObjectOccurence =
          acc.createObjectActions[createFieldAction.objectMetadataId];

        if (isDefined(createObjectOccurence)) {
          return {
            ...acc,
            createObjectActions: {
              ...acc.createObjectActions,
              [createFieldAction.objectMetadataId]: {
                ...createObjectOccurence,
                flatFieldMetadatas: [
                  ...createObjectOccurence.flatFieldMetadatas,
                  ...createFieldAction.flatFieldMetadatas,
                ],
              },
            },
          };
        }

        const createFieldOccurence =
          acc.createFieldActions[createFieldAction.objectMetadataId] ?? {};

        return {
          ...acc,
          createFieldActions: {
            ...acc.createFieldActions,
            [createFieldAction.objectMetadataId]: {
              ...createFieldOccurence,
              flatFieldMetadatas: [
                ...createFieldOccurence.flatFieldMetadatas,
                ...createFieldAction.flatFieldMetadatas,
              ],
            },
          },
        };
      },
      {
        createFieldActions: {},
        createObjectActions: (
          orchestratorActionsReport.objectMetadata
            .created as CreateObjectAction[]
        ).reduce(
          (acc, createObjectAction) => ({
            ...acc,
            [createObjectAction.flatObjectMetadata.id]: createObjectAction,
          }),
          {},
        ),
      },
    );

    orchestratorActionsReport.fieldMetadata.created =
      Object.values(createFieldActions);
    orchestratorActionsReport.objectMetadata.created =
      Object.values(createObjectActions);
    ///

    return {
      status: 'success',
      workspaceMigration: {
        relatedFlatEntityMapsKeys,
        actions: [
          // Object and fields and indexes
          ...orchestratorActionsReport.index.deleted,
          ...orchestratorActionsReport.fieldMetadata.deleted,
          ...orchestratorActionsReport.objectMetadata.deleted,
          ...orchestratorActionsReport.objectMetadata.created,
          ...orchestratorActionsReport.objectMetadata.updated,
          ...orchestratorActionsReport.fieldMetadata.created,
          ...orchestratorActionsReport.fieldMetadata.updated,
          ...orchestratorActionsReport.index.created,
          ...orchestratorActionsReport.index.updated,
          ///

          // Views
          ...orchestratorActionsReport.view.deleted,
          ...orchestratorActionsReport.view.created,
          ...orchestratorActionsReport.view.updated,
          ...orchestratorActionsReport.viewField.deleted,
          ...orchestratorActionsReport.viewField.created,
          ...orchestratorActionsReport.viewField.updated,
          ///

          // Serverless functions
          ...orchestratorActionsReport.serverlessFunction.deleted,
          ...orchestratorActionsReport.serverlessFunction.created,
          ...orchestratorActionsReport.serverlessFunction.updated,
          ///

          // Database event triggers
          ...orchestratorActionsReport.databaseEventTrigger.deleted,
          ...orchestratorActionsReport.databaseEventTrigger.created,
          ...orchestratorActionsReport.databaseEventTrigger.updated,
          ///

          // Cron triggers
          ...orchestratorActionsReport.cronTrigger.deleted,
          ...orchestratorActionsReport.cronTrigger.created,
          ...orchestratorActionsReport.cronTrigger.updated,
          ///
        ],
        workspaceId,
      },
    };
  }
}
