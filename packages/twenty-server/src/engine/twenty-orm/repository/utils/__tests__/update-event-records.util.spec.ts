import { FieldMetadataType, type ObjectRecord } from 'twenty-shared/types';

import {
  getMutationEventColumnsToReturn,
  mergeReturnedUpdateTimestamps,
} from 'src/engine/twenty-orm/repository/utils/update-event-records.util';

const UPDATED_AT_COLUMN_SHAPE = {
  columnName: 'updatedAt',
  fieldMetadataId: 'field-updatedAt',
  fieldName: 'updatedAt',
  fieldMetadataType: FieldMetadataType.DATE_TIME,
};

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

  it('returns id and updatedAt for an update', () => {
    expect(
      getMutationEventColumnsToReturn({
        kind: 'update',
        columnsToReturn: ['name'],
        tableShape: {
          columnShapeByColumnName: { updatedAt: UPDATED_AT_COLUMN_SHAPE },
        },
      }),
    ).toEqual(['name', 'id', 'updatedAt']);
  });

  it.each(['delete', 'soft-delete', 'restore'] as const)(
    'returns id without updatedAt for a %s',
    (kind) => {
      expect(
        getMutationEventColumnsToReturn({
          kind,
          columnsToReturn: ['name'],
          tableShape: {
            columnShapeByColumnName: { updatedAt: UPDATED_AT_COLUMN_SHAPE },
          },
        }),
      ).toEqual(['name', 'id']);
    },
  );
});
