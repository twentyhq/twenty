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
  stepId: z
    .string()
    .optional()
    .describe(
      'The id of the draft AI_AGENT step to configure. Use this for a step without settings.input.agentId.',
    ),
  agentId: z
    .string()
    .uuid()
    .optional()
    .describe(
      'The ID of the agent to update, for a step that runs an agent (its settings.input.agentId)',
    ),
  prompt: z
    .string()
    .optional()
    .describe(
      "The system prompt describing the role, behavior and the task to accomplish. Stored as the step's instructions when it runs no agent.",
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

const findDraftAiAgentSteps = async (
  deps: Pick<WorkflowToolDependencies, 'coreWorkflowVersionListService'>,
  {
    workspaceId,
    isMatchingStep,
  }: {
    workspaceId: string;
    isMatchingStep: (step: WorkflowAiAgentAction) => boolean;
  },
): Promise<
  { coreWorkflowVersionId: string; step: WorkflowAiAgentAction }[]
> => {
  const draftCoreVersions =
    await deps.coreWorkflowVersionListService.findDraftCoreWorkflowVersions({
      workspaceId,
    });

  return draftCoreVersions.flatMap((draftCoreVersion) =>
    (draftCoreVersion.steps ?? [])
      .filter(
        (step): step is WorkflowAiAgentAction =>
          step.type === WorkflowActionType.AI_AGENT && isMatchingStep(step),
      )
      .map((step) => ({ coreWorkflowVersionId: draftCoreVersion.id, step })),
  );
};

const updateInlineAiAgentStep = async (
  deps: Pick<WorkflowToolDependencies, 'coreWorkflowVersionMutationService'>,
  {
    workspaceId,
    userWorkspaceId,
    coreWorkflowVersionId,
    step,
    prompt,
    modelId,
    responseFormat,
  }: {
    workspaceId: string;
    userWorkspaceId: string | undefined;
    coreWorkflowVersionId: string;
    step: WorkflowAiAgentAction;
    prompt?: string;
    modelId?: string;
    responseFormat?: AgentResponseFormat;
  },
) =>
  deps.coreWorkflowVersionMutationService.updateStep({
    workspaceId,
    userWorkspaceId,
    coreWorkflowVersionId,
    step: {
      ...step,
      settings: {
        ...step.settings,
        input: {
          ...step.settings.input,
          ...(isDefined(prompt) ? { instructions: prompt } : {}),
          ...(isDefined(modelId) ? { modelId } : {}),
          ...(isDefined(responseFormat) ? { responseFormat } : {}),
        },
      },
    },
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
  const matchingSteps = await findDraftAiAgentSteps(deps, {
    workspaceId,
    isMatchingStep: (step) => step.settings?.input?.agentId === agentId,
  });

  for (const { coreWorkflowVersionId, step } of matchingSteps) {
    await deps.coreWorkflowVersionMutationService.updateStep({
      workspaceId,
      userWorkspaceId,
      coreWorkflowVersionId,
      step: {
        ...step,
        settings: {
          ...step.settings,
          input: { ...step.settings.input, responseFormat },
        },
      },
    });
  }

  return matchingSteps.length;
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
  description: `Configure a workflow AI_AGENT step: its system prompt, the model it uses, and the format of its output.

Pass stepId for a draft step that runs no agent (no settings.input.agentId): the step itself holds this config. Pass agentId for a step that runs an agent: the prompt and model go to that agent, the response format to the draft steps using it.

- prompt: the system prompt (role, behavior and task).
- modelId: optional model id; omit to keep the auto-selected model.
- responseFormat: { type: "text" } for free-form text (referenced as {{stepId.response}}), or { type: "json", schema: { ... } } for structured output whose fields can be referenced as {{stepId.fieldName}}.`,
  inputSchema: updateAgentSchema,
  execute: async (parameters: {
    stepId?: string;
    agentId?: string;
    prompt?: string;
    modelId?: string;
    responseFormat?: AgentResponseFormat;
  }) => {
    try {
      const { stepId, prompt, modelId, responseFormat } = parameters;
      const { workspaceId } = context;
      let agentId = parameters.agentId;

      if (isDefined(stepId)) {
        const [draftStep] = await findDraftAiAgentSteps(deps, {
          workspaceId,
          isMatchingStep: (step) => step.id === stepId,
        });

        if (!isDefined(draftStep)) {
          return {
            success: false,
            error: 'No draft AI_AGENT step has this id',
            message: `No draft AI_AGENT step has id ${stepId}. Create a draft version first.`,
          };
        }

        if (!isDefined(draftStep.step.settings.input.agentId)) {
          await updateInlineAiAgentStep(deps, {
            workspaceId,
            userWorkspaceId: context.userWorkspaceId,
            coreWorkflowVersionId: draftStep.coreWorkflowVersionId,
            step: draftStep.step,
            prompt,
            modelId,
            responseFormat,
          });

          return {
            success: true,
            message: `Successfully updated step ${stepId}`,
            stepId,
          };
        }

        agentId = draftStep.step.settings.input.agentId;
      }

      if (!isDefined(agentId)) {
        return {
          success: false,
          error: 'Missing stepId or agentId',
          message: 'Pass the stepId of the AI_AGENT step to configure.',
        };
      }

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
