import { z } from 'zod';
import { baseWorkflowActionSettingsSchema } from './base-workflow-action-settings-schema';

export const workflowCreateInboxItemActionSettingsSchema =
  baseWorkflowActionSettingsSchema.extend({
    input: z.object({
      title: z.string(),
      summary: z.string().optional(),
      icon: z.string().optional(),
      queueId: z.string().optional(),
      assigneeWorkspaceMemberId: z.string().optional(),
      priority: z.enum(['NEEDS_ACTION', 'UPDATE']).optional(),
      slotKey: z.string().optional(),
    }),
  });
