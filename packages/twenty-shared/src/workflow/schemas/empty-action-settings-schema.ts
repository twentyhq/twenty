import { z } from 'zod';
import { baseWorkflowActionSettingsSchema } from './base-workflow-action-settings-schema';

export const workflowEmptyActionSettingsSchema =
  baseWorkflowActionSettingsSchema.extend({
    input: z.object({}),
  });
