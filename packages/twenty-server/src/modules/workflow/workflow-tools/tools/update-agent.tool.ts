import { isDefined } from 'twenty-shared/utils';
import { z } from 'zod';

import { type AgentResponseFormat } from 'src/engine/metadata-modules/ai/ai-agent/types/agent-response-format.type';
import { type ModelId } from 'src/engine/metadata-modules/ai/ai-models/types/model-id.type';
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

export const createUpdateAgentTool = (
  deps: Pick<WorkflowToolDependencies, 'agentService'>,
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
