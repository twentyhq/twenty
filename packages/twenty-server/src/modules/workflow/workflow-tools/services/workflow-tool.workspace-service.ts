import { Injectable } from '@nestjs/common';

import { type ToolSet } from 'ai';

import { RecordPositionService } from 'src/engine/core-modules/record-position/services/record-position.service';
import { AgentService } from 'src/engine/metadata-modules/ai/ai-agent/agent.service';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { LogicFunctionFromSourceService } from 'src/engine/metadata-modules/logic-function/services/logic-function-from-source.service';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { type RolePermissionConfig } from 'src/engine/twenty-orm/types/role-permission-config';
import { WorkflowSchemaWorkspaceService } from 'src/modules/workflow/workflow-builder/workflow-schema/workflow-schema.workspace-service';
import { WorkflowValidationWorkspaceService } from 'src/modules/workflow/workflow-builder/workflow-validation/workflow-validation.workspace-service';
import { WorkflowVersionEdgeWorkspaceService } from 'src/modules/workflow/workflow-builder/workflow-version-edge/workflow-version-edge.workspace-service';
import { WorkflowVersionStepHelpersWorkspaceService } from 'src/modules/workflow/workflow-builder/workflow-version-step/workflow-version-step-helpers.workspace-service';
import { WorkflowVersionStepWorkspaceService } from 'src/modules/workflow/workflow-builder/workflow-version-step/workflow-version-step.workspace-service';
import { WorkflowVersionWorkspaceService } from 'src/modules/workflow/workflow-builder/workflow-version/workflow-version.workspace-service';
import { createActivateWorkflowVersionTool } from 'src/modules/workflow/workflow-tools/tools/activate-workflow-version.tool';
import { createComputeStepOutputSchemaTool } from 'src/modules/workflow/workflow-tools/tools/compute-step-output-schema.tool';
import { createCreateCompleteWorkflowTool } from 'src/modules/workflow/workflow-tools/tools/create-complete-workflow.tool';
import { createCreateDraftFromWorkflowVersionTool } from 'src/modules/workflow/workflow-tools/tools/create-draft-from-workflow-version.tool';
import { createCreateWorkflowVersionEdgeTool } from 'src/modules/workflow/workflow-tools/tools/create-workflow-version-edge.tool';
import { createCreateWorkflowVersionStepTool } from 'src/modules/workflow/workflow-tools/tools/create-workflow-version-step.tool';
import { createDeactivateWorkflowVersionTool } from 'src/modules/workflow/workflow-tools/tools/deactivate-workflow-version.tool';
import { createDeleteWorkflowVersionEdgeTool } from 'src/modules/workflow/workflow-tools/tools/delete-workflow-version-edge.tool';
import { createDeleteWorkflowVersionStepTool } from 'src/modules/workflow/workflow-tools/tools/delete-workflow-version-step.tool';
import { createGetWorkflowCurrentVersionTool } from 'src/modules/workflow/workflow-tools/tools/get-workflow-current-version.tool';
import { createGetWorkflowRunTool } from 'src/modules/workflow/workflow-tools/tools/get-workflow-run.tool';
import { createListLogicFunctionToolsTool } from 'src/modules/workflow/workflow-tools/tools/list-logic-function-tools.tool';
import { createListWorkflowRunsTool } from 'src/modules/workflow/workflow-tools/tools/list-workflow-runs.tool';
import { createUpdateAgentTool } from 'src/modules/workflow/workflow-tools/tools/update-agent.tool';
import { createUpdateLogicFunctionSourceTool } from 'src/modules/workflow/workflow-tools/tools/update-logic-function-source.tool';
import { createUpdateWorkflowVersionPositionsTool } from 'src/modules/workflow/workflow-tools/tools/update-workflow-version-positions.tool';
import { createUpdateWorkflowVersionStepTool } from 'src/modules/workflow/workflow-tools/tools/update-workflow-version-step.tool';
import { createUpdateWorkflowVersionTriggerTool } from 'src/modules/workflow/workflow-tools/tools/update-workflow-version-trigger.tool';
import { createValidateWorkflowTool } from 'src/modules/workflow/workflow-tools/tools/validate-workflow.tool';
import { type WorkflowToolDependencies } from 'src/modules/workflow/workflow-tools/types/workflow-tool-dependencies.type';
import { WorkflowTriggerWorkspaceService } from 'src/modules/workflow/workflow-trigger/workspace-services/workflow-trigger.workspace-service';

@Injectable()
export class WorkflowToolWorkspaceService {
  private readonly deps: WorkflowToolDependencies;

