import { Injectable } from '@nestjs/common';

import { AllMetadataName } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { createEmptyAllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-all-flat-entity-maps.constant';
import { AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { MetadataFlatEntityAndRelatedFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/metadata-related-types.type';
import { createEmptyOrchestratorActionsReport } from 'src/engine/workspace-manager/workspace-migration-v2/constant/empty-orchestrator-actions-report.constant';
import { EMPTY_ORCHESTRATOR_FAILURE_REPORT } from 'src/engine/workspace-manager/workspace-migration-v2/constant/empty-orchestrator-failure-report.constant';
import {
  WorkspaceMigrationOrchestratorBuildArgs,
  WorkspaceMigrationOrchestratorFailedResult,
  WorkspaceMigrationOrchestratorSuccessfulResult,
} from 'src/engine/workspace-manager/workspace-migration-v2/types/workspace-migration-orchestrator.type';
import { aggregateOrchestratorActionsReport } from 'src/engine/workspace-manager/workspace-migration-v2/utils/aggregate-orchestrator-actions-report.util';
import { WorkspaceMigrationV2AgentActionsBuilderService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/agent/workspace-migration-v2-agent-actions-builder.service';
import { WorkspaceMigrationV2CronTriggerActionsBuilderService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/cron-trigger/workspace-migration-v2-cron-trigger-action-builder.service';
import { WorkspaceMigrationV2DatabaseEventTriggerActionsBuilderService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/database-event-trigger/workspace-migration-v2-database-event-trigger-actions-builder.service';
import { WorkspaceMigrationV2FieldActionsBuilderService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/field/workspace-migration-v2-field-actions-builder.service';
import { WorkspaceMigrationV2IndexActionsBuilderService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/index/workspace-migration-v2-index-actions-builder.service';
import { WorkspaceMigrationV2ObjectActionsBuilderService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/object/workspace-migration-v2-object-actions-builder.service';
import { WorkspaceMigrationV2PageLayoutTabActionsBuilderService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/page-layout-tab/workspace-migration-v2-page-layout-tab-actions-builder.service';
import { WorkspaceMigrationV2PageLayoutWidgetActionsBuilderService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/page-layout-widget/workspace-migration-v2-page-layout-widget-actions-builder.service';
import { WorkspaceMigrationV2PageLayoutActionsBuilderService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/page-layout/workspace-migration-v2-page-layout-actions-builder.service';
import { WorkspaceMigrationV2RoleTargetActionsBuilderService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/role-target/workspace-migration-v2-role-target-actions-builder.service';
import { WorkspaceMigrationV2RoleActionsBuilderService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/role/workspace-migration-v2-role-actions-builder.service';
import { WorkspaceMigrationV2RouteTriggerActionsBuilderService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/route-trigger/workspace-migration-v2-route-trigger-actions-builder.service';
import { WorkspaceMigrationV2ServerlessFunctionActionsBuilderService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/serverless-function/workspace-migration-v2-serverless-function-actions-builder.service';
import { WorkspaceMigrationV2ViewFieldActionsBuilderService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/view-field/workspace-migration-v2-view-field-actions-builder.service';
import { WorkspaceMigrationV2ViewFilterActionsBuilderService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/view-filter/workspace-migration-v2-view-filter-actions-builder.service';
import { WorkspaceMigrationV2ViewGroupActionsBuilderService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/view-group/workspace-migration-v2-view-group-actions-builder.service';
import { WorkspaceMigrationV2ViewActionsBuilderService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/view/workspace-migration-v2-view-actions-builder.service';

@Injectable()
export class WorkspaceMigrationBuildOrchestratorService {
  constructor(
    private readonly workspaceMigrationV2ObjectActionsBuilderService: WorkspaceMigrationV2ObjectActionsBuilderService,
    private readonly workspaceMigrationV2IndexActionsBuilderService: WorkspaceMigrationV2IndexActionsBuilderService,
    private readonly workspaceMigrationV2ViewActionsBuilderService: WorkspaceMigrationV2ViewActionsBuilderService,
    private readonly workspaceMigrationV2ViewFieldActionsBuilderService: WorkspaceMigrationV2ViewFieldActionsBuilderService,
    private readonly workspaceMigrationV2ViewFilterActionsBuilderService: WorkspaceMigrationV2ViewFilterActionsBuilderService,
    private readonly workspaceMigrationV2ViewGroupActionsBuilderService: WorkspaceMigrationV2ViewGroupActionsBuilderService,
    private readonly workspaceMigrationV2ServerlessFunctionActionsBuilderService: WorkspaceMigrationV2ServerlessFunctionActionsBuilderService,
    private readonly workspaceMigrationV2DatabaseEventTriggerActionsBuilderService: WorkspaceMigrationV2DatabaseEventTriggerActionsBuilderService,
    private readonly workspaceMigrationV2CronTriggerActionsBuilderService: WorkspaceMigrationV2CronTriggerActionsBuilderService,
    private readonly workspaceMigrationV2RouteTriggerActionsBuilderService: WorkspaceMigrationV2RouteTriggerActionsBuilderService,
    private readonly workspaceMigrationV2RoleTargetActionsBuilderService: WorkspaceMigrationV2RoleTargetActionsBuilderService,
    private readonly workspaceMigrationV2FieldActionsBuilderService: WorkspaceMigrationV2FieldActionsBuilderService,
    private readonly workspaceMigrationV2RoleActionsBuilderService: WorkspaceMigrationV2RoleActionsBuilderService,
    private readonly workspaceMigrationV2AgentActionsBuilderService: WorkspaceMigrationV2AgentActionsBuilderService,
    private readonly workspaceMigrationV2PageLayoutActionsBuilderService: WorkspaceMigrationV2PageLayoutActionsBuilderService,
    private readonly workspaceMigrationV2PageLayoutWidgetActionsBuilderService: WorkspaceMigrationV2PageLayoutWidgetActionsBuilderService,
    private readonly workspaceMigrationV2PageLayoutTabActionsBuilderService: WorkspaceMigrationV2PageLayoutTabActionsBuilderService,
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

        if (
          !isDefined(fromToOccurence) ||
          isDefined(allFlatEntityMaps[currFlatMaps])
        ) {
          return allFlatEntityMaps;
        }

        return {
          ...allFlatEntityMaps,
          [currFlatMaps]: fromToOccurence.from,
        };
      },
      {
        ...createEmptyAllFlatEntityMaps(),
        ...dependencyAllFlatEntityMaps,
      },
    );
  }

  private mergeFlatEntityMapsAndRelatedFlatEntityMapsInAllFlatEntityMapsThroughMutation<
    T extends AllMetadataName,
  >({
    allFlatEntityMaps,
    flatEntityMapsAndRelatedFlatEntityMaps,
  }: {
    flatEntityMapsAndRelatedFlatEntityMaps: MetadataFlatEntityAndRelatedFlatEntityMaps<T>;
    allFlatEntityMaps: AllFlatEntityMaps;
  }) {
    const flatEntityMapsKeys = Object.keys(
      flatEntityMapsAndRelatedFlatEntityMaps,
    ) as (keyof MetadataFlatEntityAndRelatedFlatEntityMaps<T>)[];

    for (const flatEntityMapsKey of flatEntityMapsKeys) {
      // @ts-expect-error TODO improve
      allFlatEntityMaps[flatEntityMapsKey] =
        flatEntityMapsAndRelatedFlatEntityMaps[flatEntityMapsKey];
    }
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
      ...createEmptyOrchestratorActionsReport(),
    });
    const orchestratorFailureReport = structuredClone(
      EMPTY_ORCHESTRATOR_FAILURE_REPORT(),
    );

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
      flatViewFilterMaps,
      flatViewGroupMaps,
      flatRoleMaps,
      flatRoleTargetMaps,
      flatAgentMaps,
      flatPageLayoutMaps,
      flatPageLayoutWidgetMaps,
      flatPageLayoutTabMaps,
    } = fromToAllFlatEntityMaps;

    if (isDefined(flatObjectMetadataMaps)) {
      const { from: fromFlatObjectMetadataMaps, to: toFlatObjectMetadataMaps } =
        flatObjectMetadataMaps;

      const objectResult =
        this.workspaceMigrationV2ObjectActionsBuilderService.validateAndBuild({
          buildOptions,
          // Note: That's a hacky way to allow validating object against field metadatas, not optimal
          dependencyOptimisticFlatEntityMaps: {
            flatFieldMetadataMaps: {
              byId: {
                ...dependencyAllFlatEntityMaps?.flatFieldMetadataMaps?.byId,
                ...flatFieldMetadataMaps?.from.byId,
                ...flatFieldMetadataMaps?.to.byId,
              },
              idByUniversalIdentifier: {
                ...dependencyAllFlatEntityMaps?.flatFieldMetadataMaps
                  ?.idByUniversalIdentifier,
                ...flatFieldMetadataMaps?.from.idByUniversalIdentifier,
                ...flatFieldMetadataMaps?.to.idByUniversalIdentifier,
              },
              universalIdentifiersByApplicationId: {
                ...dependencyAllFlatEntityMaps?.flatFieldMetadataMaps
                  ?.universalIdentifiersByApplicationId,
                ...flatFieldMetadataMaps?.from
                  .universalIdentifiersByApplicationId,
                ...flatFieldMetadataMaps?.to
                  .universalIdentifiersByApplicationId,
              },
            },
          },
          ///
          from: fromFlatObjectMetadataMaps,
          to: toFlatObjectMetadataMaps,
          workspaceId,
        });

      this.mergeFlatEntityMapsAndRelatedFlatEntityMapsInAllFlatEntityMapsThroughMutation(
        {
          allFlatEntityMaps: optimisticAllFlatEntityMaps,
          flatEntityMapsAndRelatedFlatEntityMaps:
            objectResult.optimisticFlatEntityMapsAndRelatedFlatEntityMaps,
        },
      );

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
        this.workspaceMigrationV2FieldActionsBuilderService.validateAndBuild({
          from: fromFlatFieldMetadataMaps,
          to: toFlatFieldMetadataMaps,
          buildOptions,
          dependencyOptimisticFlatEntityMaps: {
            flatObjectMetadataMaps:
              optimisticAllFlatEntityMaps.flatObjectMetadataMaps,
          },
          workspaceId,
        });

      this.mergeFlatEntityMapsAndRelatedFlatEntityMapsInAllFlatEntityMapsThroughMutation(
        {
          allFlatEntityMaps: optimisticAllFlatEntityMaps,
          flatEntityMapsAndRelatedFlatEntityMaps:
            fieldResult.optimisticFlatEntityMapsAndRelatedFlatEntityMaps,
        },
      );

      if (fieldResult.status === 'fail') {
        orchestratorFailureReport.fieldMetadata.push(...fieldResult.errors);
      } else {
        orchestratorActionsReport.fieldMetadata = fieldResult.actions;
      }
    }

    if (isDefined(flatIndexMaps)) {
      const { from: fromFlatIndexMaps, to: toFlatIndexMaps } = flatIndexMaps;
      const indexResult =
        this.workspaceMigrationV2IndexActionsBuilderService.validateAndBuild({
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
        });

      this.mergeFlatEntityMapsAndRelatedFlatEntityMapsInAllFlatEntityMapsThroughMutation(
        {
          allFlatEntityMaps: optimisticAllFlatEntityMaps,
          flatEntityMapsAndRelatedFlatEntityMaps:
            indexResult.optimisticFlatEntityMapsAndRelatedFlatEntityMaps,
        },
      );

      if (indexResult.status === 'fail') {
        orchestratorFailureReport.index.push(...indexResult.errors);
      } else {
        orchestratorActionsReport.index = indexResult.actions;
      }
    }

    if (isDefined(flatViewMaps)) {
      const { from: fromFlatViewMaps, to: toFlatViewMaps } = flatViewMaps;
      const viewResult =
        this.workspaceMigrationV2ViewActionsBuilderService.validateAndBuild({
          dependencyOptimisticFlatEntityMaps: {
            flatObjectMetadataMaps:
              optimisticAllFlatEntityMaps.flatObjectMetadataMaps,
            flatFieldMetadataMaps:
              optimisticAllFlatEntityMaps.flatFieldMetadataMaps,
          },
          from: fromFlatViewMaps,
          to: toFlatViewMaps,
          buildOptions,
          workspaceId,
        });

      this.mergeFlatEntityMapsAndRelatedFlatEntityMapsInAllFlatEntityMapsThroughMutation(
        {
          allFlatEntityMaps: optimisticAllFlatEntityMaps,
          flatEntityMapsAndRelatedFlatEntityMaps:
            viewResult.optimisticFlatEntityMapsAndRelatedFlatEntityMaps,
        },
      );

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
        this.workspaceMigrationV2ViewFieldActionsBuilderService.validateAndBuild(
          {
            from: fromFlatViewFieldMaps,
            to: toFlatViewFieldMaps,
            buildOptions,
            dependencyOptimisticFlatEntityMaps: {
              flatObjectMetadataMaps:
                optimisticAllFlatEntityMaps.flatObjectMetadataMaps,
              flatFieldMetadataMaps:
                optimisticAllFlatEntityMaps.flatFieldMetadataMaps,
              flatViewMaps: optimisticAllFlatEntityMaps.flatViewMaps,
            },
            workspaceId,
          },
        );

      this.mergeFlatEntityMapsAndRelatedFlatEntityMapsInAllFlatEntityMapsThroughMutation(
        {
          allFlatEntityMaps: optimisticAllFlatEntityMaps,
          flatEntityMapsAndRelatedFlatEntityMaps:
            viewFieldResult.optimisticFlatEntityMapsAndRelatedFlatEntityMaps,
        },
      );

      if (viewFieldResult.status === 'fail') {
        orchestratorFailureReport.viewField.push(...viewFieldResult.errors);
      } else {
        orchestratorActionsReport.viewField = viewFieldResult.actions;
      }
    }

    if (isDefined(flatViewFilterMaps)) {
      const { from: fromFlatViewFilterMaps, to: toFlatViewFilterMaps } =
        flatViewFilterMaps;
      const viewFilterResult =
        this.workspaceMigrationV2ViewFilterActionsBuilderService.validateAndBuild(
          {
            from: fromFlatViewFilterMaps,
            to: toFlatViewFilterMaps,
            buildOptions,
            dependencyOptimisticFlatEntityMaps: {
              flatFieldMetadataMaps:
                optimisticAllFlatEntityMaps.flatFieldMetadataMaps,
              flatViewMaps: optimisticAllFlatEntityMaps.flatViewMaps,
            },
            workspaceId,
          },
        );

      this.mergeFlatEntityMapsAndRelatedFlatEntityMapsInAllFlatEntityMapsThroughMutation(
        {
          allFlatEntityMaps: optimisticAllFlatEntityMaps,
          flatEntityMapsAndRelatedFlatEntityMaps:
            viewFilterResult.optimisticFlatEntityMapsAndRelatedFlatEntityMaps,
        },
      );

      if (viewFilterResult.status === 'fail') {
        orchestratorFailureReport.viewFilter.push(...viewFilterResult.errors);
      } else {
        orchestratorActionsReport.viewFilter = viewFilterResult.actions;
      }
    }

    if (isDefined(flatViewGroupMaps)) {
      const { from: fromFlatViewGroupMaps, to: toFlatViewGroupMaps } =
        flatViewGroupMaps;
      const viewGroupResult =
        this.workspaceMigrationV2ViewGroupActionsBuilderService.validateAndBuild(
          {
            from: fromFlatViewGroupMaps,
            to: toFlatViewGroupMaps,
            buildOptions,
            dependencyOptimisticFlatEntityMaps: {
              flatFieldMetadataMaps:
                optimisticAllFlatEntityMaps.flatFieldMetadataMaps,
              flatViewMaps: optimisticAllFlatEntityMaps.flatViewMaps,
            },
            workspaceId,
          },
        );

      this.mergeFlatEntityMapsAndRelatedFlatEntityMapsInAllFlatEntityMapsThroughMutation(
        {
          allFlatEntityMaps: optimisticAllFlatEntityMaps,
          flatEntityMapsAndRelatedFlatEntityMaps:
            viewGroupResult.optimisticFlatEntityMapsAndRelatedFlatEntityMaps,
        },
      );

      if (viewGroupResult.status === 'fail') {
        orchestratorFailureReport.viewGroup.push(...viewGroupResult.errors);
      } else {
        orchestratorActionsReport.viewGroup = viewGroupResult.actions;
      }
    }

    if (isDefined(flatServerlessFunctionMaps)) {
      const {
        from: fromFlatServerlessFunctionMaps,
        to: toFlatServerlessFunctionMaps,
      } = flatServerlessFunctionMaps;

      const serverlessFunctionResult =
        this.workspaceMigrationV2ServerlessFunctionActionsBuilderService.validateAndBuild(
          {
            from: fromFlatServerlessFunctionMaps,
            to: toFlatServerlessFunctionMaps,
            buildOptions,
            dependencyOptimisticFlatEntityMaps: undefined,
            workspaceId,
          },
        );

      this.mergeFlatEntityMapsAndRelatedFlatEntityMapsInAllFlatEntityMapsThroughMutation(
        {
          allFlatEntityMaps: optimisticAllFlatEntityMaps,
          flatEntityMapsAndRelatedFlatEntityMaps:
            serverlessFunctionResult.optimisticFlatEntityMapsAndRelatedFlatEntityMaps,
        },
      );

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
        this.workspaceMigrationV2DatabaseEventTriggerActionsBuilderService.validateAndBuild(
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

      this.mergeFlatEntityMapsAndRelatedFlatEntityMapsInAllFlatEntityMapsThroughMutation(
        {
          allFlatEntityMaps: optimisticAllFlatEntityMaps,
          flatEntityMapsAndRelatedFlatEntityMaps:
            databaseEventTriggerResult.optimisticFlatEntityMapsAndRelatedFlatEntityMaps,
        },
      );

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
        this.workspaceMigrationV2CronTriggerActionsBuilderService.validateAndBuild(
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

      this.mergeFlatEntityMapsAndRelatedFlatEntityMapsInAllFlatEntityMapsThroughMutation(
        {
          allFlatEntityMaps: optimisticAllFlatEntityMaps,
          flatEntityMapsAndRelatedFlatEntityMaps:
            cronTriggerResult.optimisticFlatEntityMapsAndRelatedFlatEntityMaps,
        },
      );

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
        this.workspaceMigrationV2RouteTriggerActionsBuilderService.validateAndBuild(
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

      this.mergeFlatEntityMapsAndRelatedFlatEntityMapsInAllFlatEntityMapsThroughMutation(
        {
          allFlatEntityMaps: optimisticAllFlatEntityMaps,
          flatEntityMapsAndRelatedFlatEntityMaps:
            routeTriggerResult.optimisticFlatEntityMapsAndRelatedFlatEntityMaps,
        },
      );

      if (routeTriggerResult.status === 'fail') {
        orchestratorFailureReport.routeTrigger.push(
          ...routeTriggerResult.errors,
        );
      } else {
        orchestratorActionsReport.routeTrigger = routeTriggerResult.actions;
      }
    }

    if (isDefined(flatRoleMaps)) {
      const { from: fromFlatRoleMaps, to: toFlatRoleMaps } = flatRoleMaps;

      const roleResult =
        this.workspaceMigrationV2RoleActionsBuilderService.validateAndBuild({
          from: fromFlatRoleMaps,
          to: toFlatRoleMaps,
          buildOptions,
          dependencyOptimisticFlatEntityMaps: undefined,
          workspaceId,
        });

      this.mergeFlatEntityMapsAndRelatedFlatEntityMapsInAllFlatEntityMapsThroughMutation(
        {
          allFlatEntityMaps: optimisticAllFlatEntityMaps,
          flatEntityMapsAndRelatedFlatEntityMaps:
            roleResult.optimisticFlatEntityMapsAndRelatedFlatEntityMaps,
        },
      );

      if (roleResult.status === 'fail') {
        orchestratorFailureReport.role.push(...roleResult.errors);
      } else {
        orchestratorActionsReport.role = roleResult.actions;
      }
    }

    if (isDefined(flatRoleTargetMaps)) {
      const { from: fromFlatRoleTargetMaps, to: toFlatRoleTargetMaps } =
        flatRoleTargetMaps;

      const roleTargetResult =
        this.workspaceMigrationV2RoleTargetActionsBuilderService.validateAndBuild(
          {
            from: fromFlatRoleTargetMaps,
            to: toFlatRoleTargetMaps,
            buildOptions,
            dependencyOptimisticFlatEntityMaps: {
              flatAgentMaps: optimisticAllFlatEntityMaps.flatAgentMaps,
              flatRoleMaps: optimisticAllFlatEntityMaps.flatRoleMaps,
            },
            workspaceId,
          },
        );

      this.mergeFlatEntityMapsAndRelatedFlatEntityMapsInAllFlatEntityMapsThroughMutation(
        {
          allFlatEntityMaps: optimisticAllFlatEntityMaps,
          flatEntityMapsAndRelatedFlatEntityMaps:
            roleTargetResult.optimisticFlatEntityMapsAndRelatedFlatEntityMaps,
        },
      );

      if (roleTargetResult.status === 'fail') {
        orchestratorFailureReport.roleTarget.push(...roleTargetResult.errors);
      } else {
        orchestratorActionsReport.roleTarget = roleTargetResult.actions;
      }
    }

    if (isDefined(flatAgentMaps)) {
      const { from: fromFlatAgentMaps, to: toFlatAgentMaps } = flatAgentMaps;

      const agentResult =
        this.workspaceMigrationV2AgentActionsBuilderService.validateAndBuild({
          from: fromFlatAgentMaps,
          to: toFlatAgentMaps,
          buildOptions,
          dependencyOptimisticFlatEntityMaps: {
            flatRoleMaps: optimisticAllFlatEntityMaps.flatRoleMaps,
          },
          workspaceId,
        });

      this.mergeFlatEntityMapsAndRelatedFlatEntityMapsInAllFlatEntityMapsThroughMutation(
        {
          allFlatEntityMaps: optimisticAllFlatEntityMaps,
          flatEntityMapsAndRelatedFlatEntityMaps:
            agentResult.optimisticFlatEntityMapsAndRelatedFlatEntityMaps,
        },
      );

      if (agentResult.status === 'fail') {
        orchestratorFailureReport.agent.push(...agentResult.errors);
      } else {
        orchestratorActionsReport.agent = agentResult.actions;
      }
    }

    if (isDefined(flatPageLayoutMaps)) {
      const { from: fromFlatPageLayoutMaps, to: toFlatPageLayoutMaps } =
        flatPageLayoutMaps;

      const pageLayoutResult =
        this.workspaceMigrationV2PageLayoutActionsBuilderService.validateAndBuild(
          {
            from: fromFlatPageLayoutMaps,
            to: toFlatPageLayoutMaps,
            buildOptions,
            dependencyOptimisticFlatEntityMaps: undefined,
            workspaceId,
          },
        );

      this.mergeFlatEntityMapsAndRelatedFlatEntityMapsInAllFlatEntityMapsThroughMutation(
        {
          allFlatEntityMaps: optimisticAllFlatEntityMaps,
          flatEntityMapsAndRelatedFlatEntityMaps:
            pageLayoutResult.optimisticFlatEntityMapsAndRelatedFlatEntityMaps,
        },
      );

      if (pageLayoutResult.status === 'fail') {
        orchestratorFailureReport.pageLayout.push(...pageLayoutResult.errors);
      } else {
        orchestratorActionsReport.pageLayout = pageLayoutResult.actions;
      }
    }

    // Page layout tabs must be processed before page layout widgets because
    // widgets reference tabs, and the optimistic cache needs to contain the
    // newly created tabs before widget validation runs
    if (isDefined(flatPageLayoutTabMaps)) {
      const { from: fromFlatPageLayoutTabMaps, to: toFlatPageLayoutTabMaps } =
        flatPageLayoutTabMaps;

      const pageLayoutTabResult =
        this.workspaceMigrationV2PageLayoutTabActionsBuilderService.validateAndBuild(
          {
            from: fromFlatPageLayoutTabMaps,
            to: toFlatPageLayoutTabMaps,
            buildOptions,
            dependencyOptimisticFlatEntityMaps: {
              flatPageLayoutMaps:
                optimisticAllFlatEntityMaps.flatPageLayoutMaps,
            },
            workspaceId,
          },
        );

      this.mergeFlatEntityMapsAndRelatedFlatEntityMapsInAllFlatEntityMapsThroughMutation(
        {
          allFlatEntityMaps: optimisticAllFlatEntityMaps,
          flatEntityMapsAndRelatedFlatEntityMaps:
            pageLayoutTabResult.optimisticFlatEntityMapsAndRelatedFlatEntityMaps,
        },
      );

      if (pageLayoutTabResult.status === 'fail') {
        orchestratorFailureReport.pageLayoutTab.push(
          ...pageLayoutTabResult.errors,
        );
      } else {
        orchestratorActionsReport.pageLayoutTab = pageLayoutTabResult.actions;
      }
    }

    if (isDefined(flatPageLayoutWidgetMaps)) {
      const {
        from: fromFlatPageLayoutWidgetMaps,
        to: toFlatPageLayoutWidgetMaps,
      } = flatPageLayoutWidgetMaps;

      const pageLayoutWidgetResult =
        this.workspaceMigrationV2PageLayoutWidgetActionsBuilderService.validateAndBuild(
          {
            from: fromFlatPageLayoutWidgetMaps,
            to: toFlatPageLayoutWidgetMaps,
            buildOptions,
            dependencyOptimisticFlatEntityMaps: {
              flatPageLayoutTabMaps:
                optimisticAllFlatEntityMaps.flatPageLayoutTabMaps,
            },
            workspaceId,
          },
        );

      this.mergeFlatEntityMapsAndRelatedFlatEntityMapsInAllFlatEntityMapsThroughMutation(
        {
          allFlatEntityMaps: optimisticAllFlatEntityMaps,
          flatEntityMapsAndRelatedFlatEntityMaps:
            pageLayoutWidgetResult.optimisticFlatEntityMapsAndRelatedFlatEntityMaps,
        },
      );

      if (pageLayoutWidgetResult.status === 'fail') {
        orchestratorFailureReport.pageLayoutWidget.push(
          ...pageLayoutWidgetResult.errors,
        );
      } else {
        orchestratorActionsReport.pageLayoutWidget =
          pageLayoutWidgetResult.actions;
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
          ...aggregatedOrchestratorActionsReport.index.updated.flat(),
          ///

          // Views
          ...aggregatedOrchestratorActionsReport.view.deleted,
          ...aggregatedOrchestratorActionsReport.view.created,
          ...aggregatedOrchestratorActionsReport.view.updated,
          ...aggregatedOrchestratorActionsReport.viewField.deleted,
          ...aggregatedOrchestratorActionsReport.viewField.created,
          ...aggregatedOrchestratorActionsReport.viewField.updated,
          ...aggregatedOrchestratorActionsReport.viewFilter.deleted,
          ...aggregatedOrchestratorActionsReport.viewFilter.created,
          ...aggregatedOrchestratorActionsReport.viewFilter.updated,
          ...aggregatedOrchestratorActionsReport.viewGroup.deleted,
          ...aggregatedOrchestratorActionsReport.viewGroup.created,
          ...aggregatedOrchestratorActionsReport.viewGroup.updated,
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
          ...aggregatedOrchestratorActionsReport.routeTrigger.deleted,
          ...aggregatedOrchestratorActionsReport.routeTrigger.created,
          ...aggregatedOrchestratorActionsReport.routeTrigger.updated,
          ///

          // Roles
          ...aggregatedOrchestratorActionsReport.role.deleted,
          ...aggregatedOrchestratorActionsReport.role.created,
          ...aggregatedOrchestratorActionsReport.role.updated,
          ///

          // Role targets
          ...aggregatedOrchestratorActionsReport.roleTarget.deleted,
          ...aggregatedOrchestratorActionsReport.roleTarget.created,
          ...aggregatedOrchestratorActionsReport.roleTarget.updated,
          ///

          // Agents
          ...aggregatedOrchestratorActionsReport.agent.deleted,
          ...aggregatedOrchestratorActionsReport.agent.created,
          ...aggregatedOrchestratorActionsReport.agent.updated,
          ///

          // Page layouts
          ...aggregatedOrchestratorActionsReport.pageLayout.deleted,
          ...aggregatedOrchestratorActionsReport.pageLayout.created,
          ...aggregatedOrchestratorActionsReport.pageLayout.updated,
          ///

          // Page layout tabs
          ...aggregatedOrchestratorActionsReport.pageLayoutTab.deleted,
          ...aggregatedOrchestratorActionsReport.pageLayoutTab.created,
          ...aggregatedOrchestratorActionsReport.pageLayoutTab.updated,
          ///

          // Page layout widgets
          ...aggregatedOrchestratorActionsReport.pageLayoutWidget.deleted,
          ...aggregatedOrchestratorActionsReport.pageLayoutWidget.created,
          ...aggregatedOrchestratorActionsReport.pageLayoutWidget.updated,
          ///
        ],
        workspaceId,
      },
    };
  }
}
