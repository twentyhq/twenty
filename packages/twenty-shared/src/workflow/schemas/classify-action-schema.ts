import { z } from 'zod';
import { aiClassificationInputSchema } from '@/ai/schemas/ai-classification-input.schema';
import { baseWorkflowActionSchema } from './base-workflow-action-schema';
import { baseWorkflowActionSettingsSchema } from './base-workflow-action-settings-schema';

export const workflowClassifyActionSchema = baseWorkflowActionSchema.extend({
  type: z.literal('CLASSIFY'),
  settings: baseWorkflowActionSettingsSchema.extend({
    input: aiClassificationInputSchema,
  }),
});
