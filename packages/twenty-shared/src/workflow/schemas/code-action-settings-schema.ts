import { z } from 'zod';
import { baseWorkflowActionSettingsSchema } from './base-workflow-action-settings-schema';

export const workflowCodeActionSettingsSchema =
  baseWorkflowActionSettingsSchema.extend({
    input: z.object({
      serverlessFunctionId: z.string(),
      serverlessFunctionVersion: z.string(),
      serverlessFunctionInput: z.record(z.string(), z.any()),
    }),
  });
