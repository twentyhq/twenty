import { z } from 'zod';
import { baseWorkflowActionSchema } from './base-workflow-action-schema';
import { workflowLogicFunctionActionSettingsSchema } from './logic-function-action-settings-schema';

export const workflowLogicFunctionActionSchema =
  baseWorkflowActionSchema.extend({
    type: z.literal('LOGIC_FUNCTION'),
    settings: workflowLogicFunctionActionSettingsSchema,
  });
