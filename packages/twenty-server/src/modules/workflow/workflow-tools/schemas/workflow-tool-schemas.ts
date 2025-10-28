import {
  workflowActionSchema,
  workflowTriggerSchema,
} from 'twenty-shared/workflow';
import { z } from 'zod';

import { WorkflowActionType } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

export const createWorkflowVersionStepSchema = z.object({
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
});

export const updateWorkflowVersionStepSchema = z.object({
  workflowVersionId: z
    .string()
    .describe('The ID of the workflow version containing the step'),
  step: z
    .union([workflowTriggerSchema, workflowActionSchema])
    .describe('The updated step configuration'),
});

export const deleteWorkflowVersionStepSchema = z.object({
  workflowVersionId: z
    .string()
    .describe('The ID of the workflow version containing the step'),
  stepId: z.string().describe('The ID of the step to delete'),
});

export const createWorkflowVersionEdgeSchema = z.object({
  workflowVersionId: z.string().describe('The ID of the workflow version'),
  source: z.string().describe('The ID of the source step'),
  target: z.string().describe('The ID of the target step'),
});

export const deleteWorkflowVersionEdgeSchema = z.object({
  workflowVersionId: z.string().describe('The ID of the workflow version'),
  source: z.string().describe('The ID of the source step'),
  target: z.string().describe('The ID of the target step'),
});

export const createDraftFromWorkflowVersionSchema = z.object({
  workflowId: z.string().describe('The ID of the workflow'),
  workflowVersionIdToCopy: z
    .string()
    .describe('The ID of the workflow version to create a draft from'),
});

export const updateWorkflowVersionPositionsSchema = z.object({
  workflowVersionId: z.string().describe('The ID of the workflow version'),
  positions: z
    .array(
      z.object({
        stepId: z.string(),
        position: z.object({
          x: z.number(),
          y: z.number(),
        }),
      }),
    )
    .describe('Array of step positions to update'),
});

export const activateWorkflowVersionSchema = z.object({
  workflowVersionId: z
    .string()
    .describe('The ID of the workflow version to activate'),
});

export const deactivateWorkflowVersionSchema = z.object({
  workflowVersionId: z
    .string()
    .describe('The ID of the workflow version to deactivate'),
});

export const computeStepOutputSchemaSchema = z.object({
  step: z
    .union([workflowTriggerSchema, workflowActionSchema])
    .describe('The workflow step configuration'),
  workflowVersionId: z.string().describe('The ID of the workflow version'),
});

export const createCompleteWorkflowSchema = z.object({
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
