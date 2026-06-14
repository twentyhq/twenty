import { Injectable } from '@nestjs/common';

import {
  ALL_METADATA_NAME,
  type AllMetadataName,
} from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { createEmptyAllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-all-flat-entity-maps.constant';
import { getMetadataFlatEntityMapsKey } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-flat-entity-maps-key.util';
import { createEmptyOrchestratorActionsReport } from 'src/engine/workspace-manager/workspace-migration/constant/empty-orchestrator-actions-report.constant';
import { EMPTY_ORCHESTRATOR_FAILURE_REPORT } from 'src/engine/workspace-manager/workspace-migration/constant/empty-orchestrator-failure-report.constant';
import {
  type OrchestratorActionsReport,
  type OrchestratorFailureReport,
  type WorkspaceMigrationOrchestratorBuildArgs,
  type WorkspaceMigrationOrchestratorFailedResult,
  type WorkspaceMigrationOrchestratorSuccessfulResult,
} from 'src/engine/workspace-manager/workspace-migration/types/workspace-migration-orchestrator.type';
import { AllUniversalFlatEntityMaps } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/all-universal-flat-entity-maps.type';
import { type MetadataUniversalFlatEntityMaps } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/metadata-universal-flat-entity-maps.type';
import { aggregateOrchestratorActionsReport } from 'src/engine/workspace-manager/workspace-migration/utils/aggregate-orchestrator-actions-report.util';
import { computeOrderedMigrationActions } from 'src/engine/workspace-manager/workspace-migration/utils/compute-ordered-migration-actions.util';
import { crossEntityTransversalValidation } from 'src/engine/workspace-manager/workspace-migration/utils/cross-entity-transversal-validation.util';
import { mergeOrchestratorFailureReports } from 'src/engine/workspace-manager/workspace-migration/utils/merge-orchestrator-failure-reports.util';
import { WorkspaceMigrationAgentActionsBuilderService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/agent/workspace-migration-agent-actions-builder.service';
import { WorkspaceMigrationApplicationVariableActionsBuilderService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/application-variable/workspace-migration-application-variable-actions-builder.service';
import { WorkspaceMigrationCommandMenuItemActionsBuilderService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/command-menu-item/workspace-migration-command-menu-item-actions-builder.service';
import { WorkspaceMigrationConnectionProviderActionsBuilderService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/connection-provider/workspace-migration-connection-provider-actions-builder.service';
import { WorkspaceMigrationFieldPermissionActionsBuilderService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/field-permission/workspace-migration-field-permission-actions-builder.service';
import { WorkspaceMigrationFieldActionsBuilderService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/field/workspace-migration-field-actions-builder.service';
import { WorkspaceMigrationFrontComponentActionsBuilderService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/front-component/workspace-migration-front-component-actions-builder.service';
import { WorkspaceMigrationIndexActionsBuilderService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/index/workspace-migration-index-actions-builder.service';
import { WorkspaceMigrationLogicFunctionActionsBuilderService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/logic-function/workspace-migration-logic-function-actions-builder.service';
import { WorkspaceMigrationNavigationMenuItemActionsBuilderService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/navigation-menu-item/workspace-migration-navigation-menu-item-actions-builder.service';
import { WorkspaceMigrationObjectPermissionActionsBuilderService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/object-permission/workspace-migration-object-permission-actions-builder.service';
import { WorkspaceMigrationObjectActionsBuilderService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/object/workspace-migration-object-actions-builder.service';
import { WorkspaceMigrationPageLayoutTabActionsBuilderService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/page-layout-tab/workspace-migration-page-layout-tab-actions-builder.service';
import { WorkspaceMigrationPageLayoutWidgetActionsBuilderService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/page-layout-widget/workspace-migration-page-layout-widget-actions-builder.service';
import { WorkspaceMigrationPageLayoutActionsBuilderService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/page-layout/workspace-migration-page-layout-actions-builder.service';
import { WorkspaceMigrationPermissionFlagActionsBuilderService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/permission-flag/workspace-migration-permission-flag-actions-builder.service';
import { WorkspaceMigrationRolePermissionFlagActionsBuilderService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/role-permission-flag/workspace-migration-role-permission-flag-actions-builder.service';
import { WorkspaceMigrationRoleTargetActionsBuilderService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/role-target/workspace-migration-role-target-actions-builder.service';
import { WorkspaceMigrationRoleActionsBuilderService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/role/workspace-migration-role-actions-builder.service';
import { WorkspaceMigrationRowLevelPermissionPredicateGroupActionsBuilderService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/row-level-permission-predicate-group/workspace-migration-row-level-permission-predicate-group-actions-builder.service';
import { WorkspaceMigrationRowLevelPermissionPredicateActionsBuilderService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/row-level-permission-predicate/workspace-migration-row-level-permission-predicate-actions-builder.service';
import { WorkspaceMigrationSkillActionsBuilderService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/skill/workspace-migration-skill-actions-builder.service';
import { WorkspaceMigrationViewFieldGroupActionsBuilderService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/view-field-group/workspace-migration-view-field-group-actions-builder.service';
import { WorkspaceMigrationViewFieldActionsBuilderService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/view-field/workspace-migration-view-field-actions-builder.service';
import { WorkspaceMigrationViewFilterGroupActionsBuilderService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/view-filter-group/workspace-migration-view-filter-group-actions-builder.service';
import { WorkspaceMigrationViewFilterActionsBuilderService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/view-filter/workspace-migration-view-filter-actions-builder.service';
import { WorkspaceMigrationViewGroupActionsBuilderService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/view-group/workspace-migration-view-group-actions-builder.service';
import { WorkspaceMigrationViewSortActionsBuilderService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/view-sort/workspace-migration-view-sort-actions.builder.service';
import { WorkspaceMigrationViewActionsBuilderService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/view/workspace-migration-view-actions-builder.service';
import { WorkspaceMigrationWebhookActionsBuilderService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/webhook/workspace-migration-webhook-actions-builder.service';
import { WorkspaceEntityMigrationBuilderService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/services/workspace-entity-migration-builder.service';

type FromToMetadataUniversalFlatEntityMaps<T extends AllMetadataName> = {
  from: MetadataUniversalFlatEntityMaps<T>;
  to: MetadataUniversalFlatEntityMaps<T>;
};

type EntityActionsBuilderTask = {
  metadataName: AllMetadataName;
  run: (context: EntityActionsBuilderRunContext) => Promise<void>;
};

type EntityActionsBuilderRunContext = {
  additionalCacheDataMaps: WorkspaceMigrationOrchestratorBuildArgs['additionalCacheDataMaps'];
  buildOptions: WorkspaceMigrationOrchestratorBuildArgs['buildOptions'];
  fromToAllFlatEntityMaps: WorkspaceMigrationOrchestratorBuildArgs['fromToAllFlatEntityMaps'];
  optimisticAllFlatEntityMaps: AllUniversalFlatEntityMaps;
  orchestratorActionsReport: OrchestratorActionsReport;
  orchestratorFailureReport: OrchestratorFailureReport;
  workspaceId: string;
};

const createEntityActionsBuilderTask = <T extends AllMetadataName>(
  metadataName: T,
  builderService: WorkspaceEntityMigrationBuilderService<T>,
): EntityActionsBuilderTask => ({
  metadataName,
  run: async ({
    additionalCacheDataMaps,
    buildOptions,
    fromToAllFlatEntityMaps,
    optimisticAllFlatEntityMaps,
    orchestratorActionsReport,
    orchestratorFailureReport,
    workspaceId,
  }) => {
    const flatEntityMapsKey = getMetadataFlatEntityMapsKey(metadataName);
    const fromToFlatEntityMaps = fromToAllFlatEntityMaps[flatEntityMapsKey] as
      | FromToMetadataUniversalFlatEntityMaps<T>
      | undefined;

    if (!isDefined(fromToFlatEntityMaps)) {
      return;
    }

    const result = await builderService.validateAndBuild({
      additionalCacheDataMaps,
      buildOptions,
      dependencyOptimisticFlatEntityMaps: optimisticAllFlatEntityMaps,
      from: fromToFlatEntityMaps.from,
      to: fromToFlatEntityMaps.to,
      workspaceId,
    });

    if (result.status === 'fail') {
      orchestratorFailureReport[metadataName].push(...result.errors);
    } else {
      // TS mapped-type invariance: writing into a generic key of a mapped
      // type widens the expected value to the intersection of all variants.
      // The runtime value is correctly typed as
      // MetadataUniversalWorkspaceMigrationActionsRecord<T>, but TS cannot
      // narrow OrchestratorActionsReport[T] on the assignment side.
      orchestratorActionsReport[metadataName] =
        result.actions as OrchestratorActionsReport[T];
    }
  },
});

@Injectable()
export class WorkspaceMigrationBuildOrchestratorService {
  private readonly entityActionsBuilderTasksInExecutionOrder: ReadonlyArray<EntityActionsBuilderTask>;

  constructor(
    workspaceMigrationObjectActionsBuilderService: WorkspaceMigrationObjectActionsBuilderService,
    workspaceMigrationIndexActionsBuilderService: WorkspaceMigrationIndexActionsBuilderService,
    workspaceMigrationViewActionsBuilderService: WorkspaceMigrationViewActionsBuilderService,
    workspaceMigrationViewFieldActionsBuilderService: WorkspaceMigrationViewFieldActionsBuilderService,
    workspaceMigrationViewFilterActionsBuilderService: WorkspaceMigrationViewFilterActionsBuilderService,
    workspaceMigrationViewFilterGroupActionsBuilderService: WorkspaceMigrationViewFilterGroupActionsBuilderService,
    workspaceMigrationViewGroupActionsBuilderService: WorkspaceMigrationViewGroupActionsBuilderService,
    workspaceMigrationViewFieldGroupActionsBuilderService: WorkspaceMigrationViewFieldGroupActionsBuilderService,
    workspaceMigrationViewSortActionsBuilderService: WorkspaceMigrationViewSortActionsBuilderService,
    workspaceMigrationFieldPermissionActionsBuilderService: WorkspaceMigrationFieldPermissionActionsBuilderService,
    workspaceMigrationObjectPermissionActionsBuilderService: WorkspaceMigrationObjectPermissionActionsBuilderService,
    workspaceMigrationRolePermissionFlagActionsBuilderService: WorkspaceMigrationRolePermissionFlagActionsBuilderService,
    workspaceMigrationPermissionFlagActionsBuilderService: WorkspaceMigrationPermissionFlagActionsBuilderService,
    workspaceMigrationLogicFunctionActionsBuilderService: WorkspaceMigrationLogicFunctionActionsBuilderService,
    workspaceMigrationRoleTargetActionsBuilderService: WorkspaceMigrationRoleTargetActionsBuilderService,
    workspaceMigrationFieldActionsBuilderService: WorkspaceMigrationFieldActionsBuilderService,
    workspaceMigrationRoleActionsBuilderService: WorkspaceMigrationRoleActionsBuilderService,
    workspaceMigrationAgentActionsBuilderService: WorkspaceMigrationAgentActionsBuilderService,
    workspaceMigrationSkillActionsBuilderService: WorkspaceMigrationSkillActionsBuilderService,
    workspaceMigrationCommandMenuItemActionsBuilderService: WorkspaceMigrationCommandMenuItemActionsBuilderService,
    workspaceMigrationNavigationMenuItemActionsBuilderService: WorkspaceMigrationNavigationMenuItemActionsBuilderService,
    workspaceMigrationPageLayoutActionsBuilderService: WorkspaceMigrationPageLayoutActionsBuilderService,
    workspaceMigrationPageLayoutWidgetActionsBuilderService: WorkspaceMigrationPageLayoutWidgetActionsBuilderService,
    workspaceMigrationPageLayoutTabActionsBuilderService: WorkspaceMigrationPageLayoutTabActionsBuilderService,
    workspaceMigrationRowLevelPermissionPredicateActionsBuilderService: WorkspaceMigrationRowLevelPermissionPredicateActionsBuilderService,
    workspaceMigrationRowLevelPermissionPredicateGroupActionsBuilderService: WorkspaceMigrationRowLevelPermissionPredicateGroupActionsBuilderService,
    workspaceMigrationFrontComponentActionsBuilderService: WorkspaceMigrationFrontComponentActionsBuilderService,
    workspaceMigrationWebhookActionsBuilderService: WorkspaceMigrationWebhookActionsBuilderService,
    workspaceMigrationApplicationVariableActionsBuilderService: WorkspaceMigrationApplicationVariableActionsBuilderService,
    workspaceMigrationConnectionProviderActionsBuilderService: WorkspaceMigrationConnectionProviderActionsBuilderService,
  ) {
    // The order of this array defines the execution order of the per-entity
    // builders. Each builder may mutate `optimisticAllFlatEntityMaps`, so
    // subsequent builders see those mutations and downstream entities depend
    // on upstream ones being processed first. Do not reorder casually.
    // The constructor parameter order above is irrelevant: NestJS DI resolves
    // dependencies by type, not by position.
    this.entityActionsBuilderTasksInExecutionOrder = [
      createEntityActionsBuilderTask(
        ALL_METADATA_NAME.objectMetadata,
        workspaceMigrationObjectActionsBuilderService,
      ),
      createEntityActionsBuilderTask(
        ALL_METADATA_NAME.fieldMetadata,
        workspaceMigrationFieldActionsBuilderService,
      ),
      createEntityActionsBuilderTask(
        ALL_METADATA_NAME.index,
        workspaceMigrationIndexActionsBuilderService,
      ),
      createEntityActionsBuilderTask(
        ALL_METADATA_NAME.view,
        workspaceMigrationViewActionsBuilderService,
      ),
      createEntityActionsBuilderTask(
        ALL_METADATA_NAME.viewFieldGroup,
        workspaceMigrationViewFieldGroupActionsBuilderService,
      ),
      createEntityActionsBuilderTask(
        ALL_METADATA_NAME.viewField,
        workspaceMigrationViewFieldActionsBuilderService,
      ),
      createEntityActionsBuilderTask(
        ALL_METADATA_NAME.viewFilterGroup,
        workspaceMigrationViewFilterGroupActionsBuilderService,
      ),
      createEntityActionsBuilderTask(
        ALL_METADATA_NAME.viewFilter,
        workspaceMigrationViewFilterActionsBuilderService,
      ),
      createEntityActionsBuilderTask(
        ALL_METADATA_NAME.viewGroup,
        workspaceMigrationViewGroupActionsBuilderService,
      ),
      createEntityActionsBuilderTask(
        ALL_METADATA_NAME.viewSort,
        workspaceMigrationViewSortActionsBuilderService,
      ),
      createEntityActionsBuilderTask(
        ALL_METADATA_NAME.rowLevelPermissionPredicateGroup,
        workspaceMigrationRowLevelPermissionPredicateGroupActionsBuilderService,
      ),
      createEntityActionsBuilderTask(
        ALL_METADATA_NAME.rowLevelPermissionPredicate,
        workspaceMigrationRowLevelPermissionPredicateActionsBuilderService,
      ),
      createEntityActionsBuilderTask(
        ALL_METADATA_NAME.logicFunction,
        workspaceMigrationLogicFunctionActionsBuilderService,
      ),
      createEntityActionsBuilderTask(
        ALL_METADATA_NAME.role,
        workspaceMigrationRoleActionsBuilderService,
      ),
      createEntityActionsBuilderTask(
        ALL_METADATA_NAME.objectPermission,
        workspaceMigrationObjectPermissionActionsBuilderService,
      ),
      createEntityActionsBuilderTask(
        ALL_METADATA_NAME.fieldPermission,
        workspaceMigrationFieldPermissionActionsBuilderService,
      ),
      createEntityActionsBuilderTask(
        ALL_METADATA_NAME.rolePermissionFlag,
        workspaceMigrationRolePermissionFlagActionsBuilderService,
      ),
      createEntityActionsBuilderTask(
        ALL_METADATA_NAME.permissionFlag,
        workspaceMigrationPermissionFlagActionsBuilderService,
      ),
      createEntityActionsBuilderTask(
        ALL_METADATA_NAME.roleTarget,
        workspaceMigrationRoleTargetActionsBuilderService,
      ),
      createEntityActionsBuilderTask(
        ALL_METADATA_NAME.agent,
        workspaceMigrationAgentActionsBuilderService,
      ),
      createEntityActionsBuilderTask(
        ALL_METADATA_NAME.skill,
        workspaceMigrationSkillActionsBuilderService,
      ),
      createEntityActionsBuilderTask(
        ALL_METADATA_NAME.frontComponent,
        workspaceMigrationFrontComponentActionsBuilderService,
      ),
      createEntityActionsBuilderTask(
        ALL_METADATA_NAME.commandMenuItem,
        workspaceMigrationCommandMenuItemActionsBuilderService,
      ),
      createEntityActionsBuilderTask(
        ALL_METADATA_NAME.navigationMenuItem,
        workspaceMigrationNavigationMenuItemActionsBuilderService,
      ),
      createEntityActionsBuilderTask(
        ALL_METADATA_NAME.pageLayout,
        workspaceMigrationPageLayoutActionsBuilderService,
      ),
      createEntityActionsBuilderTask(
        ALL_METADATA_NAME.pageLayoutTab,
        workspaceMigrationPageLayoutTabActionsBuilderService,
      ),
      createEntityActionsBuilderTask(
        ALL_METADATA_NAME.pageLayoutWidget,
        workspaceMigrationPageLayoutWidgetActionsBuilderService,
      ),
      createEntityActionsBuilderTask(
        ALL_METADATA_NAME.webhook,
        workspaceMigrationWebhookActionsBuilderService,
      ),
      createEntityActionsBuilderTask(
        ALL_METADATA_NAME.applicationVariable,
        workspaceMigrationApplicationVariableActionsBuilderService,
      ),
      createEntityActionsBuilderTask(
        ALL_METADATA_NAME.connectionProvider,
        workspaceMigrationConnectionProviderActionsBuilderService,
      ),
    ];
  }

  private setupOptimisticCache({
    fromToAllFlatEntityMaps,
    dependencyAllFlatEntityMaps,
  }: Pick<
    WorkspaceMigrationOrchestratorBuildArgs,
    'fromToAllFlatEntityMaps' | 'dependencyAllFlatEntityMaps'
  >): AllUniversalFlatEntityMaps {
    if (isDefined(dependencyAllFlatEntityMaps)) {
      return {
        ...createEmptyAllFlatEntityMaps(),
        ...dependencyAllFlatEntityMaps,
      };
    }
    const allFromToFlatEntityMapsKeys = Object.keys(
      fromToAllFlatEntityMaps,
    ) as (keyof AllUniversalFlatEntityMaps)[];

    return allFromToFlatEntityMapsKeys.reduce<AllUniversalFlatEntityMaps>(
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
        ...createEmptyAllFlatEntityMaps(),
      },
    );
  }

  public async buildWorkspaceMigration({
    workspaceId,
    buildOptions,
    fromToAllFlatEntityMaps,
    dependencyAllFlatEntityMaps,
    additionalCacheDataMaps,
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

    const preDeletionFlatViewFieldMaps = structuredClone(
      optimisticAllFlatEntityMaps.flatViewFieldMaps,
    );

    const runContext: EntityActionsBuilderRunContext = {
      additionalCacheDataMaps,
      buildOptions,
      fromToAllFlatEntityMaps,
      optimisticAllFlatEntityMaps,
      orchestratorActionsReport,
      orchestratorFailureReport,
      workspaceId,
    };

    for (const task of this.entityActionsBuilderTasksInExecutionOrder) {
      await task.run(runContext);
    }

    const crossEntityFailureReport = crossEntityTransversalValidation({
      optimisticUniversalFlatMaps: optimisticAllFlatEntityMaps,
      orchestratorActionsReport,
      preDeletionFlatViewFieldMaps,
    });

    mergeOrchestratorFailureReports({
      target: orchestratorFailureReport,
      source: crossEntityFailureReport,
    });

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
        applicationUniversalIdentifier:
          buildOptions.applicationUniversalIdentifier,
        actions: computeOrderedMigrationActions(
          aggregatedOrchestratorActionsReport,
        ),
      },
    };
  }
}
