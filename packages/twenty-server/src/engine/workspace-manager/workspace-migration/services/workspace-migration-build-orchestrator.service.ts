import { Injectable } from '@nestjs/common';

import { type AllMetadataName } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { createEmptyAllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-all-flat-entity-maps.constant';
import { type MetadataUniversalFlatEntityAndRelatedUniversalFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/metadata-related-types.type';
import { createEmptyOrchestratorActionsReport } from 'src/engine/workspace-manager/workspace-migration/constant/empty-orchestrator-actions-report.constant';
import { EMPTY_ORCHESTRATOR_FAILURE_REPORT } from 'src/engine/workspace-manager/workspace-migration/constant/empty-orchestrator-failure-report.constant';
import {
  type WorkspaceMigrationOrchestratorBuildArgs,
  type WorkspaceMigrationOrchestratorFailedResult,
  type WorkspaceMigrationOrchestratorSuccessfulResult,
} from 'src/engine/workspace-manager/workspace-migration/types/workspace-migration-orchestrator.type';
import { AllUniversalFlatEntityMaps } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/all-universal-flat-entity-maps.type';
import { aggregateOrchestratorActionsReport } from 'src/engine/workspace-manager/workspace-migration/utils/aggregate-orchestrator-actions-report.util';
import { WorkspaceMigrationAgentActionsBuilderService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/agent/workspace-migration-agent-actions-builder.service';
import { WorkspaceMigrationCommandMenuItemActionsBuilderService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/command-menu-item/workspace-migration-command-menu-item-actions-builder.service';
import { WorkspaceMigrationFieldActionsBuilderService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/field/workspace-migration-field-actions-builder.service';
import { WorkspaceMigrationFrontComponentActionsBuilderService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/front-component/workspace-migration-front-component-actions-builder.service';
import { WorkspaceMigrationIndexActionsBuilderService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/index/workspace-migration-index-actions-builder.service';
import { WorkspaceMigrationLogicFunctionActionsBuilderService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/logic-function/workspace-migration-logic-function-actions-builder.service';
import { WorkspaceMigrationNavigationMenuItemActionsBuilderService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/navigation-menu-item/workspace-migration-navigation-menu-item-actions-builder.service';
import { WorkspaceMigrationObjectActionsBuilderService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/object/workspace-migration-object-actions-builder.service';
import { WorkspaceMigrationPageLayoutTabActionsBuilderService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/page-layout-tab/workspace-migration-page-layout-tab-actions-builder.service';
import { WorkspaceMigrationPageLayoutWidgetActionsBuilderService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/page-layout-widget/workspace-migration-page-layout-widget-actions-builder.service';
import { WorkspaceMigrationPageLayoutActionsBuilderService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/page-layout/workspace-migration-page-layout-actions-builder.service';
import { WorkspaceMigrationRoleTargetActionsBuilderService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/role-target/workspace-migration-role-target-actions-builder.service';
import { WorkspaceMigrationRoleActionsBuilderService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/role/workspace-migration-role-actions-builder.service';
import { WorkspaceMigrationRowLevelPermissionPredicateGroupActionsBuilderService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/row-level-permission-predicate-group/workspace-migration-row-level-permission-predicate-group-actions-builder.service';
import { WorkspaceMigrationRowLevelPermissionPredicateActionsBuilderService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/row-level-permission-predicate/workspace-migration-row-level-permission-predicate-actions-builder.service';
import { WorkspaceMigrationSkillActionsBuilderService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/skill/workspace-migration-skill-actions-builder.service';
import { WorkspaceMigrationViewFieldActionsBuilderService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/view-field/workspace-migration-view-field-actions-builder.service';
import { WorkspaceMigrationViewFieldGroupActionsBuilderService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/view-field-group/workspace-migration-view-field-group-actions-builder.service';
import { WorkspaceMigrationViewFilterGroupActionsBuilderService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/view-filter-group/workspace-migration-view-filter-group-actions-builder.service';
import { WorkspaceMigrationViewFilterActionsBuilderService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/view-filter/workspace-migration-view-filter-actions-builder.service';
import { WorkspaceMigrationViewGroupActionsBuilderService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/view-group/workspace-migration-view-group-actions-builder.service';
import { WorkspaceMigrationViewActionsBuilderService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/view/workspace-migration-view-actions-builder.service';
import { WorkspaceMigrationWebhookActionsBuilderService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/webhook/workspace-migration-webhook-actions-builder.service';

@Injectable()
export class WorkspaceMigrationBuildOrchestratorService {
  constructor(
    private readonly workspaceMigrationObjectActionsBuilderService: WorkspaceMigrationObjectActionsBuilderService,
    private readonly workspaceMigrationIndexActionsBuilderService: WorkspaceMigrationIndexActionsBuilderService,
    private readonly workspaceMigrationViewActionsBuilderService: WorkspaceMigrationViewActionsBuilderService,
    private readonly workspaceMigrationViewFieldActionsBuilderService: WorkspaceMigrationViewFieldActionsBuilderService,
    private readonly workspaceMigrationViewFilterActionsBuilderService: WorkspaceMigrationViewFilterActionsBuilderService,
    private readonly workspaceMigrationViewFilterGroupActionsBuilderService: WorkspaceMigrationViewFilterGroupActionsBuilderService,
    private readonly workspaceMigrationViewGroupActionsBuilderService: WorkspaceMigrationViewGroupActionsBuilderService,
    private readonly workspaceMigrationViewFieldGroupActionsBuilderService: WorkspaceMigrationViewFieldGroupActionsBuilderService,
    private readonly workspaceMigrationLogicFunctionActionsBuilderService: WorkspaceMigrationLogicFunctionActionsBuilderService,
    private readonly workspaceMigrationRoleTargetActionsBuilderService: WorkspaceMigrationRoleTargetActionsBuilderService,
    private readonly workspaceMigrationFieldActionsBuilderService: WorkspaceMigrationFieldActionsBuilderService,
    private readonly workspaceMigrationRoleActionsBuilderService: WorkspaceMigrationRoleActionsBuilderService,
    private readonly workspaceMigrationAgentActionsBuilderService: WorkspaceMigrationAgentActionsBuilderService,
    private readonly workspaceMigrationSkillActionsBuilderService: WorkspaceMigrationSkillActionsBuilderService,
    private readonly workspaceMigrationCommandMenuItemActionsBuilderService: WorkspaceMigrationCommandMenuItemActionsBuilderService,
    private readonly workspaceMigrationNavigationMenuItemActionsBuilderService: WorkspaceMigrationNavigationMenuItemActionsBuilderService,
    private readonly workspaceMigrationPageLayoutActionsBuilderService: WorkspaceMigrationPageLayoutActionsBuilderService,
    private readonly workspaceMigrationPageLayoutWidgetActionsBuilderService: WorkspaceMigrationPageLayoutWidgetActionsBuilderService,
    private readonly workspaceMigrationPageLayoutTabActionsBuilderService: WorkspaceMigrationPageLayoutTabActionsBuilderService,
    private readonly workspaceMigrationRowLevelPermissionPredicateActionsBuilderService: WorkspaceMigrationRowLevelPermissionPredicateActionsBuilderService,
    private readonly workspaceMigrationRowLevelPermissionPredicateGroupActionsBuilderService: WorkspaceMigrationRowLevelPermissionPredicateGroupActionsBuilderService,
    private readonly workspaceMigrationFrontComponentActionsBuilderService: WorkspaceMigrationFrontComponentActionsBuilderService,
    private readonly workspaceMigrationWebhookActionsBuilderService: WorkspaceMigrationWebhookActionsBuilderService,
  ) {}

  private setupOptimisticCache({
    fromToAllFlatEntityMaps,
    dependencyAllFlatEntityMaps,
  }: Pick<
    WorkspaceMigrationOrchestratorBuildArgs,
    'fromToAllFlatEntityMaps' | 'dependencyAllFlatEntityMaps'
  >): AllUniversalFlatEntityMaps {
    const allFromToFlatEntityMapsKeys = Object.keys(
      fromToAllFlatEntityMaps,
    ) as (keyof AllUniversalFlatEntityMaps)[];

    return allFromToFlatEntityMapsKeys.reduce<AllUniversalFlatEntityMaps>(
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
    flatEntityMapsAndRelatedFlatEntityMaps: MetadataUniversalFlatEntityAndRelatedUniversalFlatEntityMaps<T>;
    allFlatEntityMaps: AllUniversalFlatEntityMaps;
  }) {
    const flatEntityMapsKeys = Object.keys(
      flatEntityMapsAndRelatedFlatEntityMaps,
    ) as (keyof MetadataUniversalFlatEntityAndRelatedUniversalFlatEntityMaps<T>)[];

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
    additionalCacheDataMaps,
    applicationUniversalIdentifier,
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
      flatLogicFunctionMaps,
      flatFieldMetadataMaps,
      flatViewFilterMaps,
      flatViewFilterGroupMaps,
      flatViewGroupMaps,
      flatViewFieldGroupMaps,
      flatRowLevelPermissionPredicateMaps,
      flatRowLevelPermissionPredicateGroupMaps,
      flatRoleMaps,
      flatRoleTargetMaps,
      flatAgentMaps,
      flatSkillMaps,
      flatCommandMenuItemMaps,
      flatNavigationMenuItemMaps,
      flatPageLayoutMaps,
      flatPageLayoutWidgetMaps,
      flatPageLayoutTabMaps,
      flatFrontComponentMaps,
      flatWebhookMaps,
    } = fromToAllFlatEntityMaps;

    if (isDefined(flatObjectMetadataMaps)) {
      const { from: fromFlatObjectMetadataMaps, to: toFlatObjectMetadataMaps } =
        flatObjectMetadataMaps;

      const objectResult =
        await this.workspaceMigrationObjectActionsBuilderService.validateAndBuild(
          {
            additionalCacheDataMaps,
            buildOptions,
            // Note: That's a hacky way to allow validating object against field metadatas, not optimal
            dependencyOptimisticFlatEntityMaps: {
              flatFieldMetadataMaps: {
                byUniversalIdentifier: {
                  ...dependencyAllFlatEntityMaps?.flatFieldMetadataMaps
                    ?.byUniversalIdentifier,
                  ...flatFieldMetadataMaps?.from.byUniversalIdentifier,
                  ...flatFieldMetadataMaps?.to.byUniversalIdentifier,
                },
              },
            },
            ///
            from: fromFlatObjectMetadataMaps,
            to: toFlatObjectMetadataMaps,
            workspaceId,
          },
        );

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
        await this.workspaceMigrationFieldActionsBuilderService.validateAndBuild(
          {
            additionalCacheDataMaps,
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
        await this.workspaceMigrationIndexActionsBuilderService.validateAndBuild(
          {
            additionalCacheDataMaps,
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
        await this.workspaceMigrationViewActionsBuilderService.validateAndBuild(
          {
            additionalCacheDataMaps,
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
          },
        );

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

    if (isDefined(flatViewFieldGroupMaps)) {
      const { from: fromFlatViewFieldGroupMaps, to: toFlatViewFieldGroupMaps } =
        flatViewFieldGroupMaps;

      const viewFieldGroupResult =
        await this.workspaceMigrationViewFieldGroupActionsBuilderService.validateAndBuild(
          {
            additionalCacheDataMaps,
            from: fromFlatViewFieldGroupMaps,
            to: toFlatViewFieldGroupMaps,
            buildOptions,
            dependencyOptimisticFlatEntityMaps: {
              flatViewMaps: optimisticAllFlatEntityMaps.flatViewMaps,
            },
            workspaceId,
          },
        );

      this.mergeFlatEntityMapsAndRelatedFlatEntityMapsInAllFlatEntityMapsThroughMutation(
        {
          allFlatEntityMaps: optimisticAllFlatEntityMaps,
          flatEntityMapsAndRelatedFlatEntityMaps:
            viewFieldGroupResult.optimisticFlatEntityMapsAndRelatedFlatEntityMaps,
        },
      );

      if (viewFieldGroupResult.status === 'fail') {
        orchestratorFailureReport.viewFieldGroup.push(
          ...viewFieldGroupResult.errors,
        );
      } else {
        orchestratorActionsReport.viewFieldGroup = viewFieldGroupResult.actions;
      }
    }

    if (isDefined(flatViewFieldMaps)) {
      const { from: fromFlatViewFieldMaps, to: toFlatViewFieldMaps } =
        flatViewFieldMaps;
      const viewFieldResult =
        await this.workspaceMigrationViewFieldActionsBuilderService.validateAndBuild(
          {
            additionalCacheDataMaps,
            from: fromFlatViewFieldMaps,
            to: toFlatViewFieldMaps,
            buildOptions,
            dependencyOptimisticFlatEntityMaps: {
              flatObjectMetadataMaps:
                optimisticAllFlatEntityMaps.flatObjectMetadataMaps,
              flatFieldMetadataMaps:
                optimisticAllFlatEntityMaps.flatFieldMetadataMaps,
              flatViewMaps: optimisticAllFlatEntityMaps.flatViewMaps,
              flatViewFieldGroupMaps:
                optimisticAllFlatEntityMaps.flatViewFieldGroupMaps,
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

    if (isDefined(flatViewFilterGroupMaps)) {
      const {
        from: fromFlatViewFilterGroupMaps,
        to: toFlatViewFilterGroupMaps,
      } = flatViewFilterGroupMaps;

      const viewFilterGroupResult =
        await this.workspaceMigrationViewFilterGroupActionsBuilderService.validateAndBuild(
          {
            additionalCacheDataMaps,
            from: fromFlatViewFilterGroupMaps,
            to: toFlatViewFilterGroupMaps,
            buildOptions,
            dependencyOptimisticFlatEntityMaps: {
              flatViewMaps: optimisticAllFlatEntityMaps.flatViewMaps,
            },
            workspaceId,
          },
        );

      this.mergeFlatEntityMapsAndRelatedFlatEntityMapsInAllFlatEntityMapsThroughMutation(
        {
          allFlatEntityMaps: optimisticAllFlatEntityMaps,
          flatEntityMapsAndRelatedFlatEntityMaps:
            viewFilterGroupResult.optimisticFlatEntityMapsAndRelatedFlatEntityMaps,
        },
      );

      if (viewFilterGroupResult.status === 'fail') {
        orchestratorFailureReport.viewFilterGroup.push(
          ...viewFilterGroupResult.errors,
        );
      } else {
        orchestratorActionsReport.viewFilterGroup =
          viewFilterGroupResult.actions;
      }
    }

    if (isDefined(flatViewFilterMaps)) {
      const { from: fromFlatViewFilterMaps, to: toFlatViewFilterMaps } =
        flatViewFilterMaps;
      const viewFilterResult =
        await this.workspaceMigrationViewFilterActionsBuilderService.validateAndBuild(
          {
            additionalCacheDataMaps,
            from: fromFlatViewFilterMaps,
            to: toFlatViewFilterMaps,
            buildOptions,
            dependencyOptimisticFlatEntityMaps: {
              flatFieldMetadataMaps:
                optimisticAllFlatEntityMaps.flatFieldMetadataMaps,
              flatViewMaps: optimisticAllFlatEntityMaps.flatViewMaps,
              flatViewFilterGroupMaps:
                optimisticAllFlatEntityMaps.flatViewFilterGroupMaps,
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
        await this.workspaceMigrationViewGroupActionsBuilderService.validateAndBuild(
          {
            additionalCacheDataMaps,
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

    if (isDefined(flatRowLevelPermissionPredicateGroupMaps)) {
      const {
        from: fromFlatRowLevelPermissionPredicateGroupMaps,
        to: toFlatRowLevelPermissionPredicateGroupMaps,
      } = flatRowLevelPermissionPredicateGroupMaps;
      const rowLevelPermissionPredicateGroupResult =
        await this.workspaceMigrationRowLevelPermissionPredicateGroupActionsBuilderService.validateAndBuild(
          {
            additionalCacheDataMaps,
            from: fromFlatRowLevelPermissionPredicateGroupMaps,
            to: toFlatRowLevelPermissionPredicateGroupMaps,
            buildOptions,
            dependencyOptimisticFlatEntityMaps: {
              flatRoleMaps: optimisticAllFlatEntityMaps.flatRoleMaps,
              flatObjectMetadataMaps:
                optimisticAllFlatEntityMaps.flatObjectMetadataMaps,
            },
            workspaceId,
          },
        );

      this.mergeFlatEntityMapsAndRelatedFlatEntityMapsInAllFlatEntityMapsThroughMutation(
        {
          allFlatEntityMaps: optimisticAllFlatEntityMaps,
          flatEntityMapsAndRelatedFlatEntityMaps:
            rowLevelPermissionPredicateGroupResult.optimisticFlatEntityMapsAndRelatedFlatEntityMaps,
        },
      );

      if (rowLevelPermissionPredicateGroupResult.status === 'fail') {
        orchestratorFailureReport.rowLevelPermissionPredicateGroup.push(
          ...rowLevelPermissionPredicateGroupResult.errors,
        );
      } else {
        orchestratorActionsReport.rowLevelPermissionPredicateGroup =
          rowLevelPermissionPredicateGroupResult.actions;
      }
    }

    if (isDefined(flatRowLevelPermissionPredicateMaps)) {
      const {
        from: fromFlatRowLevelPermissionPredicateMaps,
        to: toFlatRowLevelPermissionPredicateMaps,
      } = flatRowLevelPermissionPredicateMaps;
      const rowLevelPermissionPredicateResult =
        await this.workspaceMigrationRowLevelPermissionPredicateActionsBuilderService.validateAndBuild(
          {
            additionalCacheDataMaps,
            from: fromFlatRowLevelPermissionPredicateMaps,
            to: toFlatRowLevelPermissionPredicateMaps,
            buildOptions,
            dependencyOptimisticFlatEntityMaps: {
              flatFieldMetadataMaps:
                optimisticAllFlatEntityMaps.flatFieldMetadataMaps,
              flatObjectMetadataMaps:
                optimisticAllFlatEntityMaps.flatObjectMetadataMaps,
              flatRowLevelPermissionPredicateGroupMaps:
                optimisticAllFlatEntityMaps.flatRowLevelPermissionPredicateGroupMaps,
              flatRoleMaps: optimisticAllFlatEntityMaps.flatRoleMaps,
            },
            workspaceId,
          },
        );

      this.mergeFlatEntityMapsAndRelatedFlatEntityMapsInAllFlatEntityMapsThroughMutation(
        {
          allFlatEntityMaps: optimisticAllFlatEntityMaps,
          flatEntityMapsAndRelatedFlatEntityMaps:
            rowLevelPermissionPredicateResult.optimisticFlatEntityMapsAndRelatedFlatEntityMaps,
        },
      );

      if (rowLevelPermissionPredicateResult.status === 'fail') {
        orchestratorFailureReport.rowLevelPermissionPredicate.push(
          ...rowLevelPermissionPredicateResult.errors,
        );
      } else {
        orchestratorActionsReport.rowLevelPermissionPredicate =
          rowLevelPermissionPredicateResult.actions;
      }
    }

    if (isDefined(flatLogicFunctionMaps)) {
      const { from: fromFlatLogicFunctionMaps, to: toFlatLogicFunctionMaps } =
        flatLogicFunctionMaps;

      const logicFunctionResult =
        await this.workspaceMigrationLogicFunctionActionsBuilderService.validateAndBuild(
          {
            additionalCacheDataMaps,
            from: fromFlatLogicFunctionMaps,
            to: toFlatLogicFunctionMaps,
            buildOptions,
            dependencyOptimisticFlatEntityMaps: undefined,
            workspaceId,
          },
        );

      this.mergeFlatEntityMapsAndRelatedFlatEntityMapsInAllFlatEntityMapsThroughMutation(
        {
          allFlatEntityMaps: optimisticAllFlatEntityMaps,
          flatEntityMapsAndRelatedFlatEntityMaps:
            logicFunctionResult.optimisticFlatEntityMapsAndRelatedFlatEntityMaps,
        },
      );

      if (logicFunctionResult.status === 'fail') {
        orchestratorFailureReport.logicFunction.push(
          ...logicFunctionResult.errors,
        );
      } else {
        orchestratorActionsReport.logicFunction = logicFunctionResult.actions;
      }
    }

    if (isDefined(flatRoleMaps)) {
      const { from: fromFlatRoleMaps, to: toFlatRoleMaps } = flatRoleMaps;

      const roleResult =
        await this.workspaceMigrationRoleActionsBuilderService.validateAndBuild(
          {
            additionalCacheDataMaps,
            from: fromFlatRoleMaps,
            to: toFlatRoleMaps,
            buildOptions,
            dependencyOptimisticFlatEntityMaps: undefined,
            workspaceId,
          },
        );

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
        await this.workspaceMigrationRoleTargetActionsBuilderService.validateAndBuild(
          {
            additionalCacheDataMaps,
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
        await this.workspaceMigrationAgentActionsBuilderService.validateAndBuild(
          {
            additionalCacheDataMaps,
            from: fromFlatAgentMaps,
            to: toFlatAgentMaps,
            buildOptions,
            dependencyOptimisticFlatEntityMaps: {
              flatRoleMaps: optimisticAllFlatEntityMaps.flatRoleMaps,
            },
            workspaceId,
          },
        );

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

    if (isDefined(flatSkillMaps)) {
      const { from: fromFlatSkillMaps, to: toFlatSkillMaps } = flatSkillMaps;

      const skillResult =
        await this.workspaceMigrationSkillActionsBuilderService.validateAndBuild(
          {
            additionalCacheDataMaps,
            from: fromFlatSkillMaps,
            to: toFlatSkillMaps,
            buildOptions,
            dependencyOptimisticFlatEntityMaps: undefined,
            workspaceId,
          },
        );

      this.mergeFlatEntityMapsAndRelatedFlatEntityMapsInAllFlatEntityMapsThroughMutation(
        {
          allFlatEntityMaps: optimisticAllFlatEntityMaps,
          flatEntityMapsAndRelatedFlatEntityMaps:
            skillResult.optimisticFlatEntityMapsAndRelatedFlatEntityMaps,
        },
      );

      if (skillResult.status === 'fail') {
        orchestratorFailureReport.skill.push(...skillResult.errors);
      } else {
        orchestratorActionsReport.skill = skillResult.actions;
      }
    }

    if (isDefined(flatCommandMenuItemMaps)) {
      const {
        from: fromFlatCommandMenuItemMaps,
        to: toFlatCommandMenuItemMaps,
      } = flatCommandMenuItemMaps;

      const commandMenuItemResult =
        await this.workspaceMigrationCommandMenuItemActionsBuilderService.validateAndBuild(
          {
            additionalCacheDataMaps,
            from: fromFlatCommandMenuItemMaps,
            to: toFlatCommandMenuItemMaps,
            buildOptions,
            dependencyOptimisticFlatEntityMaps: {
              flatObjectMetadataMaps:
                optimisticAllFlatEntityMaps.flatObjectMetadataMaps,
              flatFrontComponentMaps:
                optimisticAllFlatEntityMaps.flatFrontComponentMaps,
            },
            workspaceId,
          },
        );

      this.mergeFlatEntityMapsAndRelatedFlatEntityMapsInAllFlatEntityMapsThroughMutation(
        {
          allFlatEntityMaps: optimisticAllFlatEntityMaps,
          flatEntityMapsAndRelatedFlatEntityMaps:
            commandMenuItemResult.optimisticFlatEntityMapsAndRelatedFlatEntityMaps,
        },
      );

      if (commandMenuItemResult.status === 'fail') {
        orchestratorFailureReport.commandMenuItem.push(
          ...commandMenuItemResult.errors,
        );
      } else {
        orchestratorActionsReport.commandMenuItem =
          commandMenuItemResult.actions;
      }
    }

    if (isDefined(flatNavigationMenuItemMaps)) {
      const {
        from: fromFlatNavigationMenuItemMaps,
        to: toFlatNavigationMenuItemMaps,
      } = flatNavigationMenuItemMaps;

      const navigationMenuItemResult =
        await this.workspaceMigrationNavigationMenuItemActionsBuilderService.validateAndBuild(
          {
            additionalCacheDataMaps,
            from: fromFlatNavigationMenuItemMaps,
            to: toFlatNavigationMenuItemMaps,
            buildOptions,
            dependencyOptimisticFlatEntityMaps: {
              flatObjectMetadataMaps:
                optimisticAllFlatEntityMaps.flatObjectMetadataMaps,
              flatViewMaps: optimisticAllFlatEntityMaps.flatViewMaps,
            },
            workspaceId,
          },
        );

      this.mergeFlatEntityMapsAndRelatedFlatEntityMapsInAllFlatEntityMapsThroughMutation(
        {
          allFlatEntityMaps: optimisticAllFlatEntityMaps,
          flatEntityMapsAndRelatedFlatEntityMaps:
            navigationMenuItemResult.optimisticFlatEntityMapsAndRelatedFlatEntityMaps,
        },
      );

      if (navigationMenuItemResult.status === 'fail') {
        orchestratorFailureReport.navigationMenuItem.push(
          ...navigationMenuItemResult.errors,
        );
      } else {
        orchestratorActionsReport.navigationMenuItem =
          navigationMenuItemResult.actions;
      }
    }

    if (isDefined(flatPageLayoutMaps)) {
      const { from: fromFlatPageLayoutMaps, to: toFlatPageLayoutMaps } =
        flatPageLayoutMaps;

      const pageLayoutResult =
        await this.workspaceMigrationPageLayoutActionsBuilderService.validateAndBuild(
          {
            additionalCacheDataMaps,
            from: fromFlatPageLayoutMaps,
            to: toFlatPageLayoutMaps,
            buildOptions,
            dependencyOptimisticFlatEntityMaps: {
              flatObjectMetadataMaps:
                optimisticAllFlatEntityMaps.flatObjectMetadataMaps,
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
        await this.workspaceMigrationPageLayoutTabActionsBuilderService.validateAndBuild(
          {
            additionalCacheDataMaps,
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
        await this.workspaceMigrationPageLayoutWidgetActionsBuilderService.validateAndBuild(
          {
            additionalCacheDataMaps,
            from: fromFlatPageLayoutWidgetMaps,
            to: toFlatPageLayoutWidgetMaps,
            buildOptions,
            dependencyOptimisticFlatEntityMaps: {
              flatObjectMetadataMaps:
                optimisticAllFlatEntityMaps.flatObjectMetadataMaps,
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

    if (isDefined(flatFrontComponentMaps)) {
      const { from: fromFlatFrontComponentMaps, to: toFlatFrontComponentMaps } =
        flatFrontComponentMaps;

      const frontComponentResult =
        await this.workspaceMigrationFrontComponentActionsBuilderService.validateAndBuild(
          {
            additionalCacheDataMaps,
            from: fromFlatFrontComponentMaps,
            to: toFlatFrontComponentMaps,
            buildOptions,
            dependencyOptimisticFlatEntityMaps: undefined,
            workspaceId,
          },
        );

      this.mergeFlatEntityMapsAndRelatedFlatEntityMapsInAllFlatEntityMapsThroughMutation(
        {
          allFlatEntityMaps: optimisticAllFlatEntityMaps,
          flatEntityMapsAndRelatedFlatEntityMaps:
            frontComponentResult.optimisticFlatEntityMapsAndRelatedFlatEntityMaps,
        },
      );

      if (frontComponentResult.status === 'fail') {
        orchestratorFailureReport.frontComponent.push(
          ...frontComponentResult.errors,
        );
      } else {
        orchestratorActionsReport.frontComponent = frontComponentResult.actions;
      }
    }

    if (isDefined(flatWebhookMaps)) {
      const { from: fromFlatWebhookMaps, to: toFlatWebhookMaps } =
        flatWebhookMaps;

      const webhookResult =
        await this.workspaceMigrationWebhookActionsBuilderService.validateAndBuild(
          {
            additionalCacheDataMaps,
            from: fromFlatWebhookMaps,
            to: toFlatWebhookMaps,
            buildOptions,
            dependencyOptimisticFlatEntityMaps: undefined,
            workspaceId,
          },
        );

      this.mergeFlatEntityMapsAndRelatedFlatEntityMapsInAllFlatEntityMapsThroughMutation(
        {
          allFlatEntityMaps: optimisticAllFlatEntityMaps,
          flatEntityMapsAndRelatedFlatEntityMaps:
            webhookResult.optimisticFlatEntityMapsAndRelatedFlatEntityMaps,
        },
      );

      if (webhookResult.status === 'fail') {
        orchestratorFailureReport.webhook.push(...webhookResult.errors);
      } else {
        orchestratorActionsReport.webhook = webhookResult.actions;
      }
    }

    const allErrors = Object.values(orchestratorFailureReport);

    if (allErrors.some((report) => report.length > 0)) {
      return {
        status: 'fail',
        report: orchestratorFailureReport,
      };
    }

    const { aggregatedOrchestratorActionsReport } =
      aggregateOrchestratorActionsReport({
        orchestratorActionsReport,
        flatFieldMetadataMaps:
          optimisticAllFlatEntityMaps.flatFieldMetadataMaps,
      });

    return {
      status: 'success',
      workspaceMigration: {
        applicationUniversalIdentifier,
        actions: [
          // Object and fields and indexes
          ...aggregatedOrchestratorActionsReport.index.delete,
          ...aggregatedOrchestratorActionsReport.fieldMetadata.delete,
          ...aggregatedOrchestratorActionsReport.objectMetadata.delete,
          ...aggregatedOrchestratorActionsReport.objectMetadata.create,
          ...aggregatedOrchestratorActionsReport.objectMetadata.update,
          ...aggregatedOrchestratorActionsReport.fieldMetadata.create,
          ...aggregatedOrchestratorActionsReport.fieldMetadata.update,
          ...aggregatedOrchestratorActionsReport.index.create,
          ...aggregatedOrchestratorActionsReport.index.update.flat(),
          ///

          // Views
          ...aggregatedOrchestratorActionsReport.view.delete,
          ...aggregatedOrchestratorActionsReport.view.create,
          ...aggregatedOrchestratorActionsReport.view.update,
          ...aggregatedOrchestratorActionsReport.viewField.delete,
          ...aggregatedOrchestratorActionsReport.viewFieldGroup.delete,
          ...aggregatedOrchestratorActionsReport.viewFieldGroup.create,
          ...aggregatedOrchestratorActionsReport.viewFieldGroup.update,
          ...aggregatedOrchestratorActionsReport.viewField.create,
          ...aggregatedOrchestratorActionsReport.viewField.update,
          ...aggregatedOrchestratorActionsReport.viewFilterGroup.delete,
          ...aggregatedOrchestratorActionsReport.viewFilterGroup.create,
          ...aggregatedOrchestratorActionsReport.viewFilterGroup.update,
          ...aggregatedOrchestratorActionsReport.viewFilter.delete,
          ...aggregatedOrchestratorActionsReport.viewFilter.create,
          ...aggregatedOrchestratorActionsReport.viewFilter.update,
          ...aggregatedOrchestratorActionsReport.viewGroup.delete,
          ...aggregatedOrchestratorActionsReport.viewGroup.create,
          ...aggregatedOrchestratorActionsReport.viewGroup.update,
          ///

          // Logic functions
          ...aggregatedOrchestratorActionsReport.logicFunction.delete,
          ...aggregatedOrchestratorActionsReport.logicFunction.create,
          ...aggregatedOrchestratorActionsReport.logicFunction.update,
          ///

          // Roles
          ...aggregatedOrchestratorActionsReport.role.delete,
          ...aggregatedOrchestratorActionsReport.role.create,
          ...aggregatedOrchestratorActionsReport.role.update,
          ///

          // Role targets
          ...aggregatedOrchestratorActionsReport.roleTarget.delete,
          ...aggregatedOrchestratorActionsReport.roleTarget.create,
          ...aggregatedOrchestratorActionsReport.roleTarget.update,
          ///

          // Agents
          ...aggregatedOrchestratorActionsReport.agent.delete,
          ...aggregatedOrchestratorActionsReport.agent.create,
          ...aggregatedOrchestratorActionsReport.agent.update,
          ///

          // Skills
          ...aggregatedOrchestratorActionsReport.skill.delete,
          ...aggregatedOrchestratorActionsReport.skill.create,
          ...aggregatedOrchestratorActionsReport.skill.update,
          ///

          // Command Menu Items
          ...aggregatedOrchestratorActionsReport.commandMenuItem.delete,
          ...aggregatedOrchestratorActionsReport.commandMenuItem.create,
          ...aggregatedOrchestratorActionsReport.commandMenuItem.update,
          ///

          // Navigation Menu Items
          ...aggregatedOrchestratorActionsReport.navigationMenuItem.delete,
          ...aggregatedOrchestratorActionsReport.navigationMenuItem.create,
          ...aggregatedOrchestratorActionsReport.navigationMenuItem.update,
          ///

          // Page layouts
          ...aggregatedOrchestratorActionsReport.pageLayout.delete,
          ...aggregatedOrchestratorActionsReport.pageLayout.create,
          ...aggregatedOrchestratorActionsReport.pageLayout.update,
          ///

          // Page layout tabs
          ...aggregatedOrchestratorActionsReport.pageLayoutTab.delete,
          ...aggregatedOrchestratorActionsReport.pageLayoutTab.create,
          ...aggregatedOrchestratorActionsReport.pageLayoutTab.update,
          ///

          // Page layout widgets
          ...aggregatedOrchestratorActionsReport.pageLayoutWidget.delete,
          ...aggregatedOrchestratorActionsReport.pageLayoutWidget.create,
          ...aggregatedOrchestratorActionsReport.pageLayoutWidget.update,
          ///

          // Row level permission predicate groups
          ...aggregatedOrchestratorActionsReport
            .rowLevelPermissionPredicateGroup.delete,
          ...aggregatedOrchestratorActionsReport
            .rowLevelPermissionPredicateGroup.create,
          ...aggregatedOrchestratorActionsReport
            .rowLevelPermissionPredicateGroup.update,
          ///

          // Row level permission predicates
          ...aggregatedOrchestratorActionsReport.rowLevelPermissionPredicate
            .delete,
          ...aggregatedOrchestratorActionsReport.rowLevelPermissionPredicate
            .create,
          ...aggregatedOrchestratorActionsReport.rowLevelPermissionPredicate
            .update,
          ///

          // Front components
          ...aggregatedOrchestratorActionsReport.frontComponent.delete,
          ...aggregatedOrchestratorActionsReport.frontComponent.create,
          ...aggregatedOrchestratorActionsReport.frontComponent.update,
          ///

          // Webhooks
          ...aggregatedOrchestratorActionsReport.webhook.delete,
          ...aggregatedOrchestratorActionsReport.webhook.create,
          ...aggregatedOrchestratorActionsReport.webhook.update,
          ///
        ],
        workspaceId,
      },
    };
  }
}
