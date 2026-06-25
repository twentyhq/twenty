import { type OrchestratorActionsReport } from 'src/engine/workspace-manager/workspace-migration/types/workspace-migration-orchestrator.type';
import { type AllUniversalWorkspaceMigrationAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/workspace-migration-action-common';

export const computeOrderedMigrationActions = (
  aggregatedOrchestratorActionsReport: OrchestratorActionsReport,
): AllUniversalWorkspaceMigrationAction[] => {
  return [
    // Object and fields and indexes
    ...aggregatedOrchestratorActionsReport.searchFieldMetadata.delete,
    ...aggregatedOrchestratorActionsReport.index.delete,
    ...aggregatedOrchestratorActionsReport.fieldMetadata.delete,
    ...aggregatedOrchestratorActionsReport.objectMetadata.delete,
    ...aggregatedOrchestratorActionsReport.objectMetadata.create,
    ...aggregatedOrchestratorActionsReport.objectMetadata.update,
    ...aggregatedOrchestratorActionsReport.fieldMetadata.create,
    ...aggregatedOrchestratorActionsReport.fieldMetadata.update,
    ...aggregatedOrchestratorActionsReport.index.create,
    ...aggregatedOrchestratorActionsReport.index.update.flat(),
    ...aggregatedOrchestratorActionsReport.searchFieldMetadata.create,
    ...aggregatedOrchestratorActionsReport.searchFieldMetadata.update,
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
    ...aggregatedOrchestratorActionsReport.viewSort.create,
    ...aggregatedOrchestratorActionsReport.viewSort.update,
    ...aggregatedOrchestratorActionsReport.viewSort.delete,
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

    // Object permissions
    ...aggregatedOrchestratorActionsReport.objectPermission.delete,
    ...aggregatedOrchestratorActionsReport.objectPermission.create,
    ...aggregatedOrchestratorActionsReport.objectPermission.update,
    ///

    // Field permissions
    ...aggregatedOrchestratorActionsReport.fieldPermission.delete,
    ...aggregatedOrchestratorActionsReport.fieldPermission.create,
    ...aggregatedOrchestratorActionsReport.fieldPermission.update,
    ///

    // Permission flag definitions and their role assignments.
    ...aggregatedOrchestratorActionsReport.rolePermissionFlag.delete,
    ...aggregatedOrchestratorActionsReport.permissionFlag.delete,
    ...aggregatedOrchestratorActionsReport.permissionFlag.create,
    ...aggregatedOrchestratorActionsReport.rolePermissionFlag.create,
    ...aggregatedOrchestratorActionsReport.permissionFlag.update,
    ...aggregatedOrchestratorActionsReport.rolePermissionFlag.update,
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

    // Front components
    ...aggregatedOrchestratorActionsReport.frontComponent.delete,
    ...aggregatedOrchestratorActionsReport.frontComponent.create,
    ...aggregatedOrchestratorActionsReport.frontComponent.update,
    ///

    // Command Menu Items
    ...aggregatedOrchestratorActionsReport.commandMenuItem.delete,
    ...aggregatedOrchestratorActionsReport.commandMenuItem.create,
    ...aggregatedOrchestratorActionsReport.commandMenuItem.update,
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

    // Navigation Menu Items
    ...aggregatedOrchestratorActionsReport.navigationMenuItem.delete,
    ...aggregatedOrchestratorActionsReport.navigationMenuItem.create,
    ...aggregatedOrchestratorActionsReport.navigationMenuItem.update,
    ///

    // Row level permission predicate groups
    ...aggregatedOrchestratorActionsReport.rowLevelPermissionPredicateGroup
      .delete,
    ...aggregatedOrchestratorActionsReport.rowLevelPermissionPredicateGroup
      .create,
    ...aggregatedOrchestratorActionsReport.rowLevelPermissionPredicateGroup
      .update,
    ///

    // Row level permission predicates
    ...aggregatedOrchestratorActionsReport.rowLevelPermissionPredicate.delete,
    ...aggregatedOrchestratorActionsReport.rowLevelPermissionPredicate.create,
    ...aggregatedOrchestratorActionsReport.rowLevelPermissionPredicate.update,
    ///

    // Webhooks
    ...aggregatedOrchestratorActionsReport.webhook.delete,
    ...aggregatedOrchestratorActionsReport.webhook.create,
    ...aggregatedOrchestratorActionsReport.webhook.update,
    ///

    // Application Variables
    ...aggregatedOrchestratorActionsReport.applicationVariable.delete,
    ...aggregatedOrchestratorActionsReport.applicationVariable.create,
    ...aggregatedOrchestratorActionsReport.applicationVariable.update,

    // Connection providers
    ...aggregatedOrchestratorActionsReport.connectionProvider.delete,
    ...aggregatedOrchestratorActionsReport.connectionProvider.create,
    ...aggregatedOrchestratorActionsReport.connectionProvider.update,
    ///
  ];
};
