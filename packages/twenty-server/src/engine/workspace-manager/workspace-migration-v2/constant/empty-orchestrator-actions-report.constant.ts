import { type OrchestratorActionsReport } from 'src/engine/workspace-manager/workspace-migration-v2/types/workspace-migration-orchestrator.type';
import { type CreatedDeletedUpdatedActions } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/services/workspace-entity-migration-builder-v2.service';
import { type WorkspaceMigrationActionV2 } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/workspace-migration-action-common-v2';

const emptyCreatedDeletedUpdated: CreatedDeletedUpdatedActions<WorkspaceMigrationActionV2> =
  {
    created: [],
    deleted: [],
    updated: [],
  };

export const EMPTY_ORCHESTRATOR_ACTIONS_REPORT = {
  index: emptyCreatedDeletedUpdated,
  objectMetadata: emptyCreatedDeletedUpdated,
  view: emptyCreatedDeletedUpdated,
  viewField: emptyCreatedDeletedUpdated,
  fieldMetadata: emptyCreatedDeletedUpdated,
  serverlessFunction: emptyCreatedDeletedUpdated,
  databaseEventTrigger: emptyCreatedDeletedUpdated,
  cronTrigger: emptyCreatedDeletedUpdated,
} as const satisfies OrchestratorActionsReport;
