import { Injectable } from '@nestjs/common';

import { type ToolSet } from 'ai';
import { v4 as uuidv4 } from 'uuid';

import { RecordPositionService } from 'src/engine/core-modules/record-position/services/record-position.service';
import type { CreateWorkflowVersionStepInput } from 'src/engine/core-modules/workflow/dtos/create-workflow-version-step-input.dto';
import type { UpdateWorkflowVersionPositionsInput } from 'src/engine/core-modules/workflow/dtos/update-workflow-version-positions-input.dto';
import type { UpdateWorkflowVersionStepInput } from 'src/engine/core-modules/workflow/dtos/update-workflow-version-step-input.dto';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { type RolePermissionConfig } from 'src/engine/twenty-orm/types/role-permission-config';
import { WorkflowVersionStatus } from 'src/modules/workflow/common/standard-objects/workflow-version.workspace-entity';
import { WorkflowStatus } from 'src/modules/workflow/common/standard-objects/workflow.workspace-entity';
import { WorkflowSchemaWorkspaceService } from 'src/modules/workflow/workflow-builder/workflow-schema/workflow-schema.workspace-service';
import { WorkflowVersionEdgeWorkspaceService } from 'src/modules/workflow/workflow-builder/workflow-version-edge/workflow-version-edge.workspace-service';
import { WorkflowVersionStepWorkspaceService } from 'src/modules/workflow/workflow-builder/workflow-version-step/workflow-version-step.workspace-service';
import { WorkflowVersionWorkspaceService } from 'src/modules/workflow/workflow-builder/workflow-version/workflow-version.workspace-service';
import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';
import {
  activateWorkflowVersionSchema,
  computeStepOutputSchemaSchema,
  createCompleteWorkflowSchema,
  createDraftFromWorkflowVersionSchema,
  createWorkflowVersionEdgeSchema,
  createWorkflowVersionStepSchema,
  deactivateWorkflowVersionSchema,
  deleteWorkflowVersionEdgeSchema,
  deleteWorkflowVersionStepSchema,
  updateWorkflowVersionPositionsSchema,
  updateWorkflowVersionStepSchema,
} from 'src/modules/workflow/workflow-tools/schemas/workflow-tool-schemas';
import { type WorkflowTrigger } from 'src/modules/workflow/workflow-trigger/types/workflow-trigger.type';
import { WorkflowTriggerWorkspaceService } from 'src/modules/workflow/workflow-trigger/workspace-services/workflow-trigger.workspace-service';

@Injectable()
export class WorkflowToolWorkspaceService {
  constructor(
    private readonly workflowVersionStepService: WorkflowVersionStepWorkspaceService,
    private readonly workflowVersionEdgeService: WorkflowVersionEdgeWorkspaceService,
    private readonly workflowVersionService: WorkflowVersionWorkspaceService,
    private readonly workflowTriggerService: WorkflowTriggerWorkspaceService,
    private readonly workflowSchemaService: WorkflowSchemaWorkspaceService,
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
    private readonly recordPositionService: RecordPositionService,
  ) {}

