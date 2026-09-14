import { type ObjectRecordEvent } from 'twenty-shared/database-events';

export type EventRecordSnapshot = { id: string } & Record<string, unknown>;

// The record as the event leaves it, or as it was for a deletion, so that a
// record the event destroyed can still be decided on
export const resolveEventRecordSnapshots = (
  events: ObjectRecordEvent[],
): EventRecordSnapshot[] =>
  events.map((event) => {
    const properties = event.properties as { before?: object; after?: object };

    return {
      ...(properties.after ?? properties.before ?? {}),
      id: event.recordId,
    };
  });
