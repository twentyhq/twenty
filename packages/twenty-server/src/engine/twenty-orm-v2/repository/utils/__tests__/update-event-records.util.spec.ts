import { type ObjectRecord } from 'twenty-shared/types';

import { mergeReturnedUpdateTimestamps } from 'src/engine/twenty-orm-v2/repository/utils/update-event-records.util';

describe('update event records util', () => {
  it('merges returned timestamps by record id without replacing event data', () => {
    const eventRecords = [
      { id: 'one', name: 'Updated name', updatedAt: 'old-one' },
      { id: 'two', name: 'Another update', updatedAt: 'old-two' },
    ] as ObjectRecord[];

    expect(
      mergeReturnedUpdateTimestamps(eventRecords, [
        { id: 'two', updatedAt: 'new-two' },
        { id: 'one', updatedAt: 'new-one' },
      ] as ObjectRecord[]),
    ).toEqual([
      { id: 'one', name: 'Updated name', updatedAt: 'new-one' },
      { id: 'two', name: 'Another update', updatedAt: 'new-two' },
    ]);
  });

  it('keeps the event timestamp when the mutation did not return one', () => {
    const eventRecord = {
      id: 'one',
      name: 'Updated name',
      updatedAt: 'existing',
    } as ObjectRecord;

    expect(mergeReturnedUpdateTimestamps([eventRecord], [])).toEqual([
      eventRecord,
    ]);
  });
});
