import { z } from 'zod';
import { baseWorkflowActionSchema } from './base-workflow-action-schema';
import { workflowMcpToolActionSettingsSchema } from './mcp-tool-action-settings-schema';

export const workflowMcpToolActionSchema = baseWorkflowActionSchema.extend({
  type: z.literal('MCP_TOOL'),
  settings: workflowMcpToolActionSettingsSchema,
});
