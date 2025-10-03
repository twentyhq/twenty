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
import { aggregateOrchestratorActionsReport } from 'src/engine/workspace-manager/workspace-migration-v2/utils/aggregate-orchestrator-actions-report.util';
import { WorkspaceMigrationV2CronTriggerActionsBuilderService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/cron-trigger/workspace-migration-v2-cron-trigger-action-builder.service';
import { WorkspaceMigrationV2DatabaseEventTriggerActionsBuilderService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/database-event-trigger/workspace-migration-v2-database-event-trigger-actions-builder.service';
import { WorkspaceMigrationV2FieldActionsBuilderService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/field/services/workspace-migration-v2-field-actions-builder.service';
import { WorkspaceMigrationV2IndexActionsBuilderService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/index/workspace-migration-v2-index-actions-builder.service';
import { WorkspaceMigrationV2ObjectActionsBuilderService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/object/services/workspace-migration-v2-object-actions-builder.service';
import { WorkspaceMigrationV2RouteTriggerActionsBuilderService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/route-trigger/workspace-migration-v2-route-trigger-actions-builder.service';
import { WorkspaceMigrationV2ServerlessFunctionActionsBuilderService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/serverless-function/workspace-migration-v2-serverless-function-actions-builder.service';
import { WorkspaceMigrationV2ViewFieldActionsBuilderService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/view-field/workspace-migration-v2-view-field-actions-builder.service';
import { WorkspaceMigrationV2ViewActionsBuilderService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/view/workspace-migration-v2-view-actions-builder.service';
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
    private readonly workspaceMigrationV2RouteTriggerActionsBuilderService: WorkspaceMigrationV2RouteTriggerActionsBuilderService,
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
      routeTrigger: [],
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
      flatRouteTriggerMaps,
      flatFieldMetadataMaps,
    } = fromToAllFlatEntityMaps;

    if (isDefined(flatObjectMetadataMaps)) {
      const { from: fromFlatObjectMetadataMaps, to: toFlatObjectMetadataMaps } =
        flatObjectMetadataMaps;

      const objectResult =
        await this.workspaceMigrationV2ObjectActionsBuilderService.validateAndBuild(
          {
            buildOptions,
            // dependencyOptimisticFlatEntityMaps: undefined,
            // TODO That's hacky also not reliable ?
            dependencyOptimisticFlatEntityMaps: {
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
      optimisticAllFlatEntityMaps.flatObjectMetadataMaps =
        fieldResult.dependencyOptimisticFlatEntityMaps.flatObjectMetadataMaps;

      if (fieldResult.status === 'fail') {
        orchestratorFailureReport.fieldMetadata.push(...fieldResult.errors);
      } else {
        orchestratorActionsReport.fieldMetadata = fieldResult.actions;
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
      optimisticAllFlatEntityMaps.flatObjectMetadataMaps =
        indexResult.dependencyOptimisticFlatEntityMaps.flatObjectMetadataMaps;

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
              flatFieldMetadataMaps:
                optimisticAllFlatEntityMaps.flatFieldMetadataMaps,
              flatViewMaps: optimisticAllFlatEntityMaps.flatViewMaps,
            },
            workspaceId,
          },
        );

      optimisticAllFlatEntityMaps.flatViewFieldMaps =
        viewFieldResult.optimisticFlatEntityMaps;
      optimisticAllFlatEntityMaps.flatViewMaps =
        viewFieldResult.dependencyOptimisticFlatEntityMaps.flatViewMaps;

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
            dependencyOptimisticFlatEntityMaps: {
              flatServerlessFunctionMaps:
                optimisticAllFlatEntityMaps.flatServerlessFunctionMaps,
            },
            workspaceId,
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
            dependencyOptimisticFlatEntityMaps: {
              flatServerlessFunctionMaps:
                optimisticAllFlatEntityMaps.flatServerlessFunctionMaps,
            },
            workspaceId,
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

    if (isDefined(flatRouteTriggerMaps)) {
      const { from: fromFlatRouteTriggerMaps, to: toFlatRouteTriggerMaps } =
        flatRouteTriggerMaps;

      const routeTriggerResult =
        await this.workspaceMigrationV2RouteTriggerActionsBuilderService.validateAndBuild(
          {
            from: fromFlatRouteTriggerMaps,
            to: toFlatRouteTriggerMaps,
            buildOptions,
            dependencyOptimisticFlatEntityMaps: {
              flatServerlessFunctionMaps:
                optimisticAllFlatEntityMaps.flatServerlessFunctionMaps,
            },
            workspaceId,
          },
        );

      optimisticAllFlatEntityMaps.flatRouteTriggerMaps =
        routeTriggerResult.optimisticFlatEntityMaps;

      if (routeTriggerResult.status === 'fail') {
        orchestratorFailureReport.routeTrigger.push(
          ...routeTriggerResult.errors,
        );
      } else {
        orchestratorActionsReport.routeTrigger = routeTriggerResult.actions;
      }
    }

    const allErrors = Object.values(orchestratorFailureReport);

    if (allErrors.some((report) => report.length > 0)) {
      return {
        status: 'fail',
        report: orchestratorFailureReport,
      };
    }

    const relatedFlatEntityMapsKeys = [
      ...new Set([
        ...Object.keys(fromToAllFlatEntityMaps),
        ...Object.keys(dependencyAllFlatEntityMaps ?? {}),
      ]),
    ] as (keyof AllFlatEntityMaps)[];

    const { aggregatedOrchestratorActionsReport } =
      aggregateOrchestratorActionsReport({
        orchestratorActionsReport,
      });

    return {
      status: 'success',
      workspaceMigration: {
        relatedFlatEntityMapsKeys,
        actions: [
          // Object and fields and indexes
          ...aggregatedOrchestratorActionsReport.index.deleted,
          ...aggregatedOrchestratorActionsReport.fieldMetadata.deleted,
          ...aggregatedOrchestratorActionsReport.objectMetadata.deleted,
          ...aggregatedOrchestratorActionsReport.objectMetadata.created,
          ...aggregatedOrchestratorActionsReport.objectMetadata.updated,
          ...aggregatedOrchestratorActionsReport.fieldMetadata.created,
          ...aggregatedOrchestratorActionsReport.fieldMetadata.updated,
          ...aggregatedOrchestratorActionsReport.index.created,
          ...aggregatedOrchestratorActionsReport.index.updated,
          ///

          // Views
          ...aggregatedOrchestratorActionsReport.view.deleted,
          ...aggregatedOrchestratorActionsReport.view.created,
          ...aggregatedOrchestratorActionsReport.view.updated,
          ...aggregatedOrchestratorActionsReport.viewField.deleted,
          ...aggregatedOrchestratorActionsReport.viewField.created,
          ...aggregatedOrchestratorActionsReport.viewField.updated,
          ///

          // Serverless functions
          ...aggregatedOrchestratorActionsReport.serverlessFunction.deleted,
          ...aggregatedOrchestratorActionsReport.serverlessFunction.created,
          ...aggregatedOrchestratorActionsReport.serverlessFunction.updated,
          ///

          // Database event triggers
          ...aggregatedOrchestratorActionsReport.databaseEventTrigger.deleted,
          ...aggregatedOrchestratorActionsReport.databaseEventTrigger.created,
          ...aggregatedOrchestratorActionsReport.databaseEventTrigger.updated,
          ///

          // Cron triggers
          ...aggregatedOrchestratorActionsReport.cronTrigger.deleted,
          ...aggregatedOrchestratorActionsReport.cronTrigger.created,
          ...aggregatedOrchestratorActionsReport.cronTrigger.updated,
          ///

          // Route triggers
          ...orchestratorActionsReport.routeTrigger.deleted,
          ...orchestratorActionsReport.routeTrigger.created,
          ...orchestratorActionsReport.routeTrigger.updated,
          ///
        ],
        workspaceId,
      },
    };
  }
}
