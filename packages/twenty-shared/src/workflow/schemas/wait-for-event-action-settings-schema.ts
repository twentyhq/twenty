import { z } from 'zod';
import { baseWorkflowActionSettingsSchema } from './base-workflow-action-settings-schema';

export const workflowWaitForEventActionSettingsSchema =
  baseWorkflowActionSettingsSchema.extend({
    input: z.object({
      eventName: z
        .string()
        .describe(
          'Event to wait for, in format objectName.action (e.g., "company.updated", "task.created", "person.deleted").',
        ),
      recordId: z
        .string()
        .nullable()
        .optional()
        .describe(
          'Only resume for this record. Usually a variable such as {{trigger.object.id}}. Leave empty to resume on any record.',
        ),
      updatedFields: z
        .array(z.string())
        .nullable()
        .optional()
        .describe(
          'For update events, only resume when one of these fields changed.',
        ),
      timeout: z
        .object({
          days: z.union([z.number().min(0), z.string()]).optional(),
          hours: z.union([z.number().min(0), z.string()]).optional(),
          minutes: z.union([z.number().min(0), z.string()]).optional(),
        })
        .nullable()
        .optional()
        .describe(
          'Stop waiting after this duration. The step then succeeds with hasTimedOut set to true.',
        ),
    }),
  });
