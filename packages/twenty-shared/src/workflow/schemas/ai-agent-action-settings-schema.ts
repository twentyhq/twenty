import { z } from 'zod';

import { agentResponseFormatSchema } from './agent-response-format-schema';
import { workflowAiAgentConversationConfigSchema } from './ai-agent-conversation-config-schema';
import { workflowAiAgentInlineConfigSchema } from './ai-agent-inline-config-schema';
import { baseWorkflowActionSettingsSchema } from './base-workflow-action-settings-schema';

export const workflowAiAgentActionSettingsSchema =
  baseWorkflowActionSettingsSchema.extend({
    input: z.object({
      // a reusable agent supplies the instructions, model and permissions; without one, the step does
      agentId: z.string().optional(),
      ...workflowAiAgentInlineConfigSchema.shape,
      prompt: z.string().optional(),
      responseFormat: agentResponseFormatSchema.optional(),
      // the member the agent's conversation is with, the workflow's creator when empty
      workspaceMemberId: z.string().optional(),
      ...workflowAiAgentConversationConfigSchema.shape,
    }),
  });
