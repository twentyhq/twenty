import { z } from 'zod';
import { baseWorkflowActionSettingsSchema } from './base-workflow-action-settings-schema';
import { expectedOutputSchemaShape } from './expected-output-schema-shape';

export const workflowMcpToolActionSettingsSchema =
  baseWorkflowActionSettingsSchema.extend({
    input: z.object({
      mcpServerId: z.string(),
      toolName: z.string(),
      toolInput: z.record(z.string(), z.any()),
    }),
    ...expectedOutputSchemaShape,
  });
