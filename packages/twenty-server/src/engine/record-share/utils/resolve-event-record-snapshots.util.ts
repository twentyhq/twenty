import { type ObjectRecordEvent } from 'twenty-shared/database-events';

export type EventRecordSnapshot = { id: string } & Record<string, unknown>;

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
