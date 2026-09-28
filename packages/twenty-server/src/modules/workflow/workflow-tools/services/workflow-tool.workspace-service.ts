import { Injectable } from '@nestjs/common';

import { type ToolSet } from 'ai';
import { type ActorMetadata } from 'twenty-shared/types';

import { CoreWorkflowLifecycleWorkspaceService } from 'src/engine/core-modules/workflow/services/core-workflow-lifecycle.workspace-service';
import { CoreWorkflowListService } from 'src/engine/core-modules/workflow/services/core-workflow-list.service';
import { CoreWorkflowMutationWorkspaceService } from 'src/engine/core-modules/workflow/services/core-workflow-mutation.workspace-service';
import { CoreWorkflowVersionListService } from 'src/engine/core-modules/workflow/services/core-workflow-version-list.service';
import { CoreWorkflowVersionMutationWorkspaceService } from 'src/engine/core-modules/workflow/services/core-workflow-version-mutation.workspace-service';
import { CoreWorkflowVersionWriteService } from 'src/engine/core-modules/workflow/services/core-workflow-version-write.service';
import { AgentService } from 'src/engine/metadata-modules/ai/ai-agent/agent.service';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { LogicFunctionFromSourceService } from 'src/engine/metadata-modules/logic-function/services/logic-function-from-source.service';
import { type RolePermissionConfig } from 'src/engine/twenty-orm/types/role-permission-config.type';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { WorkflowSchemaWorkspaceService } from 'src/modules/workflow/workflow-builder/workflow-schema/workflow-schema.workspace-service';
import { createActivateWorkflowVersionTool } from 'src/modules/workflow/workflow-tools/tools/activate-workflow-version.tool';
import { createComputeStepOutputSchemaTool } from 'src/modules/workflow/workflow-tools/tools/compute-step-output-schema.tool';
import { createCreateCompleteWorkflowTool } from 'src/modules/workflow/workflow-tools/tools/create-complete-workflow.tool';
import { createCreateDraftFromWorkflowVersionTool } from 'src/modules/workflow/workflow-tools/tools/create-draft-from-workflow-version.tool';
import { createCreateWorkflowVersionEdgeTool } from 'src/modules/workflow/workflow-tools/tools/create-workflow-version-edge.tool';
import { createCreateWorkflowVersionStepTool } from 'src/modules/workflow/workflow-tools/tools/create-workflow-version-step.tool';
import { createDeactivateWorkflowVersionTool } from 'src/modules/workflow/workflow-tools/tools/deactivate-workflow-version.tool';
import { createDeleteWorkflowTool } from 'src/modules/workflow/workflow-tools/tools/delete-workflow.tool';
import { createDeleteWorkflowVersionEdgeTool } from 'src/modules/workflow/workflow-tools/tools/delete-workflow-version-edge.tool';
import { createDeleteWorkflowVersionStepTool } from 'src/modules/workflow/workflow-tools/tools/delete-workflow-version-step.tool';
import { createGetLogicFunctionSourceTool } from 'src/modules/workflow/workflow-tools/tools/get-logic-function-source.tool';
import { createGetWorkflowCurrentVersionTool } from 'src/modules/workflow/workflow-tools/tools/get-workflow-current-version.tool';
import { createGetWorkflowRunTool } from 'src/modules/workflow/workflow-tools/tools/get-workflow-run.tool';
import { createListLogicFunctionToolsTool } from 'src/modules/workflow/workflow-tools/tools/list-logic-function-tools.tool';
import { createListWorkflowRunsTool } from 'src/modules/workflow/workflow-tools/tools/list-workflow-runs.tool';
import { createListWorkflowsTool } from 'src/modules/workflow/workflow-tools/tools/list-workflows.tool';
import { createUpdateAgentTool } from 'src/modules/workflow/workflow-tools/tools/update-agent.tool';
import { createUpdateLogicFunctionSourceTool } from 'src/modules/workflow/workflow-tools/tools/update-logic-function-source.tool';
import { createUpdateWorkflowVersionPositionsTool } from 'src/modules/workflow/workflow-tools/tools/update-workflow-version-positions.tool';
import { createUpdateWorkflowVersionStepTool } from 'src/modules/workflow/workflow-tools/tools/update-workflow-version-step.tool';
import { createUpdateWorkflowVersionTriggerTool } from 'src/modules/workflow/workflow-tools/tools/update-workflow-version-trigger.tool';
import { createValidateWorkflowTool } from 'src/modules/workflow/workflow-tools/tools/validate-workflow.tool';
import {
  type WorkflowToolContext,
  type WorkflowToolDependencies,
} from 'src/modules/workflow/workflow-tools/types/workflow-tool-dependencies.type';