  constructor(
    workflowVersionStepService: WorkflowVersionStepWorkspaceService,
    workflowVersionStepHelpersService: WorkflowVersionStepHelpersWorkspaceService,
    workflowVersionEdgeService: WorkflowVersionEdgeWorkspaceService,
    workflowVersionService: WorkflowVersionWorkspaceService,
    workflowTriggerService: WorkflowTriggerWorkspaceService,
    workflowSchemaService: WorkflowSchemaWorkspaceService,
    workflowValidationService: WorkflowValidationWorkspaceService,
    globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
    recordPositionService: RecordPositionService,
    logicFunctionFromSourceService: LogicFunctionFromSourceService,
    flatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
    agentService: AgentService,
  ) {
    this.deps = {
      workflowVersionStepService,
      workflowVersionStepHelpersService,
      workflowVersionEdgeService,
      workflowVersionService,
      workflowTriggerService,
      workflowSchemaService,
      workflowValidationService,
      globalWorkspaceOrmManager,
      recordPositionService,
      logicFunctionFromSourceService,
      flatEntityMapsCacheService,
      agentService,
    };
  }

  // Generates static workflow tools that don't depend on workspace objects
  generateWorkflowTools(
    workspaceId: string,
    rolePermissionConfig: RolePermissionConfig,
  ): ToolSet {
    const context = { workspaceId };
    const contextWithPermissions = { workspaceId, rolePermissionConfig };

    const createCompleteWorkflow = createCreateCompleteWorkflowTool(
      this.deps,
      contextWithPermissions,
    );
    const createWorkflowVersionStep = createCreateWorkflowVersionStepTool(
      this.deps,
      context,
    );
    const updateWorkflowVersionStep = createUpdateWorkflowVersionStepTool(
      this.deps,
      context,
    );
    const updateWorkflowVersionTrigger = createUpdateWorkflowVersionTriggerTool(
      this.deps,
      context,
    );
    const deleteWorkflowVersionStep = createDeleteWorkflowVersionStepTool(
      this.deps,
      context,
    );
    const createWorkflowVersionEdge = createCreateWorkflowVersionEdgeTool(
      this.deps,
      context,
    );
    const deleteWorkflowVersionEdge = createDeleteWorkflowVersionEdgeTool(
      this.deps,
      context,
    );
    const createDraftFromWorkflowVersion =
      createCreateDraftFromWorkflowVersionTool(this.deps, context);
    const updateWorkflowVersionPositions =
      createUpdateWorkflowVersionPositionsTool(this.deps, context);
    const activateWorkflowVersion = createActivateWorkflowVersionTool(
      this.deps,
      context,
    );
    const deactivateWorkflowVersion = createDeactivateWorkflowVersionTool(
      this.deps,
      context,
    );
    const computeStepOutputSchema = createComputeStepOutputSchemaTool(
      this.deps,
      context,
    );
    const getWorkflowCurrentVersion = createGetWorkflowCurrentVersionTool(
      this.deps,
      contextWithPermissions,
    );
    const getWorkflowRun = createGetWorkflowRunTool(
      this.deps,
      contextWithPermissions,
    );
    const listWorkflowRuns = createListWorkflowRunsTool(
      this.deps,
      contextWithPermissions,
    );
    const updateLogicFunctionSource = createUpdateLogicFunctionSourceTool(
      this.deps,
      context,
    );
    const listLogicFunctionTools = createListLogicFunctionToolsTool(
      this.deps,
      context,
    );
    const updateAgent = createUpdateAgentTool(this.deps, context);
    const validateWorkflow = createValidateWorkflowTool(this.deps, context);

    return {
      [createCompleteWorkflow.name]: createCompleteWorkflow,
      [createWorkflowVersionStep.name]: createWorkflowVersionStep,
      [updateWorkflowVersionStep.name]: updateWorkflowVersionStep,
      [updateWorkflowVersionTrigger.name]: updateWorkflowVersionTrigger,
      [deleteWorkflowVersionStep.name]: deleteWorkflowVersionStep,
      [createWorkflowVersionEdge.name]: createWorkflowVersionEdge,
      [deleteWorkflowVersionEdge.name]: deleteWorkflowVersionEdge,
      [createDraftFromWorkflowVersion.name]: createDraftFromWorkflowVersion,
      [updateWorkflowVersionPositions.name]: updateWorkflowVersionPositions,
      [activateWorkflowVersion.name]: activateWorkflowVersion,
      [deactivateWorkflowVersion.name]: deactivateWorkflowVersion,
      [computeStepOutputSchema.name]: computeStepOutputSchema,
      [getWorkflowCurrentVersion.name]: getWorkflowCurrentVersion,
      [getWorkflowRun.name]: getWorkflowRun,
      [listWorkflowRuns.name]: listWorkflowRuns,
      [updateLogicFunctionSource.name]: updateLogicFunctionSource,
      [listLogicFunctionTools.name]: listLogicFunctionTools,
      [updateAgent.name]: updateAgent,
      [validateWorkflow.name]: validateWorkflow,
    };
  }
}
