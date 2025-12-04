import { z } from 'zod';

import type { CreateWorkflowVersionStepInput } from 'src/engine/core-modules/workflow/dtos/create-workflow-version-step-input.dto';
import { WorkflowActionType } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action-type.enum';
import {
  type WorkflowToolContext,
  type WorkflowToolDependencies,
} from 'src/modules/workflow/workflow-tools/types/workflow-tool-dependencies.type';

const createWorkflowVersionStepSchema = z.object({
  workflowVersionId: z
    .string()
    .describe('The ID of the workflow version to add the step to'),
  stepType: z
    .enum(Object.values(WorkflowActionType) as [string, ...string[]])
    .describe('The type of step to create'),
  parentStepId: z
    .string()
    .optional()
    .describe('Optional ID of the parent step this step should come after'),
  parentStepConnectionOptions: z
    .object({
      type: z.string().optional(),
      conditionGroupIndex: z.number().optional(),
    })
    .optional()
    .describe('Optional parent step connection options'),
  nextStepId: z
    .string()
    .optional()
    .describe('Optional ID of the step this new step should connect to'),
  position: z
    .object({
      x: z.number(),
      y: z.number(),
    })
    .optional()
    .describe('Optional position coordinates for the step'),
  id: z.string().optional().describe('Optional step ID'),
});

export const createCreateWorkflowVersionStepTool = (
  deps: Pick<WorkflowToolDependencies, 'workflowVersionStepService'>,
  context: WorkflowToolContext,
) => ({
  name: 'create_workflow_version_step' as const,
  description:
    'Create a new step in a workflow version. This adds a step to the specified workflow version with the given configuration.',
  inputSchema: createWorkflowVersionStepSchema,
  execute: async (parameters: CreateWorkflowVersionStepInput) => {
    try {
      return await deps.workflowVersionStepService.createWorkflowVersionStep({
        workspaceId: context.workspaceId,
        input: parameters,
      });
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: `Failed to create workflow version step: ${error.message}`,
      };
    }
  },
});