@Injectable()
export class WorkflowToolWorkspaceService {
  private readonly deps: WorkflowToolDependencies;

  constructor(
    coreWorkflowListService: CoreWorkflowListService,
    coreWorkflowVersionListService: CoreWorkflowVersionListService,
    coreWorkflowMutationService: CoreWorkflowMutationWorkspaceService,
    coreWorkflowVersionMutationService: CoreWorkflowVersionMutationWorkspaceService,
    coreWorkflowVersionWriteService: CoreWorkflowVersionWriteService,
    coreWorkflowLifecycleService: CoreWorkflowLifecycleWorkspaceService,
    workflowSchemaService: WorkflowSchemaWorkspaceService,
    workspaceOrmManager: WorkspaceOrmManager,
    logicFunctionFromSourceService: LogicFunctionFromSourceService,
    flatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
    agentService: AgentService,
  ) {
    this.deps = {
      coreWorkflowListService,
      coreWorkflowVersionListService,
      coreWorkflowMutationService,
      coreWorkflowVersionMutationService,
      coreWorkflowVersionWriteService,
      coreWorkflowLifecycleService,
      workflowSchemaService,
      workspaceOrmManager,
      logicFunctionFromSourceService,
      flatEntityMapsCacheService,
      agentService,
    };
  }

  generateWorkflowTools({
    workspaceId,
    rolePermissionConfig,
    actorContext,
    userWorkspaceId,
  }: {
    workspaceId: string;
    rolePermissionConfig: RolePermissionConfig;
    actorContext?: ActorMetadata;
    userWorkspaceId?: string;
  }): ToolSet {
    const context: WorkflowToolContext = {
      workspaceId,
      rolePermissionConfig,
      actorContext,
      userWorkspaceId,
    };

    const tools = [
      createCreateCompleteWorkflowTool(this.deps, context),
      createCreateWorkflowVersionStepTool(this.deps, context),
      createUpdateWorkflowVersionStepTool(this.deps, context),
      createUpdateWorkflowVersionTriggerTool(this.deps, context),
      createDeleteWorkflowVersionStepTool(this.deps, context),
      createCreateWorkflowVersionEdgeTool(this.deps, context),
      createDeleteWorkflowVersionEdgeTool(this.deps, context),
      createCreateDraftFromWorkflowVersionTool(this.deps, context),
      createUpdateWorkflowVersionPositionsTool(this.deps, context),
      createActivateWorkflowVersionTool(this.deps, context),
      createDeactivateWorkflowVersionTool(this.deps, context),
      createComputeStepOutputSchemaTool(this.deps, context),
      createGetWorkflowCurrentVersionTool(this.deps, context),
      createListWorkflowsTool(this.deps, context),
      createDeleteWorkflowTool(this.deps, context),
      createGetWorkflowRunTool(this.deps, context),
      createListWorkflowRunsTool(this.deps, context),
      createGetLogicFunctionSourceTool(this.deps, context),
      createUpdateLogicFunctionSourceTool(this.deps, context),
      createListLogicFunctionToolsTool(this.deps, context),
      createUpdateAgentTool(this.deps, context),
      createValidateWorkflowTool(this.deps, context),
    ];

    return Object.fromEntries(tools.map((tool) => [tool.name, tool]));
  }
}
