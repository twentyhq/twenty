import { isDefined } from 'twenty-shared/utils';
import { z } from 'zod';

import { type ModelId } from 'src/engine/metadata-modules/ai/ai-models/types/model-id.type';
import {
  type WorkflowToolContext,
  type WorkflowToolDependencies,
} from 'src/modules/workflow/workflow-tools/types/workflow-tool-dependencies.type';

const updateAgentSchema = z.object({
  agentId: z
    .string()
    .uuid()
    .describe(
      "The ID of the step's hidden agent (from the AI_AGENT step's settings.input.agentId)",
    ),
  prompt: z
    .string()
    .optional()
    .describe(
      "The agent's system prompt describing its role, behavior and the task it must accomplish.",
    ),
  modelId: z
    .string()
    .optional()
    .describe(
      'Optional model id to use for the agent. Leave empty to keep the auto-selected model.',
    ),
});

export const createUpdateWorkflowAgentTool = (
  deps: {
    agentService: Pick<
      WorkflowToolDependencies['agentService'],
      'updateOneAgent'
    >;
    workflowAiAgentStepAgentService: Pick<
      WorkflowToolDependencies['workflowAiAgentStepAgentService'],
      'findStepOwnedAgent'
    >;
  },
  context: WorkflowToolContext,
) => ({
  name: 'update_workflow_agent' as const,
  description: `Update the hidden agent of an AI_AGENT step created before steps held their own configuration: set its system prompt and the model it uses.

- prompt: the agent's system prompt (its role, behavior and task).
- modelId: optional model id; omit to keep the auto-selected model.

Any other AI_AGENT step is configured with update_workflow_version_step: a step without settings.input.agentId holds its own instructions, prompt, modelId and scope, and a step running a reusable agent takes those from the agent, which is edited on its own. Every AI_AGENT step sets its output format with update_workflow_version_step, on settings.input.responseFormat; a step running an agent without one outputs in the agent's format.`,
  inputSchema: updateAgentSchema,
  execute: async (parameters: {
    agentId: string;
    prompt?: string;
    modelId?: string;
  }) => {
    try {
      const { agentId, prompt, modelId } = parameters;
      const { workspaceId } = context;

      const stepOwnedAgent =
        await deps.workflowAiAgentStepAgentService.findStepOwnedAgent({
          input: { agentId },
          workspaceId,
        });

      if (!isDefined(stepOwnedAgent)) {
        return {
          success: false,
          error: 'Not the hidden agent of a workflow step',
          message: `Agent ${agentId} does not belong to a workflow step. Configure a step without an agent with update_workflow_version_step, and edit a reusable agent on its own.`,
          agentId,
        };
      }

      await deps.agentService.updateOneAgent({
        input: {
          id: agentId,
          ...(isDefined(prompt) ? { prompt } : {}),
          ...(isDefined(modelId) ? { modelId: modelId as ModelId } : {}),
        },
        workspaceId,
      });

      return {
        success: true,
        message: `Successfully updated agent ${agentId}`,
        agentId,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: `Failed to update agent: ${error.message}`,
      };
    }
  },
});
