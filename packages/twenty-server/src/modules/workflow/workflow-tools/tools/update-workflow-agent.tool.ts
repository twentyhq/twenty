import { isDefined } from 'twenty-shared/utils';
import {
  agentResponseFormatSchema,
  WorkflowActionType,
} from 'twenty-shared/workflow';
import { z } from 'zod';

import { type AgentResponseFormat } from 'src/engine/metadata-modules/ai/ai-agent/types/agent-response-format.type';
import { type ModelId } from 'src/engine/metadata-modules/ai/ai-models/types/model-id.type';
import { type WorkflowAiAgentAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';
import {
  type WorkflowToolContext,
  type WorkflowToolDependencies,
} from 'src/modules/workflow/workflow-tools/types/workflow-tool-dependencies.type';

const updateAgentSchema = z.object({
  agentId: z
    .string()
    .uuid()
    .describe(
      "The ID of the agent to update (from the AI_AGENT step's settings.input.agentId)",
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
  responseFormat: agentResponseFormatSchema
    .optional()
    .describe(
      'Optional response format. Use { type: "text" } for free-form text output, or { type: "json", schema: { type: "object", properties: { fieldName: { type: "string" } } } } for structured output. Downstream steps can reference structured fields via {{stepId.fieldName}} (or {{stepId.response}} for text format).',
    ),
});

const setAiAgentStepsResponseFormat = async (
  deps: Pick<
    WorkflowToolDependencies,
    'coreWorkflowVersionListService' | 'coreWorkflowVersionMutationService'
  >,
  {
    workspaceId,
    userWorkspaceId,
    agentId,
    responseFormat,
  }: {
    workspaceId: string;
    userWorkspaceId: string | undefined;
    agentId: string;
    responseFormat: AgentResponseFormat;
  },
): Promise<number> => {
  let updatedStepCount = 0;

  const draftCoreVersions =
    await deps.coreWorkflowVersionListService.findDraftCoreWorkflowVersions({
      workspaceId,
    });

  for (const draftCoreVersion of draftCoreVersions) {
    const matchingSteps = (draftCoreVersion.steps ?? []).filter(
      (step): step is WorkflowAiAgentAction =>
        step.type === WorkflowActionType.AI_AGENT &&
        step.settings?.input?.agentId === agentId,
    );

    for (const matchingStep of matchingSteps) {
      await deps.coreWorkflowVersionMutationService.updateStep({
        workspaceId,
        userWorkspaceId,
        coreWorkflowVersionId: draftCoreVersion.id,
        step: {
          ...matchingStep,
          settings: {
            ...matchingStep.settings,
            input: { ...matchingStep.settings.input, responseFormat },
          },
        },
      });

      updatedStepCount++;
    }
  }

  return updatedStepCount;
};

export const createUpdateWorkflowAgentTool = (
  deps: Pick<
    WorkflowToolDependencies,
    | 'agentService'
    | 'coreWorkflowVersionListService'
    | 'coreWorkflowVersionMutationService'
  >,
  context: WorkflowToolContext,
) => ({
  name: 'update_workflow_agent' as const,
  description: `Update the agent used by a workflow AI_AGENT step.

Use this tool to configure the agent created when an AI_AGENT step is added: set its system prompt, the model it should use, and the format of the step's output.

- prompt: the agent's system prompt (its role, behavior and task).
- modelId: optional model id; omit to keep the auto-selected model.
- responseFormat: set on the draft AI_AGENT steps using this agent. { type: "text" } for free-form text (referenced as {{stepId.response}}), or { type: "json", schema: { ... } } for structured output whose fields can be referenced as {{stepId.fieldName}}.

To find the agentId, look at the AI_AGENT step's settings.input.agentId field.`,
  inputSchema: updateAgentSchema,
  execute: async (parameters: {
    agentId: string;
    prompt?: string;
    modelId?: string;
    responseFormat?: AgentResponseFormat;
  }) => {
    try {
      const { agentId, prompt, modelId, responseFormat } = parameters;
      const { workspaceId } = context;

      if (isDefined(prompt) || isDefined(modelId)) {
        await deps.agentService.updateOneAgent({
          input: {
            id: agentId,
            ...(isDefined(prompt) ? { prompt } : {}),
            ...(isDefined(modelId) ? { modelId: modelId as ModelId } : {}),
          },
          workspaceId,
        });
      }

      if (!isDefined(responseFormat)) {
        return {
          success: true,
          message: `Successfully updated agent ${agentId}`,
          agentId,
        };
      }

      const updatedStepCount = await setAiAgentStepsResponseFormat(deps, {
        workspaceId,
        userWorkspaceId: context.userWorkspaceId,
        agentId,
        responseFormat,
      });

      if (updatedStepCount === 0) {
        return {
          success: false,
          error: 'No draft AI_AGENT step uses this agent',
          message: `The response format was not applied: no draft AI_AGENT step uses agent ${agentId}. Create a draft version first.`,
          agentId,
        };
      }

      return {
        success: true,
        message: `Successfully updated agent ${agentId} and the response format of ${updatedStepCount} draft step(s)`,
        agentId,
        updatedStepCount,
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
