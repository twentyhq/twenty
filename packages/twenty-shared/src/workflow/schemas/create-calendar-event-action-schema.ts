import { z } from 'zod';
import { baseWorkflowActionSchema } from './base-workflow-action-schema';
import { workflowCreateCalendarEventActionSettingsSchema } from './create-calendar-event-action-settings-schema';

export const workflowCreateCalendarEventActionSchema =
  baseWorkflowActionSchema.extend({
    type: z.literal('CREATE_CALENDAR_EVENT'),
    settings: workflowCreateCalendarEventActionSettingsSchema,
  });
