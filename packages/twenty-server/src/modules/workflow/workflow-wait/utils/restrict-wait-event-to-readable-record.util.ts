import { isDefined } from 'twenty-shared/utils';

import { type PendingWakeUpEvent } from 'src/engine/core-modules/pending-wake-up/types/pending-wake-up-event.type';

// The record read under the run's permissions only holds the fields the run can read
export const restrictWaitEventToReadableRecord = ({
  event,
  readableRecord,
}: {
  event: PendingWakeUpEvent;
  readableRecord: Record<string, unknown>;
}): PendingWakeUpEvent => {
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
