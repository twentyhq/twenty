import { isNonEmptyString } from '@sniptt/guards';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { z } from 'zod';

import {
  buildSecondWaitRefusalOutput,
  buildWaitPendingOutput,
} from 'src/modules/workflow/workflow-executor/workflow-actions/ai-agent/tools/build-wait-pending-output.util';
import { type WorkflowAgentWaitSlot } from 'src/modules/workflow/workflow-executor/workflow-actions/ai-agent/tools/workflow-agent-wait-slot.type';

const MAX_TIMEOUT_IN_MINUTES = 60 * 24 * 365;

const waitForEventInputSchema = z.object({
  objectName: z
    .string()
    .regex(/^[a-z][a-zA-Z0-9]*$/)
    .describe('Singular name of the object to watch, e.g. "company".'),
  action: z
    .enum(['created', 'updated', 'deleted'])
    .describe('What must happen to a record of that object.'),
  recordId: z
    .uuid()
    .optional()
    .describe('Only resume for this record. Omit to resume on any record.'),
  updatedFields: z
    .array(z.string())
    .optional()
    .describe(
      'Only for the updated action: resume only when one of these fields changed.',
    ),
  timeoutInMinutes: z
    .number()
    .int()
    .positive()
    .max(MAX_TIMEOUT_IN_MINUTES)
    .optional()
    .describe(
      'Stop waiting after this many minutes. Omit to wait without limit.',
    ),
});

export const createWaitForEventTool = (waitSlot: WorkflowAgentWaitSlot) => ({
  description:
    'Pause the workflow until a record is created, updated or deleted. You then continue with the ' +
    'id of the record that changed, which you can read with your tools, or learn that the wait timed out.',
  inputSchema: waitForEventInputSchema,
  execute: async ({
    objectName,
    action,
    recordId,
    updatedFields,
    timeoutInMinutes,
  }: z.infer<typeof waitForEventInputSchema>) => {
    if (waitSlot.isTaken) {
      return buildSecondWaitRefusalOutput();
    }

    waitSlot.isTaken = true;

    const eventName = `${objectName}.${action}`;

    return buildWaitPendingOutput({
      message: `Waiting for ${eventName}; the workflow resumes when it happens.`,
      wait: {
        type: 'EVENT',
        eventName,
        ...(isNonEmptyString(recordId) ? { recordId } : {}),
        ...(action === 'updated' && isNonEmptyArray(updatedFields)
          ? { updatedFields }
          : {}),
        ...(isDefined(timeoutInMinutes)
          ? {
              expiresAt: new Date(
                Date.now() + timeoutInMinutes * 60 * 1000,
              ).toISOString(),
            }
          : {}),
      },
    });
  },
});
