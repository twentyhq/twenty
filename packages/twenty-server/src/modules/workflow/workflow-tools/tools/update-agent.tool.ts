import { isDefined } from 'twenty-shared/utils';
import { WorkflowActionType } from 'twenty-shared/workflow';
import { z } from 'zod';

import { type AgentResponseFormat } from 'src/engine/metadata-modules/ai/ai-agent/types/agent-response-format.type';
import { type ModelId } from 'src/engine/metadata-modules/ai/ai-models/types/model-id.type';
import {
  WorkflowVersionStatus,
  type WorkflowVersionWorkspaceEntity,
} from 'src/modules/workflow/common/standard-objects/workflow-version.workspace-entity';
import {
  type WorkflowToolContext,
  type WorkflowToolDependencies,
} from 'src/modules/workflow/workflow-tools/types/workflow-tool-dependencies.type';

const agentResponseFormatSchema = z.union([
  z.object({ type: z.literal('text') }),
  z.object({
    type: z.literal('json'),
    schema: z.object({
      type: z.literal('object'),
      properties: z.record(
        z.string(),
        z.object({
          type: z.enum(['string', 'number', 'boolean']),
          description: z.string().optional(),
        }),
      ),
      required: z.array(z.string()).optional(),
      additionalProperties: z.literal(false).optional(),
    }),
  }),
]);

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

const resyncAiAgentStepOutputSchemas = async (
  deps: Pick<
    WorkflowToolDependencies,
    | 'workflowVersionStepService'
    | 'globalWorkspaceOrmManager'
    | 'flatEntityMapsCacheService'
  >,
  { workspaceId, agentId }: { workspaceId: string; agentId: string },
): Promise<void> => {
  await deps.flatEntityMapsCacheService.invalidateFlatEntityMaps({
    workspaceId,
    flatMapsKeys: ['flatAgentMaps'],
  });

  const workflowVersionRepository =
    await deps.globalWorkspaceOrmManager.getRepository<WorkflowVersionWorkspaceEntity>(
      workspaceId,
      'workflowVersion',
      { shouldBypassPermissionChecks: true },
    );

  const draftVersions = await workflowVersionRepository.find({
    where: { status: WorkflowVersionStatus.DRAFT },
  });

  for (const version of draftVersions) {
    const steps = version.steps;

    if (!isDefined(steps)) {
      continue;
    }

    const matchingStep = steps.find(
      (step) =>
        step.type === WorkflowActionType.AI_AGENT &&
        step.settings?.input?.agentId === agentId,
    );

    if (!isDefined(matchingStep)) {
      continue;
    }

    await deps.workflowVersionStepService.updateWorkflowVersionStep({
      workspaceId,
      workflowVersionId: version.id,
      step: matchingStep,
    });
  }
};

export const createUpdateAgentTool = (
  deps: Pick<
    WorkflowToolDependencies,
    | 'agentService'
    | 'workflowVersionStepService'
    | 'globalWorkspaceOrmManager'
    | 'flatEntityMapsCacheService'
  >,
  context: WorkflowToolContext,
) => ({
  name: 'update_agent' as const,
  description: `Update the AI agent used by a workflow AI_AGENT step.

Use this tool to configure the agent created when an AI_AGENT step is added: set its system prompt, the model it should use, and the format of its output.

- prompt: the agent's system prompt (its role, behavior and task).
- modelId: optional model id; omit to keep the auto-selected model.
- responseFormat: { type: "text" } for free-form text (referenced as {{stepId.response}}), or { type: "json", schema: { ... } } for structured output whose fields can be referenced as {{stepId.fieldName}}.

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

      const updatedAgent = await deps.agentService.updateOneAgent({
        input: {
          id: agentId,
          ...(isDefined(prompt) ? { prompt } : {}),
          ...(isDefined(modelId) ? { modelId: modelId as ModelId } : {}),
          ...(isDefined(responseFormat) ? { responseFormat } : {}),
        },
        workspaceId,
      });

      if (isDefined(responseFormat)) {
        try {
          await resyncAiAgentStepOutputSchemas(deps, { workspaceId, agentId });
        } catch (resyncError) {
          return {
            success: true,
            message: `Successfully updated agent ${agentId}, but failed to resync workflow step output schema: ${resyncError.message}`,
            agentId: updatedAgent.id,
          };
        }
      }

      return {
        success: true,
        message: `Successfully updated agent ${agentId}`,
        agentId: updatedAgent.id,
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
