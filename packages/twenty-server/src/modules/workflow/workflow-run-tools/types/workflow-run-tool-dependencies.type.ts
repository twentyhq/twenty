import type { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import type { WorkflowTriggerWorkspaceService } from 'src/modules/workflow/workflow-trigger/workspace-services/workflow-trigger.workspace-service';

export type WorkflowRunToolDependencies = {
  globalWorkspaceOrmManager: GlobalWorkspaceOrmManager;
  workflowTriggerWorkspaceService: WorkflowTriggerWorkspaceService;
};
