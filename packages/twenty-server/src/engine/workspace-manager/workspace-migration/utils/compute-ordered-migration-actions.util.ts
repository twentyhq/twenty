import { type OrchestratorActionsReport } from 'src/engine/workspace-manager/workspace-migration/types/workspace-migration-orchestrator.type';
import { type AllUniversalWorkspaceMigrationAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/workspace-migration-action-common';

export const computeOrderedMigrationActions = (
  aggregatedOrchestratorActionsReport: OrchestratorActionsReport,
): AllUniversalWorkspaceMigrationAction[] => {
  return [
    ...aggregatedOrchestratorActionsReport.searchFieldMetadata.delete,
    ...aggregatedOrchestratorActionsReport.searchFieldMetadata.create,
    ...aggregatedOrchestratorActionsReport.searchFieldMetadata.update,

    ...aggregatedOrchestratorActionsReport.index.delete,
    ...aggregatedOrchestratorActionsReport.fieldMetadata.delete,
    ...aggregatedOrchestratorActionsReport.objectMetadata.delete,
    ...aggregatedOrchestratorActionsReport.objectMetadata.create,
    ...aggregatedOrchestratorActionsReport.objectMetadata.update,
    ...aggregatedOrchestratorActionsReport.fieldMetadata.create,
    ...aggregatedOrchestratorActionsReport.fieldMetadata.update,
    ...aggregatedOrchestratorActionsReport.index.create,
    ...aggregatedOrchestratorActionsReport.index.update.flat(),

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
    ...aggregatedOrchestratorActionsReport.viewSort.create,
    ...aggregatedOrchestratorActionsReport.viewSort.update,
    ...aggregatedOrchestratorActionsReport.viewSort.delete,
    ...aggregatedOrchestratorActionsReport.view.delete,

    ...aggregatedOrchestratorActionsReport.logicFunction.delete,
    ...aggregatedOrchestratorActionsReport.logicFunction.create,
    ...aggregatedOrchestratorActionsReport.logicFunction.update,

    ...aggregatedOrchestratorActionsReport.role.delete,
    ...aggregatedOrchestratorActionsReport.role.create,
    ...aggregatedOrchestratorActionsReport.role.update,

    // Role targets delete before agents (roleTarget may FK to agent)
    ...aggregatedOrchestratorActionsReport.roleTarget.delete,

    ...aggregatedOrchestratorActionsReport.agent.delete,
    ...aggregatedOrchestratorActionsReport.agent.create,
    ...aggregatedOrchestratorActionsReport.agent.update,

    ...aggregatedOrchestratorActionsReport.roleTarget.create,
    ...aggregatedOrchestratorActionsReport.roleTarget.update,

    ...aggregatedOrchestratorActionsReport.objectPermission.delete,
    ...aggregatedOrchestratorActionsReport.objectPermission.create,
    ...aggregatedOrchestratorActionsReport.objectPermission.update,

    ...aggregatedOrchestratorActionsReport.fieldPermission.delete,
    ...aggregatedOrchestratorActionsReport.fieldPermission.create,
    ...aggregatedOrchestratorActionsReport.fieldPermission.update,

    // Permission flag definitions and their role assignments.
    ...aggregatedOrchestratorActionsReport.rolePermissionFlag.delete,
    ...aggregatedOrchestratorActionsReport.permissionFlag.delete,
    ...aggregatedOrchestratorActionsReport.permissionFlag.create,
    ...aggregatedOrchestratorActionsReport.rolePermissionFlag.create,
    ...aggregatedOrchestratorActionsReport.permissionFlag.update,
    ...aggregatedOrchestratorActionsReport.rolePermissionFlag.update,

    ...aggregatedOrchestratorActionsReport.skill.delete,
    ...aggregatedOrchestratorActionsReport.skill.create,
    ...aggregatedOrchestratorActionsReport.skill.update,

    ...aggregatedOrchestratorActionsReport.frontComponent.delete,
    ...aggregatedOrchestratorActionsReport.frontComponent.create,
    ...aggregatedOrchestratorActionsReport.frontComponent.update,

    ...aggregatedOrchestratorActionsReport.commandMenuItem.delete,
    ...aggregatedOrchestratorActionsReport.commandMenuItem.create,
    ...aggregatedOrchestratorActionsReport.commandMenuItem.update,

    ...aggregatedOrchestratorActionsReport.pageLayout.delete,
    ...aggregatedOrchestratorActionsReport.pageLayout.create,
    ...aggregatedOrchestratorActionsReport.pageLayout.update,

    ...aggregatedOrchestratorActionsReport.pageLayoutTab.delete,
    ...aggregatedOrchestratorActionsReport.pageLayoutTab.create,
    ...aggregatedOrchestratorActionsReport.pageLayoutTab.update,

    ...aggregatedOrchestratorActionsReport.pageLayoutWidget.delete,
    ...aggregatedOrchestratorActionsReport.pageLayoutWidget.create,
    ...aggregatedOrchestratorActionsReport.pageLayoutWidget.update,

    ...aggregatedOrchestratorActionsReport.navigationMenuItem.delete,
    ...aggregatedOrchestratorActionsReport.navigationMenuItem.create,
    ...aggregatedOrchestratorActionsReport.navigationMenuItem.update,

    ...aggregatedOrchestratorActionsReport.rowLevelPermissionPredicateGroup
      .delete,
    ...aggregatedOrchestratorActionsReport.rowLevelPermissionPredicateGroup
      .create,
    ...aggregatedOrchestratorActionsReport.rowLevelPermissionPredicateGroup
      .update,

    ...aggregatedOrchestratorActionsReport.rowLevelPermissionPredicate.delete,
    ...aggregatedOrchestratorActionsReport.rowLevelPermissionPredicate.create,
    ...aggregatedOrchestratorActionsReport.rowLevelPermissionPredicate.update,

    ...aggregatedOrchestratorActionsReport.webhook.delete,
    ...aggregatedOrchestratorActionsReport.webhook.create,
    ...aggregatedOrchestratorActionsReport.webhook.update,

    ...aggregatedOrchestratorActionsReport.applicationVariable.delete,
    ...aggregatedOrchestratorActionsReport.applicationVariable.create,
    ...aggregatedOrchestratorActionsReport.applicationVariable.update,

    ...aggregatedOrchestratorActionsReport.connectionProvider.delete,
    ...aggregatedOrchestratorActionsReport.connectionProvider.create,
    ...aggregatedOrchestratorActionsReport.connectionProvider.update,
    ...aggregatedOrchestratorActionsReport.timelineActivityType.delete,
    ...aggregatedOrchestratorActionsReport.timelineActivityType.create,
    ...aggregatedOrchestratorActionsReport.timelineActivityType.update,
    ///
  ];
};
