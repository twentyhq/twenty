import { z } from 'zod';
import { baseWorkflowActionSchema } from './base-workflow-action-schema';
import { workflowWaitForEventActionSettingsSchema } from './wait-for-event-action-settings-schema';

export const workflowWaitForEventActionSchema = baseWorkflowActionSchema.extend(
  {
    type: z.literal('WAIT_FOR_EVENT'),
    settings: workflowWaitForEventActionSettingsSchema,
  },
);
