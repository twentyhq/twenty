import { z } from 'zod';
import { baseWorkflowActionSettingsSchema } from './base-workflow-action-settings-schema';

export const workflowCodeActionSettingsSchema =
  baseWorkflowActionSettingsSchema.extend({
    input: z.object({
      logicFunctionId: z.string(),
      logicFunctionVersion: z.string(),
      logicFunctionInput: z.record(z.string(), z.any()),
    }),
  });
