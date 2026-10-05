import { isDefined } from 'twenty-shared/utils';

import type { ObjectRecordEvent } from 'twenty-shared/database-events';

export const filterEventsByUpdatedFields = <TEvent extends ObjectRecordEvent>({
  events,
  eventName,
  watchedFields,
}: {
  events: TEvent[];
  eventName: string;
  watchedFields?: string[];
}): TEvent[] => {
  const [, action] = eventName.split('.');

  if (action !== 'updated') {
    return events;
  }

  if (!isDefined(watchedFields) || watchedFields.length === 0) {
    return events;
  }

  return events.filter((event) => {
    const eventUpdatedFields = (
      event.properties as { updatedFields?: string[] }
    )?.updatedFields;

    if (!isDefined(eventUpdatedFields) || eventUpdatedFields.length === 0) {
      return false;
    }

    return eventUpdatedFields.some((fieldName) =>
      watchedFields.includes(fieldName),
    );
  });
};
