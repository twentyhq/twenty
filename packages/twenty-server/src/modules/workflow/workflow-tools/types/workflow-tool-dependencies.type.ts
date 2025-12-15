import type { RecordPositionService } from 'src/engine/core-modules/record-position/services/record-position.service';
import type { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import type { WorkflowSchemaWorkspaceService } from 'src/modules/workflow/workflow-builder/workflow-schema/workflow-schema.workspace-service';
import type { WorkflowVersionEdgeWorkspaceService } from 'src/modules/workflow/workflow-builder/workflow-version-edge/workflow-version-edge.workspace-service';
import type { WorkflowVersionStepWorkspaceService } from 'src/modules/workflow/workflow-builder/workflow-version-step/workflow-version-step.workspace-service';
import type { WorkflowVersionWorkspaceService } from 'src/modules/workflow/workflow-builder/workflow-version/workflow-version.workspace-service';
import type { WorkflowTriggerWorkspaceService } from 'src/modules/workflow/workflow-trigger/workspace-services/workflow-trigger.workspace-service';

export type WorkflowToolDependencies = {
  workflowVersionStepService: WorkflowVersionStepWorkspaceService;
  workflowVersionEdgeService: WorkflowVersionEdgeWorkspaceService;
  workflowVersionService: WorkflowVersionWorkspaceService;
  workflowTriggerService: WorkflowTriggerWorkspaceService;
  workflowSchemaService: WorkflowSchemaWorkspaceService;
  globalWorkspaceOrmManager: GlobalWorkspaceOrmManager;
  recordPositionService: RecordPositionService;
};

export type WorkflowToolContext = {
  workspaceId: string;
};
