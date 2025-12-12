import {
  workflowActionSchema,
  workflowTriggerSchema,
} from 'twenty-shared/workflow';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';

import { type RolePermissionConfig } from 'src/engine/twenty-orm/types/role-permission-config';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { WorkflowVersionStatus } from 'src/modules/workflow/common/standard-objects/workflow-version.workspace-entity';
import { WorkflowStatus } from 'src/modules/workflow/common/standard-objects/workflow.workspace-entity';
import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';
import {
  type WorkflowToolContext,
  type WorkflowToolDependencies,
} from 'src/modules/workflow/workflow-tools/types/workflow-tool-dependencies.type';
import { type WorkflowTrigger } from 'src/modules/workflow/workflow-trigger/types/workflow-trigger.type';

const createCompleteWorkflowSchema = z.object({
  name: z.string().describe('The name of the workflow'),
  description: z
    .string()
    .optional()
    .describe('Optional description of the workflow'),
  trigger: workflowTriggerSchema,
  steps: z
    .array(workflowActionSchema)
    .describe('Array of workflow action steps'),
  stepPositions: z
    .array(
      z.object({
        stepId: z
          .string()
          .describe('The ID of the step (use "trigger" for trigger step)'),
        position: z.object({
          x: z.number().describe('X coordinate for the step position'),
          y: z.number().describe('Y coordinate for the step position'),
        }),
      }),
    )
    .optional()
    .describe('Optional array of step positions for layout'),
  edges: z
    .array(
      z.object({
        source: z
          .string()
          .describe(
            'The ID of the source step (use "trigger" for trigger step)',
          ),
        target: z.string().describe('The ID of the target step'),
      }),
    )
    .optional()
    .describe('Optional array of connections between steps'),
  activate: z
    .boolean()
    .optional()
    .describe('Whether to activate the workflow immediately (default: false)'),
});

type CreateCompleteWorkflowToolDeps = Pick<
  WorkflowToolDependencies,
  | 'workflowVersionService'
  | 'workflowVersionEdgeService'
  | 'workflowTriggerService'
  | 'globalWorkspaceOrmManager'
  | 'recordPositionService'
>;

type CreateCompleteWorkflowToolContext = WorkflowToolContext & {
  rolePermissionConfig: RolePermissionConfig;
};

export const createCreateCompleteWorkflowTool = (
  deps: CreateCompleteWorkflowToolDeps,
  context: CreateCompleteWorkflowToolContext,
) => ({
  name: 'create_complete_workflow' as const,
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
      const workflowId = await createWorkflow({
        deps,
        context,
        name: parameters.name,
      });

      const workflowVersionId = await createWorkflowVersion({
        deps,
        context,
        workflowId,
        trigger: parameters.trigger,
        steps: parameters.steps,
      });

      if (parameters.stepPositions && parameters.stepPositions.length > 0) {
        const positions = parameters.stepPositions.map((pos) => ({
          id: pos.stepId === 'trigger' ? 'trigger' : pos.stepId,
          position: pos.position,
        }));

        await deps.workflowVersionService.updateWorkflowVersionPositions({
          workflowVersionId,
          positions,
          workspaceId: context.workspaceId,
        });
      }

      if (parameters.edges && parameters.edges.length > 0) {
        for (const edge of parameters.edges) {
          await deps.workflowVersionEdgeService.createWorkflowVersionEdge({
            source: edge.source === 'trigger' ? 'trigger' : edge.source,
            target: edge.target,
            workflowVersionId,
            workspaceId: context.workspaceId,
          });
        }
      }

      if (parameters.activate) {
        await deps.workflowTriggerService.activateWorkflowVersion(
          workflowVersionId,
          context.workspaceId,
        );

        await updateWorkflowStatus({
          deps,
          context,
          workflowId,
          workflowVersionId,
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
        recordReferences: [
          {
            objectNameSingular: 'workflow',
            recordId: workflowId,
            displayName: parameters.name,
          },
        ],
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to create workflow "${parameters.name}": ${error.message}`,
        error: error.message,
      };
    }
  },
});

const createWorkflow = async ({
  deps,
  context,
  name,
}: {
  deps: CreateCompleteWorkflowToolDeps;
  context: CreateCompleteWorkflowToolContext;
  name: string;
}): Promise<string> => {
  const authContext = buildSystemAuthContext(context.workspaceId);

  return deps.globalWorkspaceOrmManager.executeInWorkspaceContext(
    authContext,
    async () => {
      const workflowRepository =
        await deps.globalWorkspaceOrmManager.getRepository(
          context.workspaceId,
          'workflow',
          context.rolePermissionConfig,
        );

      const workflowPosition =
        await deps.recordPositionService.buildRecordPosition({
          value: 'first',
          objectMetadata: {
            isCustom: false,
            nameSingular: 'workflow',
          },
          workspaceId: context.workspaceId,
        });

      const workflow = {
        id: uuidv4(),
        name,
        statuses: [WorkflowStatus.DRAFT],
        position: workflowPosition,
      };

      await workflowRepository.insert(workflow);

      return workflow.id;
    },
  );
};

const createWorkflowVersion = async ({
  deps,
  context,
  workflowId,
  trigger,
  steps,
}: {
  deps: CreateCompleteWorkflowToolDeps;
  context: CreateCompleteWorkflowToolContext;
  workflowId: string;
  trigger: WorkflowTrigger;
  steps: WorkflowAction[];
}): Promise<string> => {
  const authContext = buildSystemAuthContext(context.workspaceId);

  return deps.globalWorkspaceOrmManager.executeInWorkspaceContext(
    authContext,
    async () => {
      const workflowVersionRepository =
        await deps.globalWorkspaceOrmManager.getRepository(
          context.workspaceId,
          'workflowVersion',
          context.rolePermissionConfig,
        );

      const versionPosition =
        await deps.recordPositionService.buildRecordPosition({
          value: 'first',
          objectMetadata: {
            isCustom: false,
            nameSingular: 'workflowVersion',
          },
          workspaceId: context.workspaceId,
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
    },
  );
};

const updateWorkflowStatus = async ({
  deps,
  context,
  workflowId,
  workflowVersionId,
}: {
  deps: CreateCompleteWorkflowToolDeps;
  context: CreateCompleteWorkflowToolContext;
  workflowId: string;
  workflowVersionId: string;
}) => {
  const authContext = buildSystemAuthContext(context.workspaceId);

  await deps.globalWorkspaceOrmManager.executeInWorkspaceContext(
    authContext,
    async () => {
      const workflowRepository =
        await deps.globalWorkspaceOrmManager.getRepository(
          context.workspaceId,
          'workflow',
          context.rolePermissionConfig,
        );

      await workflowRepository.update(workflowId, {
        statuses: [WorkflowStatus.ACTIVE],
        lastPublishedVersionId: workflowVersionId,
      });
    },
  );
};
