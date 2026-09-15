import { type ObjectRecordEvent } from 'twenty-shared/database-events';
import { isDefined } from 'twenty-shared/utils';

import { type InheritedReadabilityChildRecords } from 'src/engine/twenty-orm/types/inherited-readability-child-records.type';

export const omitInheritedReadabilityChildRecords = <
  TEvent extends ObjectRecordEvent,
>(
  event: TEvent,
): TEvent => {
  const { inheritedReadabilityChildRecords, ...properties } =
    event.properties as TEvent['properties'] & {
      inheritedReadabilityChildRecords?: InheritedReadabilityChildRecords;
    };

  return isDefined(inheritedReadabilityChildRecords)
    ? ({ ...event, properties } as TEvent)
    : event;
};
