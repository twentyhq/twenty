import { z } from 'zod';

import { agentResponseFormatSchema } from './agent-response-format-schema';
import { aiRunScopeSchema } from './ai-run-scope-schema';
import { baseWorkflowActionSettingsSchema } from './base-workflow-action-settings-schema';
import { workflowConversationSchema } from './workflow-conversation-schema';

const nativeToolConfigurationSchema = z.object({ enabled: z.boolean() });

const modelConfigurationSchema = z.object({
  webSearch: nativeToolConfigurationSchema.optional(),
  twitterSearch: nativeToolConfigurationSchema.optional(),
});

export const workflowAiAgentActionSettingsSchema =
  baseWorkflowActionSettingsSchema.extend({
    input: z.object({
      // a reusable agent supplies the instructions, model and permissions; without one, the step does
      agentId: z.string().optional(),
      instructions: z.string().optional(),
      // the workspace's default model when unset
      modelId: z.string().optional(),
      modelConfiguration: modelConfigurationSchema.optional(),
      // no data tools when unset
      scope: aiRunScopeSchema.optional(),
      prompt: z.string().optional(),
      responseFormat: agentResponseFormatSchema.optional(),
      // Empty by default: stopping for a person pauses the run, which existing workflows were not built to expect.
      humanInputInstructions: z.string().optional(),
      // the member the agent's conversation is with, the workflow's creator when empty
      workspaceMemberId: z.string().optional(),
      // a new conversation each time the step runs when unset
      conversation: workflowConversationSchema.optional(),
    }),
  });
