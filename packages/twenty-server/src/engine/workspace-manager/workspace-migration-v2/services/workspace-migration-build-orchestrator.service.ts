import { Injectable, Logger } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { EMPTY_ALL_FLAT_ENTITY_MAPS } from 'src/engine/core-modules/common/constant/empty-all-flat-entity-maps.constant';
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
import { WorkspaceMigrationV2IndexActionsBuilderService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/index/workspace-migration-v2-index-actions-builder.service';
import { WorkspaceMigrationV2ServerlessFunctionActionsBuilderService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/serverless-function/workspace-migration-v2-serverless-function-actions-builder.service';
import { WorkspaceMigrationV2ViewFieldActionsBuilderService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/view-field/workspace-migration-v2-view-field-actions-builder.service';
import { WorkspaceMigrationV2ViewActionsBuilderService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/view/workspace-migration-v2-view-actions-builder.service';
import { WorkspaceMigrationBuilderV2Service } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/services/workspace-migration-builder-v2.service';

@Injectable()
export class WorkspaceMigrationBuildOrchestratorService {
  private readonly logger = new Logger(
    WorkspaceMigrationBuildOrchestratorService.name,
  );

  constructor(
    private readonly workspaceMigrationBuilderV2Service: WorkspaceMigrationBuilderV2Service,
    private readonly workspaceMigrationV2IndexActionsBuilderService: WorkspaceMigrationV2IndexActionsBuilderService,
    private readonly workspaceMigrationV2ViewActionsBuilderService: WorkspaceMigrationV2ViewActionsBuilderService,
    private readonly workspaceMigrationV2ViewFieldActionsBuilderService: WorkspaceMigrationV2ViewFieldActionsBuilderService,
    private readonly workspaceMigrationV2ServerlessFunctionActionsBuilderService: WorkspaceMigrationV2ServerlessFunctionActionsBuilderService,
    private readonly workspaceMigrationV2DatabaseEventTriggerActionsBuilderService: WorkspaceMigrationV2DatabaseEventTriggerActionsBuilderService,
    private readonly workspaceMigrationV2CronTriggerActionsBuilderService: WorkspaceMigrationV2CronTriggerActionsBuilderService,
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
    } = fromToAllFlatEntityMaps;

    if (isDefined(flatObjectMetadataMaps)) {
      const { from: fromFlatObjectMetadataMaps, to: toFlatObjectMetadataMaps } =
        flatObjectMetadataMaps;

      const objectResult =
        await this.workspaceMigrationBuilderV2Service.validateAndBuild({
          fromFlatObjectMetadataMaps,
          toFlatObjectMetadataMaps,
          buildOptions,
        });

      optimisticAllFlatEntityMaps.flatObjectMetadataMaps =
        objectResult.optimisticFlatObjectMetadataMaps;

      if (objectResult.status === 'fail') {
        orchestratorFailureReport.objectMetadata.push(...objectResult.errors);
      } else {
        orchestratorActionsReport.fieldMetadata = objectResult.fieldsActions;
        orchestratorActionsReport.objectMetadata = objectResult.objectActions;
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
              flatObjectMetadataMaps:
                optimisticAllFlatEntityMaps.flatObjectMetadataMaps,
            },
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
            dependencyOptimisticFlatEntityMaps: {} as AllFlatEntityMaps,
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
            dependencyOptimisticFlatEntityMaps: {} as AllFlatEntityMaps,
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
            dependencyOptimisticFlatEntityMaps: {} as AllFlatEntityMaps,
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
