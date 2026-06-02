import { type OrchestratorActionsReport } from 'src/engine/workspace-manager/workspace-migration/types/workspace-migration-orchestrator.type';
import { type AllUniversalWorkspaceMigrationAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/workspace-migration-action-common';

// The execution order of actions in a workspace migration is intentional and
// must satisfy foreign-key / dependency relationships across entities.
// Each "group" below corresponds to a logical bundle (object + its fields +
// indexes, views and their children, roles before permissions, ...).
export const computeOrderedMigrationActions = (
  aggregatedOrchestratorActionsReport: OrchestratorActionsReport,
): AllUniversalWorkspaceMigrationAction[] => {
  return [
    // Objects, fields and indexes - this group is order-sensitive
    // because indexes depend on fields, fields depend on objects.
    ...aggregatedOrchestratorActionsReport.index.delete,
    ...aggregatedOrchestratorActionsReport.fieldMetadata.delete,
    ...aggregatedOrchestratorActionsReport.objectMetadata.delete,
    ...aggregatedOrchestratorActionsReport.objectMetadata.create,
    ...aggregatedOrchestratorActionsReport.objectMetadata.update,
    ...aggregatedOrchestratorActionsReport.fieldMetadata.create,
    ...aggregatedOrchestratorActionsReport.fieldMetadata.update,
    ...aggregatedOrchestratorActionsReport.index.create,
    ...aggregatedOrchestratorActionsReport.index.update.flat(),

    // Views and their child entities (view fields / filters / groups / sorts).
    // View children depend on the view existing, but deletions must run first.
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

    // Logic functions
    ...aggregatedOrchestratorActionsReport.logicFunction.delete,
    ...aggregatedOrchestratorActionsReport.logicFunction.create,
    ...aggregatedOrchestratorActionsReport.logicFunction.update,

    // Roles must exist before any of their related entities are wired up
    ...aggregatedOrchestratorActionsReport.role.delete,
    ...aggregatedOrchestratorActionsReport.role.create,
    ...aggregatedOrchestratorActionsReport.role.update,

    // Role targets
    ...aggregatedOrchestratorActionsReport.roleTarget.delete,
    ...aggregatedOrchestratorActionsReport.roleTarget.create,
    ...aggregatedOrchestratorActionsReport.roleTarget.update,

    // Object permissions
    ...aggregatedOrchestratorActionsReport.objectPermission.delete,
    ...aggregatedOrchestratorActionsReport.objectPermission.create,
    ...aggregatedOrchestratorActionsReport.objectPermission.update,

    // Field permissions
    ...aggregatedOrchestratorActionsReport.fieldPermission.delete,
    ...aggregatedOrchestratorActionsReport.fieldPermission.create,
    ...aggregatedOrchestratorActionsReport.fieldPermission.update,

    // Role <-> Permission flag bindings
    ...aggregatedOrchestratorActionsReport.rolePermissionFlag.delete,
    ...aggregatedOrchestratorActionsReport.rolePermissionFlag.create,
    ...aggregatedOrchestratorActionsReport.rolePermissionFlag.update,

    // Permission flag definitions
    ...aggregatedOrchestratorActionsReport.permissionFlag.delete,
    ...aggregatedOrchestratorActionsReport.permissionFlag.create,
    ...aggregatedOrchestratorActionsReport.permissionFlag.update,

    // Agents
    ...aggregatedOrchestratorActionsReport.agent.delete,
    ...aggregatedOrchestratorActionsReport.agent.create,
    ...aggregatedOrchestratorActionsReport.agent.update,

    // Skills
    ...aggregatedOrchestratorActionsReport.skill.delete,
    ...aggregatedOrchestratorActionsReport.skill.create,
    ...aggregatedOrchestratorActionsReport.skill.update,

    // Front components
    ...aggregatedOrchestratorActionsReport.frontComponent.delete,
    ...aggregatedOrchestratorActionsReport.frontComponent.create,
    ...aggregatedOrchestratorActionsReport.frontComponent.update,

    // Command menu items
    ...aggregatedOrchestratorActionsReport.commandMenuItem.delete,
    ...aggregatedOrchestratorActionsReport.commandMenuItem.create,
    ...aggregatedOrchestratorActionsReport.commandMenuItem.update,

    // Page layouts
    ...aggregatedOrchestratorActionsReport.pageLayout.delete,
    ...aggregatedOrchestratorActionsReport.pageLayout.create,
    ...aggregatedOrchestratorActionsReport.pageLayout.update,

    // Page layout tabs
    ...aggregatedOrchestratorActionsReport.pageLayoutTab.delete,
    ...aggregatedOrchestratorActionsReport.pageLayoutTab.create,
    ...aggregatedOrchestratorActionsReport.pageLayoutTab.update,

    // Page layout widgets
    ...aggregatedOrchestratorActionsReport.pageLayoutWidget.delete,
    ...aggregatedOrchestratorActionsReport.pageLayoutWidget.create,
    ...aggregatedOrchestratorActionsReport.pageLayoutWidget.update,

    // Navigation menu items
    ...aggregatedOrchestratorActionsReport.navigationMenuItem.delete,
    ...aggregatedOrchestratorActionsReport.navigationMenuItem.create,
    ...aggregatedOrchestratorActionsReport.navigationMenuItem.update,

    // Row level permission predicate groups
    ...aggregatedOrchestratorActionsReport.rowLevelPermissionPredicateGroup
      .delete,
    ...aggregatedOrchestratorActionsReport.rowLevelPermissionPredicateGroup
      .create,
    ...aggregatedOrchestratorActionsReport.rowLevelPermissionPredicateGroup
      .update,

    // Row level permission predicates
    ...aggregatedOrchestratorActionsReport.rowLevelPermissionPredicate.delete,
    ...aggregatedOrchestratorActionsReport.rowLevelPermissionPredicate.create,
    ...aggregatedOrchestratorActionsReport.rowLevelPermissionPredicate.update,

    // Webhooks
    ...aggregatedOrchestratorActionsReport.webhook.delete,
    ...aggregatedOrchestratorActionsReport.webhook.create,
    ...aggregatedOrchestratorActionsReport.webhook.update,

    // Application variables
    ...aggregatedOrchestratorActionsReport.applicationVariable.delete,
    ...aggregatedOrchestratorActionsReport.applicationVariable.create,
    ...aggregatedOrchestratorActionsReport.applicationVariable.update,

    // Connection providers
    ...aggregatedOrchestratorActionsReport.connectionProvider.delete,
    ...aggregatedOrchestratorActionsReport.connectionProvider.create,
    ...aggregatedOrchestratorActionsReport.connectionProvider.update,
  ];
};
