import { z } from 'zod';
import { baseWorkflowActionSchema } from './base-workflow-action-schema';
import { workflowCreateRecordActionSettingsSchema } from './create-record-action-settings-schema';

export const workflowCreateRecordActionSchema = baseWorkflowActionSchema.extend(
  {
    type: z.literal('CREATE_RECORD'),
    settings: workflowCreateRecordActionSettingsSchema,
  },
);
