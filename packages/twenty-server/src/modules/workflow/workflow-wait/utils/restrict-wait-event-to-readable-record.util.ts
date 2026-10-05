import { isDefined } from 'twenty-shared/utils';

import { type WorkflowWaitEvent } from 'src/modules/workflow/workflow-wait/types/workflow-wait-event.type';

// The record read under the run's permissions only holds the fields the run can read
export const restrictWaitEventToReadableRecord = ({
  event,
  readableRecord,
}: {
  event: WorkflowWaitEvent;
  readableRecord: Record<string, unknown>;
}): WorkflowWaitEvent => {
  const readableFieldNames = new Set(Object.keys(readableRecord));
  const isReadableField = (fieldName: string) =>
    readableFieldNames.has(fieldName);

  return {
    ...event,
    record: readableRecord,
    before: isDefined(event.before)
      ? Object.fromEntries(
          Object.entries(event.before).filter(([fieldName]) =>
            isReadableField(fieldName),
          ),
        )
      : undefined,
    updatedFields: event.updatedFields?.filter(isReadableField),
  };
};
