import { type ObjectRecordEvent } from 'twenty-shared/database-events';

import { type InheritedReadabilityChildRecords } from 'src/engine/twenty-orm/types/inherited-readability-child-records.type';

export type EventRecordSnapshot = {
  id: string;
  inheritedReadabilityChildRecords?: InheritedReadabilityChildRecords;
} & Record<string, unknown>;

export const resolveEventRecordSnapshots = (
  events: ObjectRecordEvent[],
): EventRecordSnapshot[] =>
  events.map((event) => {
    const properties = event.properties as {
      before?: object;
      after?: object;
      inheritedReadabilityChildRecords?: InheritedReadabilityChildRecords;
    };

    return {
      ...(properties.after ?? properties.before ?? {}),
      id: event.recordId,
      inheritedReadabilityChildRecords:
        properties.inheritedReadabilityChildRecords,
    };
  });
