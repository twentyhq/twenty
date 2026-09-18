import { isDefined } from 'twenty-shared/utils';
import {
  workflowActionSchema,
  workflowTriggerSchema,
} from 'twenty-shared/workflow';
import { z } from 'zod';

import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';
import {
  type WorkflowToolContext,
  type WorkflowToolDependencies,
} from 'src/modules/workflow/workflow-tools/types/workflow-tool-dependencies.type';
import { type WorkflowTrigger } from 'src/modules/workflow/workflow-trigger/types/workflow-trigger.type';

const computeStepOutputSchemaSchema = z.object({
  step: z
    .union([workflowTriggerSchema, workflowActionSchema])
    .describe('The workflow step configuration'),
  coreWorkflowVersionId: z
    .string()
    .uuid()
    .describe('The core workflow version UUID'),
});

export const createComputeStepOutputSchemaTool = (
  deps: Pick<
    WorkflowToolDependencies,
    'workflowSchemaService' | 'coreWorkflowVersionListService'
  >,
  context: WorkflowToolContext,
) => ({
  name: 'compute_step_output_schema' as const,
  description:
    'Compute the output schema for a workflow step. This determines what data the step produces. The step parameter must be a valid WorkflowTrigger or WorkflowAction with the correct settings structure for its type.',
  inputSchema: computeStepOutputSchemaSchema,
  execute: async (parameters: {
    step: WorkflowTrigger | WorkflowAction;
    coreWorkflowVersionId: string;
  }) => {
    try {
      const coreWorkflowVersion =
        await deps.coreWorkflowVersionListService.findOneByCoreWorkflowVersionId(
          {
            workspaceId: context.workspaceId,
            coreWorkflowVersionId: parameters.coreWorkflowVersionId,
          },
        );

      if (!isDefined(coreWorkflowVersion)) {
        return {
          success: false,
          error: `Workflow version ${parameters.coreWorkflowVersionId} not found`,
        };
      }

      return await deps.workflowSchemaService.computeStepOutputSchema({
        step: parameters.step,
        workspaceId: context.workspaceId,
        workflowVersionContent: {
          trigger: coreWorkflowVersion.trigger,
          steps: coreWorkflowVersion.steps,
        },
      });
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: `Failed to compute step output schema: ${error.message}`,
      };
    }
  },
});
