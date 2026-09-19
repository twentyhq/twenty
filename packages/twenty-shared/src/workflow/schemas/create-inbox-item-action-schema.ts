import { z } from 'zod';
import { baseWorkflowActionSchema } from './base-workflow-action-schema';
import { workflowCreateInboxItemActionSettingsSchema } from './create-inbox-item-action-settings-schema';

export const workflowCreateInboxItemActionSchema =
  baseWorkflowActionSchema.extend({
    type: z.literal('CREATE_INBOX_ITEM'),
    settings: workflowCreateInboxItemActionSettingsSchema,
  });
