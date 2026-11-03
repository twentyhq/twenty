import { type ObjectRecordEvent } from 'twenty-shared/database-events';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

import { type RowAccessRecord } from 'src/engine/permissions/combine/types/row-access-policy.type';

export const resolveEventRecordAccessSnapshots = (
  events: ObjectRecordEvent[],
): RowAccessRecord[] =>
  events.flatMap((event) => {
    const properties = event.properties;
    const snapshots = [
      'before' in properties ? properties.before : undefined,
      'after' in properties ? properties.after : undefined,
    ]
      .filter(isDefined)
      .map((record) => ({ ...record, id: event.recordId }));

    return isNonEmptyArray(snapshots) ? snapshots : [{ id: event.recordId }];
  });
