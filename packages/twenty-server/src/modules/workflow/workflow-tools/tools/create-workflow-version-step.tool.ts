import { isDefined } from 'twenty-shared/utils';
import { TRIGGER_STEP_ID } from 'twenty-shared/workflow';
import { z } from 'zod';

import type { CreateWorkflowVersionStepInput } from 'src/engine/core-modules/workflow/dtos/create-workflow-version-step-input.dto';
import { type WorkflowVersionStepChangesDTO } from 'src/engine/core-modules/workflow/dtos/workflow-version-step-changes.dto';
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
    .describe(
      'Optional ID of the parent step this step should come after. If not provided, the step will be added at the end of the workflow.',
    ),
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
  defaultSettings: z
    .record(z.string(), z.any())
    .optional()
    .describe(
      'Optional default settings for the step. Required for LOGIC_FUNCTION steps: pass { input: { logicFunctionId: "<id>" } }. Use list_logic_function_tools to discover available logic function IDs.',
    ),
});

const enrichResultWithNextStep = ({
  result,
  stepType,
}: {
  result: WorkflowVersionStepChangesDTO;
  stepType: WorkflowActionType;
}) => {
  switch (stepType) {
    case WorkflowActionType.CODE:
      return {
        ...result,
        nextStep:
          'This CODE step was created with a default placeholder function. You MUST now call update_logic_function_source with the logicFunctionId from this step to define the actual code.',
      };
    default:
      return result;
  }
};

export const createCreateWorkflowVersionStepTool = (
  deps: Pick<
    WorkflowToolDependencies,
    'workflowVersionStepService' | 'workflowVersionStepHelpersService'
  >,
  context: WorkflowToolContext,
) => ({
  name: 'create_workflow_version_step' as const,
  description:
    'Create a new step in a workflow version. This adds a step to the specified workflow version with the given configuration. If parentStepId is not provided, the step will be appended at the end of the workflow.',
  inputSchema: createWorkflowVersionStepSchema,
  execute: async (parameters: CreateWorkflowVersionStepInput) => {
    try {
      let effectiveParentStepId = parameters.parentStepId;

      if (!isDefined(effectiveParentStepId)) {
        const workflowVersion =
          await deps.workflowVersionStepHelpersService.getValidatedDraftWorkflowVersion(
            {
              workflowVersionId: parameters.workflowVersionId,
              workspaceId: context.workspaceId,
            },
          );

        const steps = workflowVersion.steps ?? [];

        if (steps.length === 0) {
          effectiveParentStepId = TRIGGER_STEP_ID;
        } else {
          const leafStep = steps.filter(
            (step) =>
              !isDefined(step.nextStepIds) || step.nextStepIds.length === 0,
          );

          if (leafStep.length > 1) {
            effectiveParentStepId = undefined;
          } else {
            effectiveParentStepId = leafStep[0]?.id;
          }
        }
      }

      const result =
        await deps.workflowVersionStepService.createWorkflowVersionStep({
          workspaceId: context.workspaceId,
          input: {
            ...parameters,
            parentStepId: effectiveParentStepId,
          },
        });

      return enrichResultWithNextStep({
        result,
        stepType: parameters.stepType,
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