  generateWorkflowTools(
    workspaceId: string,
    rolePermissionConfig: RolePermissionConfig,
  ): ToolSet {
    const tools: ToolSet = {};

    tools.create_complete_workflow = {
      description: `Create a complete workflow with trigger, steps, and connections in a single operation.

CRITICAL SCHEMA REQUIREMENTS:
- Trigger type MUST be one of: DATABASE_EVENT, MANUAL, CRON, WEBHOOK
- NEVER use "RECORD_CREATED" - this is invalid. Use "DATABASE_EVENT" instead.
- Each step MUST include: id, name, type, valid, settings
- CREATE_RECORD actions MUST have objectName and objectRecord in settings.input
- objectRecord must contain actual field values, not just field names
- Use "trigger" as stepId for trigger step in stepPositions and edges

Common mistakes to avoid:
- Using "RECORD_CREATED" instead of "DATABASE_EVENT"
- Missing the "name" and "valid" fields in steps
- Missing the "objectRecord" field in CREATE_RECORD actions
- Using "fieldsToUpdate" instead of "objectRecord" in CREATE_RECORD actions

IMPORTANT: The tool schema provides comprehensive field descriptions, examples, and validation rules. Always refer to the schema for:
- Field requirements and data types
- Common object patterns and field structures
- Proper relationship field formats
- Variable reference syntax (e.g., {{trigger.object.fieldName}})
- Error handling options

This is the most efficient way for AI to create workflows as it handles all the complexity in one call.`,
      inputSchema: createCompleteWorkflowSchema,
      execute: async (parameters: {
        name: string;
        description?: string;
        trigger: WorkflowTrigger;
        steps: WorkflowAction[];
        stepPositions?: Array<{
          stepId: string;
          position: { x: number; y: number };
        }>;
        edges?: Array<{ source: string; target: string }>;
        activate?: boolean;
      }) => {
        try {
          const workflowId = await this.createWorkflow({
            workspaceId,
            name: parameters.name,
            rolePermissionConfig,
          });

          const workflowVersionId = await this.createWorkflowVersion({
            workspaceId,
            workflowId,
            trigger: parameters.trigger,
            steps: parameters.steps,
            rolePermissionConfig,
          });

          if (parameters.stepPositions && parameters.stepPositions.length > 0) {
            const positions = parameters.stepPositions.map((pos) => ({
              id: pos.stepId === 'trigger' ? 'trigger' : pos.stepId,
              position: pos.position,
            }));

            await this.workflowVersionService.updateWorkflowVersionPositions({
              workflowVersionId,
              positions,
              workspaceId,
            });
          }

          if (parameters.edges && parameters.edges.length > 0) {
            for (const edge of parameters.edges) {
              await this.workflowVersionEdgeService.createWorkflowVersionEdge({
                source: edge.source === 'trigger' ? 'trigger' : edge.source,
                target: edge.target,
                workflowVersionId,
                workspaceId,
              });
            }
          }

          if (parameters.activate) {
            await this.workflowTriggerService.activateWorkflowVersion({
              workflowVersionId,
            });

            await this.updateWorkflowStatus({
              workspaceId,
              workflowId,
              workflowVersionId,
              rolePermissionConfig,
            });
          }

          return {
            success: true,
            message: `Workflow "${parameters.name}" created successfully with ${parameters.steps.length} steps`,
            result: {
              workflowId,
              workflowVersionId,
              name: parameters.name,
              trigger: parameters.trigger,
              steps: parameters.steps,
            },
          };
        } catch (error) {
          return {
            success: false,
            message: `Failed to create workflow "${parameters.name}": ${error.message}`,
            error: error.message,
          };
        }
      },
    };

    tools.create_workflow_version_step = {
      description:
        'Create a new step in a workflow version. This adds a step to the specified workflow version with the given configuration.',
      inputSchema: createWorkflowVersionStepSchema,
      execute: async (parameters: CreateWorkflowVersionStepInput) => {
        try {
          return await this.workflowVersionStepService.createWorkflowVersionStep(
            {
              workspaceId,
              input: parameters,
            },
          );
        } catch (error) {
          return {
            success: false,
            error: error.message,
            message: `Failed to create workflow version step: ${error.message}`,
          };
        }
      },
    };

    tools.update_workflow_version_step = {
      description:
        'Update an existing step in a workflow version. This modifies the step configuration.',
      inputSchema: updateWorkflowVersionStepSchema,
      execute: async (parameters: UpdateWorkflowVersionStepInput) => {
        try {
          return await this.workflowVersionStepService.updateWorkflowVersionStep(
            {
              workspaceId,
              workflowVersionId: parameters.workflowVersionId,
              step: parameters.step,
            },
          );
        } catch (error) {
          return {
            success: false,
            error: error.message,
            message: `Failed to update workflow version step: ${error.message}`,
          };
        }
      },
    };

    tools.delete_workflow_version_step = {
      description:
        'Delete a step from a workflow version. This removes the step and updates the workflow structure.',
      inputSchema: deleteWorkflowVersionStepSchema,
      execute: async (parameters: {
        workflowVersionId: string;
        stepId: string;
      }) => {
        try {
          return await this.workflowVersionStepService.deleteWorkflowVersionStep(
            {
              workspaceId,
              workflowVersionId: parameters.workflowVersionId,
              stepIdToDelete: parameters.stepId,
            },
          );
        } catch (error) {
          return {
            success: false,
            error: error.message,
            message: `Failed to delete workflow version step: ${error.message}`,
          };
        }
      },
    };

    tools.create_workflow_version_edge = {
      description:
        'Create a connection (edge) between two workflow steps. This defines the flow between steps.',
      inputSchema: createWorkflowVersionEdgeSchema,
      execute: async (parameters: {
        workflowVersionId: string;
        source: string;
        target: string;
      }) => {
        try {
          return await this.workflowVersionEdgeService.createWorkflowVersionEdge(
            {
              source: parameters.source,
              target: parameters.target,
              workflowVersionId: parameters.workflowVersionId,
              workspaceId,
            },
          );
        } catch (error) {
          return {
            success: false,
            error: error.message,
            message: `Failed to create workflow version edge: ${error.message}`,
          };
        }
      },
    };

    tools.delete_workflow_version_edge = {
      description: 'Delete a connection (edge) between workflow steps.',
      inputSchema: deleteWorkflowVersionEdgeSchema,
      execute: async (parameters: {
        workflowVersionId: string;
        source: string;
        target: string;
      }) => {
        try {
          return await this.workflowVersionEdgeService.deleteWorkflowVersionEdge(
            {
              source: parameters.source,
              target: parameters.target,
              workflowVersionId: parameters.workflowVersionId,
              workspaceId,
            },
          );
        } catch (error) {
          return {
            success: false,
            error: error.message,
            message: `Failed to delete workflow version edge: ${error.message}`,
          };
        }
      },
    };

    tools.create_draft_from_workflow_version = {
      description:
        'Create a new draft workflow version from an existing one. This allows for iterative workflow development.',
      inputSchema: createDraftFromWorkflowVersionSchema,
      execute: async (parameters: {
        workflowId: string;
        workflowVersionIdToCopy: string;
      }) => {
        try {
          return await this.workflowVersionService.createDraftFromWorkflowVersion(
            {
              workspaceId,
              workflowId: parameters.workflowId,
              workflowVersionIdToCopy: parameters.workflowVersionIdToCopy,
            },
          );
        } catch (error) {
          return {
            success: false,
            error: error.message,
            message: `Failed to create draft from workflow version: ${error.message}`,
          };
        }
      },
    };

    tools.update_workflow_version_positions = {
      description:
        'Update the positions of multiple workflow steps. This is useful for reorganizing the workflow layout.',
      inputSchema: updateWorkflowVersionPositionsSchema,
      execute: async (parameters: UpdateWorkflowVersionPositionsInput) => {
        try {
          return await this.workflowVersionService.updateWorkflowVersionPositions(
            {
              workflowVersionId: parameters.workflowVersionId,
              positions: parameters.positions,
              workspaceId,
            },
          );
        } catch (error) {
          return {
            success: false,
            error: error.message,
            message: `Failed to update workflow version step positions: ${error.message}`,
          };
        }
      },
    };

    tools.activate_workflow_version = {
      description:
        'Activate a workflow version. This makes the workflow version active and available for execution.',
      inputSchema: activateWorkflowVersionSchema,
      execute: async (parameters: {
        workflowVersionId: string;
        workflowId: string;
      }) => {
        try {
          return await this.workflowTriggerService.activateWorkflowVersion({
            workflowVersionId: parameters.workflowVersionId,
          });
        } catch (error) {
          return {
            success: false,
            error: error.message,
            message: `Failed to activate workflow version: ${error.message}`,
          };
        }
      },
    };

    tools.deactivate_workflow_version = {
      description:
        'Deactivate a workflow version. This makes the workflow version inactive and unavailable for execution.',
      inputSchema: deactivateWorkflowVersionSchema,
      execute: async (parameters: { workflowVersionId: string }) => {
        try {
          return await this.workflowTriggerService.deactivateWorkflowVersion(
            parameters.workflowVersionId,
          );
        } catch (error) {
          return {
            success: false,
            error: error.message,
            message: `Failed to deactivate workflow version: ${error.message}`,
          };
        }
      },
    };

    tools.compute_step_output_schema = {
      description:
        'Compute the output schema for a workflow step. This determines what data the step produces. The step parameter must be a valid WorkflowTrigger or WorkflowAction with the correct settings structure for its type.',
      inputSchema: computeStepOutputSchemaSchema,
      execute: async (parameters: {
        step: WorkflowTrigger | WorkflowAction;
        workflowVersionId: string;
      }) => {
        try {
          return await this.workflowSchemaService.computeStepOutputSchema({
            step: parameters.step,
            workspaceId,
            workflowVersionId: parameters.workflowVersionId,
          });
        } catch (error) {
          return {
            success: false,
            error: error.message,
            message: `Failed to compute step output schema: ${error.message}`,
          };
        }
      },
    };

    return tools;
  }

