import { z } from 'zod';
import { workflowAiAgentActionSettingsSchema } from './ai-agent-action-settings-schema';
import { baseWorkflowActionSchema } from './base-workflow-action-schema';

export const workflowAiAgentActionSchema = baseWorkflowActionSchema.extend({
  type: z.literal('AI_AGENT'),
  settings: workflowAiAgentActionSettingsSchema,
});
