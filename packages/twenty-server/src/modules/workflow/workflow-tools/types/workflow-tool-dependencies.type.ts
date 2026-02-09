import type { RecordPositionService } from 'src/engine/core-modules/record-position/services/record-position.service';
import type { LogicFunctionService } from 'src/engine/metadata-modules/logic-function/services/logic-function.service';
import type { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import type { WorkflowSchemaWorkspaceService } from 'src/modules/workflow/workflow-builder/workflow-schema/workflow-schema.workspace-service';
import type { WorkflowVersionEdgeWorkspaceService } from 'src/modules/workflow/workflow-builder/workflow-version-edge/workflow-version-edge.workspace-service';
import type { WorkflowVersionStepHelpersWorkspaceService } from 'src/modules/workflow/workflow-builder/workflow-version-step/workflow-version-step-helpers.workspace-service';
import type { WorkflowVersionStepWorkspaceService } from 'src/modules/workflow/workflow-builder/workflow-version-step/workflow-version-step.workspace-service';
import type { WorkflowVersionWorkspaceService } from 'src/modules/workflow/workflow-builder/workflow-version/workflow-version.workspace-service';
import type { WorkflowTriggerWorkspaceService } from 'src/modules/workflow/workflow-trigger/workspace-services/workflow-trigger.workspace-service';

export type WorkflowToolDependencies = {
  workflowVersionStepService: WorkflowVersionStepWorkspaceService;
  workflowVersionStepHelpersService: WorkflowVersionStepHelpersWorkspaceService;
  workflowVersionEdgeService: WorkflowVersionEdgeWorkspaceService;
  workflowVersionService: WorkflowVersionWorkspaceService;
  workflowTriggerService: WorkflowTriggerWorkspaceService;
  workflowSchemaService: WorkflowSchemaWorkspaceService;
  globalWorkspaceOrmManager: GlobalWorkspaceOrmManager;
  recordPositionService: RecordPositionService;
  logicFunctionService: LogicFunctionService;
};

export type WorkflowToolContext = {
  workspaceId: string;
};
