import type { RecordPositionService } from 'src/engine/core-modules/record-position/services/record-position.service';
import type { WorkflowVersionCoreSyncService } from 'src/engine/core-modules/workflow/services/workflow-version-core-sync.service';
import type { AgentService } from 'src/engine/metadata-modules/ai/ai-agent/agent.service';
import type { LogicFunctionFromSourceService } from 'src/engine/metadata-modules/logic-function/services/logic-function-from-source.service';
import type { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import type { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import type { WorkflowCommonWorkspaceService } from 'src/modules/workflow/common/workspace-services/workflow-common.workspace-service';
import type { WorkflowSchemaWorkspaceService } from 'src/modules/workflow/workflow-builder/workflow-schema/workflow-schema.workspace-service';
import type { WorkflowValidationWorkspaceService } from 'src/modules/workflow/workflow-builder/workflow-validation/workflow-validation.workspace-service';
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
  workflowValidationService: WorkflowValidationWorkspaceService;
  globalWorkspaceOrmManager: GlobalWorkspaceOrmManager;
  recordPositionService: RecordPositionService;
  logicFunctionFromSourceService: LogicFunctionFromSourceService;
  flatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService;
  agentService: AgentService;
  workflowCommonService: WorkflowCommonWorkspaceService;
  workflowVersionCoreSyncService: WorkflowVersionCoreSyncService;
};

export type WorkflowToolContext = {
  workspaceId: string;
};
