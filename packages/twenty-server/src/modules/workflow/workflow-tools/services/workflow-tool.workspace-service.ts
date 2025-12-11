import { Injectable } from '@nestjs/common';

import { type ToolSet } from 'ai';

import { RecordPositionService } from 'src/engine/core-modules/record-position/services/record-position.service';
import { PerObjectToolGeneratorService } from 'src/engine/core-modules/tool-generator/services/per-object-tool-generator.service';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { type RolePermissionConfig } from 'src/engine/twenty-orm/types/role-permission-config';
import { WorkflowSchemaWorkspaceService } from 'src/modules/workflow/workflow-builder/workflow-schema/workflow-schema.workspace-service';
import { WorkflowVersionEdgeWorkspaceService } from 'src/modules/workflow/workflow-builder/workflow-version-edge/workflow-version-edge.workspace-service';
import { WorkflowVersionStepWorkspaceService } from 'src/modules/workflow/workflow-builder/workflow-version-step/workflow-version-step.workspace-service';
import { WorkflowVersionWorkspaceService } from 'src/modules/workflow/workflow-builder/workflow-version/workflow-version.workspace-service';
import {
  createWorkflowStepToolsFactory,
  type WorkflowStepToolsDeps,
} from 'src/modules/workflow/workflow-tools/factories/workflow-step-tools.factory';
import { createActivateWorkflowVersionTool } from 'src/modules/workflow/workflow-tools/tools/activate-workflow-version.tool';
import { createComputeStepOutputSchemaTool } from 'src/modules/workflow/workflow-tools/tools/compute-step-output-schema.tool';
import { createCreateCompleteWorkflowTool } from 'src/modules/workflow/workflow-tools/tools/create-complete-workflow.tool';
import { createCreateDraftFromWorkflowVersionTool } from 'src/modules/workflow/workflow-tools/tools/create-draft-from-workflow-version.tool';
import { createCreateWorkflowVersionEdgeTool } from 'src/modules/workflow/workflow-tools/tools/create-workflow-version-edge.tool';
import { createCreateWorkflowVersionStepTool } from 'src/modules/workflow/workflow-tools/tools/create-workflow-version-step.tool';
import { createDeactivateWorkflowVersionTool } from 'src/modules/workflow/workflow-tools/tools/deactivate-workflow-version.tool';
import { createDeleteWorkflowVersionEdgeTool } from 'src/modules/workflow/workflow-tools/tools/delete-workflow-version-edge.tool';
import { createDeleteWorkflowVersionStepTool } from 'src/modules/workflow/workflow-tools/tools/delete-workflow-version-step.tool';
import { createUpdateWorkflowVersionPositionsTool } from 'src/modules/workflow/workflow-tools/tools/update-workflow-version-positions.tool';
import { createUpdateWorkflowVersionStepTool } from 'src/modules/workflow/workflow-tools/tools/update-workflow-version-step.tool';
import { type WorkflowToolDependencies } from 'src/modules/workflow/workflow-tools/types/workflow-tool-dependencies.type';
import { WorkflowTriggerWorkspaceService } from 'src/modules/workflow/workflow-trigger/workspace-services/workflow-trigger.workspace-service';

@Injectable()
export class WorkflowToolWorkspaceService {
  private readonly deps: WorkflowToolDependencies;
  private readonly workflowStepToolsDeps: WorkflowStepToolsDeps;

  constructor(
    workflowVersionStepService: WorkflowVersionStepWorkspaceService,
    workflowVersionEdgeService: WorkflowVersionEdgeWorkspaceService,
    workflowVersionService: WorkflowVersionWorkspaceService,
    workflowTriggerService: WorkflowTriggerWorkspaceService,
    workflowSchemaService: WorkflowSchemaWorkspaceService,
    globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
    recordPositionService: RecordPositionService,
    private readonly perObjectToolGenerator: PerObjectToolGeneratorService,
  ) {
    this.deps = {
      workflowVersionStepService,
      workflowVersionEdgeService,
      workflowVersionService,
      workflowTriggerService,
      workflowSchemaService,
      globalWorkspaceOrmManager,
      recordPositionService,
    };

    this.workflowStepToolsDeps = {
      workflowVersionStepService,
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

    return {
      [createCompleteWorkflow.name]: createCompleteWorkflow,
      [createWorkflowVersionStep.name]: createWorkflowVersionStep,
      [updateWorkflowVersionStep.name]: updateWorkflowVersionStep,
      [deleteWorkflowVersionStep.name]: deleteWorkflowVersionStep,
      [createWorkflowVersionEdge.name]: createWorkflowVersionEdge,
      [deleteWorkflowVersionEdge.name]: deleteWorkflowVersionEdge,
      [createDraftFromWorkflowVersion.name]: createDraftFromWorkflowVersion,
      [updateWorkflowVersionPositions.name]: updateWorkflowVersionPositions,
      [activateWorkflowVersion.name]: activateWorkflowVersion,
      [deactivateWorkflowVersion.name]: deactivateWorkflowVersion,
      [computeStepOutputSchema.name]: computeStepOutputSchema,
    };
  }

  // Generates dynamic step configurator tools for each workspace object
  async generateRecordStepConfiguratorTools(
    workspaceId: string,
    rolePermissionConfig: RolePermissionConfig,
  ): Promise<ToolSet> {
    const workflowStepToolsFactory = createWorkflowStepToolsFactory(
      this.workflowStepToolsDeps,
    );

    return this.perObjectToolGenerator.generate(
      {
        workspaceId,
        rolePermissionConfig,
      },
      [workflowStepToolsFactory],
    );
  }
}
