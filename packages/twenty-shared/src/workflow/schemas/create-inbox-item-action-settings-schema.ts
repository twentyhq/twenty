import { z } from 'zod';
import { baseWorkflowActionSettingsSchema } from './base-workflow-action-settings-schema';

export const workflowCreateInboxItemActionSettingsSchema =
  baseWorkflowActionSettingsSchema.extend({
    input: z.object({
      title: z.string(),
      preview: z.string().optional(),
      typeKey: z.string(),
      queueId: z.string().optional(),
      assigneeWorkspaceMemberId: z.string().optional(),
      priority: z.enum(['NEEDS_ACTION', 'UPDATE']).optional(),
      slotKey: z.string().optional(),
    }),
  });
