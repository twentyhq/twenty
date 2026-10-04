import { type ObjectRecordEvent } from 'twenty-shared/database-events';
import { isDefined } from 'twenty-shared/utils';

import { type WorkflowWaitEvent } from 'src/modules/workflow/workflow-wait/types/workflow-wait-event.type';

export const buildWorkflowWaitEvent = ({
  eventName,
  event,
}: {
  eventName: string;
  event: ObjectRecordEvent;
}): WorkflowWaitEvent => {
  // every event shape carries a subset of these
  const { before, after, updatedFields } = event.properties as {
    before?: object;
    after?: object;
    updatedFields?: string[];
  };

  return {
    eventName,
    recordId: event.recordId,
    record: (after ?? before ?? {}) as Record<string, unknown>,
    ...(isDefined(after) && isDefined(before)
      ? { before: before as Record<string, unknown> }
      : {}),
    ...(isDefined(updatedFields) ? { updatedFields } : {}),
  };
};
