import { Injectable, OnModuleInit } from '@nestjs/common';

import { WorkflowToolRegistryService } from 'src/engine/core-modules/tool/services/workflow-tool-registry.workspace-service';
import { CreateWorkflowVersionStepInput } from 'src/engine/core-modules/workflow/dtos/create-workflow-version-step-input.dto';
import { UpdateWorkflowVersionPositionsInput } from 'src/engine/core-modules/workflow/dtos/update-workflow-version-positions-input.dto';
import {
  activateWorkflowVersionSchema,
  computeStepOutputSchemaSchema,
  createDraftFromWorkflowVersionSchema,
  createWorkflowVersionEdgeSchema,
  createWorkflowVersionStepSchema,
  deactivateWorkflowVersionSchema,
  deleteWorkflowVersionEdgeSchema,
  deleteWorkflowVersionStepSchema,
  updateWorkflowVersionPositionsSchema,
  updateWorkflowVersionStepSchema,
} from 'src/modules/workflow/workflow-builder/schemas/workflow-tool-schemas';
import { WorkflowSchemaWorkspaceService } from 'src/modules/workflow/workflow-builder/workflow-schema/workflow-schema.workspace-service';
import { WorkflowVersionEdgeWorkspaceService } from 'src/modules/workflow/workflow-builder/workflow-version-edge/workflow-version-edge.workspace-service';
import { WorkflowVersionStepWorkspaceService } from 'src/modules/workflow/workflow-builder/workflow-version-step/workflow-version-step.workspace-service';
import { WorkflowVersionWorkspaceService } from 'src/modules/workflow/workflow-builder/workflow-version/workflow-version.workspace-service';
import { WorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';
import { WorkflowTrigger } from 'src/modules/workflow/workflow-trigger/types/workflow-trigger.type';
import { WorkflowTriggerWorkspaceService } from 'src/modules/workflow/workflow-trigger/workspace-services/workflow-trigger.workspace-service';

@Injectable()
export class WorkflowToolRegistryWorkspaceService implements OnModuleInit {
  constructor(
    private readonly workflowToolRegistry: WorkflowToolRegistryService,
    private readonly workflowVersionStepService: WorkflowVersionStepWorkspaceService,
    private readonly workflowVersionEdgeService: WorkflowVersionEdgeWorkspaceService,
    private readonly workflowVersionService: WorkflowVersionWorkspaceService,
    private readonly workflowTriggerService: WorkflowTriggerWorkspaceService,
    private readonly workflowSchemaService: WorkflowSchemaWorkspaceService,
  ) {}

  onModuleInit() {
    this.registerWorkflowTools();
  }

  private registerWorkflowTools(): void {
    this.workflowToolRegistry.registerTool('create_workflow_version_step', {
      description:
        'Create a new step in a workflow version. This adds a step to the specified workflow version with the given configuration.',
      parameters: createWorkflowVersionStepSchema,
      execute: async (
        parameters: CreateWorkflowVersionStepInput & { workspaceId: string },
      ) => {
        return await this.workflowVersionStepService.createWorkflowVersionStep({
          workspaceId: parameters.workspaceId as string,
          input: parameters,
        });
      },
    });

    this.workflowToolRegistry.registerTool('update_workflow_version_step', {
      description:
        'Update an existing step in a workflow version. This modifies the step configuration.',
      parameters: updateWorkflowVersionStepSchema,
      execute: async (parameters: {
        workflowVersionId: string;
        step: WorkflowAction;
        workspaceId: string;
      }) => {
        return await this.workflowVersionStepService.updateWorkflowVersionStep({
          workspaceId: parameters.workspaceId,
          workflowVersionId: parameters.workflowVersionId,
          step: parameters.step,
        });
      },
    });

    this.workflowToolRegistry.registerTool('delete_workflow_version_step', {
      description:
        'Delete a step from a workflow version. This removes the step and updates the workflow structure.',
      parameters: deleteWorkflowVersionStepSchema,
      execute: async (parameters: {
        workflowVersionId: string;
        stepId: string;
        workspaceId: string;
      }) => {
        return await this.workflowVersionStepService.deleteWorkflowVersionStep({
          workspaceId: parameters.workspaceId,
          workflowVersionId: parameters.workflowVersionId,
          stepIdToDelete: parameters.stepId,
        });
      },
    });

    this.workflowToolRegistry.registerTool('create_workflow_version_edge', {
      description:
        'Create a new edge in a workflow version. This connects two steps in the workflow.',
      parameters: createWorkflowVersionEdgeSchema,
      execute: async (parameters: {
        workflowVersionId: string;
        source: string;
        target: string;
        workspaceId: string;
      }) => {
        return await this.workflowVersionEdgeService.createWorkflowVersionEdge({
          source: parameters.source,
          target: parameters.target,
          workflowVersionId: parameters.workflowVersionId,
          workspaceId: parameters.workspaceId,
        });
      },
    });

    this.workflowToolRegistry.registerTool('delete_workflow_version_edge', {
      description:
        'Delete an edge from a workflow version. This removes the connection between two steps.',
      parameters: deleteWorkflowVersionEdgeSchema,
      execute: async (parameters: {
        workflowVersionId: string;
        source: string;
        target: string;
        workspaceId: string;
      }) => {
        return await this.workflowVersionEdgeService.deleteWorkflowVersionEdge({
          source: parameters.source,
          target: parameters.target,
          workflowVersionId: parameters.workflowVersionId,
          workspaceId: parameters.workspaceId,
        });
      },
    });

    this.workflowToolRegistry.registerTool(
      'update_workflow_version_positions',
      {
        description:
          'Update the positions of steps and edges in a workflow version.',
        parameters: updateWorkflowVersionPositionsSchema,
        execute: async (
          parameters: UpdateWorkflowVersionPositionsInput & {
            workspaceId: string;
          },
        ) => {
          return await this.workflowVersionService.updateWorkflowVersionPositions(
            {
              workflowVersionId: parameters.workflowVersionId,
              positions: parameters.positions,
              workspaceId: parameters.workspaceId,
            },
          );
        },
      },
    );

    this.workflowToolRegistry.registerTool('activate_workflow_version', {
      description:
        'Activate a workflow version. This makes it the active version for the workflow.',
      parameters: activateWorkflowVersionSchema,
      execute: async (parameters: { workflowVersionId: string }) => {
        return await this.workflowTriggerService.activateWorkflowVersion(
          parameters.workflowVersionId,
        );
      },
    });

    this.workflowToolRegistry.registerTool('deactivate_workflow_version', {
      description: 'Deactivate a workflow version. This makes it inactive.',
      parameters: deactivateWorkflowVersionSchema,
      execute: async (parameters: { workflowVersionId: string }) => {
        return await this.workflowTriggerService.deactivateWorkflowVersion(
          parameters.workflowVersionId,
        );
      },
    });

    this.workflowToolRegistry.registerTool(
      'create_draft_from_workflow_version',
      {
        description:
          'Create a draft workflow version from an existing version.',
        parameters: createDraftFromWorkflowVersionSchema,
        execute: async (parameters: {
          workflowId: string;
          workflowVersionIdToCopy: string;
          workspaceId: string;
        }) => {
          return await this.workflowVersionService.createDraftFromWorkflowVersion(
            {
              workspaceId: parameters.workspaceId,
              workflowId: parameters.workflowId,
              workflowVersionIdToCopy: parameters.workflowVersionIdToCopy,
            },
          );
        },
      },
    );

    this.workflowToolRegistry.registerTool('compute_step_output_schema', {
      description: 'Compute the output schema for a workflow step.',
      parameters: computeStepOutputSchemaSchema,
      execute: async (parameters: {
        step: WorkflowTrigger | WorkflowAction;
        workspaceId: string;
      }) => {
        return await this.workflowSchemaService.computeStepOutputSchema({
          step: parameters.step,
          workspaceId: parameters.workspaceId,
        });
      },
    });
  }
}