  private async createWorkflow({
    workspaceId,
    name,
    rolePermissionConfig,
  }: {
    workspaceId: string;
    name: string;
    rolePermissionConfig: RolePermissionConfig;
  }): Promise<string> {
    const workflowRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace(
        workspaceId,
        'workflow',
        rolePermissionConfig,
      );

    const workflowPosition =
      await this.recordPositionService.buildRecordPosition({
        value: 'first',
        objectMetadata: {
          isCustom: false,
          nameSingular: 'workflow',
        },
        workspaceId,
      });

    const workflow = {
      id: uuidv4(),
      name,
      statuses: [WorkflowStatus.DRAFT],
      position: workflowPosition,
    };

    await workflowRepository.insert(workflow);

    return workflow.id;
  }

  private async createWorkflowVersion({
    workspaceId,
    workflowId,
    trigger,
    steps,
    rolePermissionConfig,
  }: {
    workspaceId: string;
    workflowId: string;
    trigger: WorkflowTrigger;
    steps: WorkflowAction[];
    rolePermissionConfig: RolePermissionConfig;
  }): Promise<string> {
    const workflowVersionRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace(
        workspaceId,
        'workflowVersion',
        rolePermissionConfig,
      );

    const versionPosition =
      await this.recordPositionService.buildRecordPosition({
        value: 'first',
        objectMetadata: {
          isCustom: false,
          nameSingular: 'workflowVersion',
        },
        workspaceId,
      });

    const workflowVersion = {
      id: uuidv4(),
      workflowId,
      name: 'v1',
      status: WorkflowVersionStatus.DRAFT,
      trigger,
      steps,
      position: versionPosition,
    };

    await workflowVersionRepository.insert(workflowVersion);

    return workflowVersion.id;
  }

  private async updateWorkflowStatus({
    workspaceId,
    workflowId,
    workflowVersionId,
    rolePermissionConfig,
  }: {
    workspaceId: string;
    workflowId: string;
    workflowVersionId: string;
    rolePermissionConfig: RolePermissionConfig;
  }) {
    const workflowRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace(
        workspaceId,
        'workflow',
        rolePermissionConfig,
      );

    await workflowRepository.update(workflowId, {
      statuses: [WorkflowStatus.ACTIVE],
      lastPublishedVersionId: workflowVersionId,
    });
  }
}
