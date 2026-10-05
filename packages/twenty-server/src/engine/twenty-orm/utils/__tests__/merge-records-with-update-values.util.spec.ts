import {
  getUpdateEventRecords,
  mergeRecordsWithUpdateValues,
  mergeRecordWithUpdateValues,
} from 'src/engine/twenty-orm/utils/merge-records-with-update-values.util';

describe('mergeRecordsWithUpdateValues', () => {
  it('merges shared concrete values into every record', () => {
    expect(
      mergeRecordsWithUpdateValues(
        [
          { id: 'first', name: 'First' },
          { id: 'second', name: 'Second' },
        ],
        { name: 'Updated', optionalValue: undefined },
      ),
    ).toEqual([
      { id: 'first', name: 'Updated', optionalValue: undefined },
      { id: 'second', name: 'Updated', optionalValue: undefined },
    ]);
  });

  it('ignores raw SQL function values', () => {
    expect(
      mergeRecordWithUpdateValues(
        { id: 'first', name: 'First', computedValue: 'Persisted value' },
        {
          name: 'Updated',
          computedValue: () => 'CURRENT_TIMESTAMP',
        },
      ),
    ).toEqual({
      id: 'first',
      name: 'Updated',
      computedValue: 'Persisted value',
    });
  });

  it('uses values at the matching record index', () => {
    expect(
      mergeRecordsWithUpdateValues(
        [
          { id: 'first', name: 'First' },
          { id: 'second', name: 'Second' },
        ],
        [{ name: 'First updated' }, { name: 'Second updated' }],
      ),
    ).toEqual([
      { id: 'first', name: 'First updated' },
      { id: 'second', name: 'Second updated' },
    ]);
  });

  it('falls back to the first values entry when an index is missing', () => {
    expect(
      mergeRecordsWithUpdateValues(
        [
          { id: 'first', name: 'First' },
          { id: 'second', name: 'Second' },
        ],
        [{ name: 'Updated' }],
      ),
    ).toEqual([
      { id: 'first', name: 'Updated' },
      { id: 'second', name: 'Updated' },
    ]);
  });

  it('returns the original record when values are missing', () => {
    const record = { id: 'first', name: 'First' };

    expect(mergeRecordWithUpdateValues(record, undefined)).toBe(record);
  });
});

describe('getUpdateEventRecords', () => {
  it('matches post-write records to pre-write records by id', () => {
    expect(
      getUpdateEventRecords(
        [
          { id: 'first', name: 'First before' },
          { id: 'second', name: 'Second before' },
        ],
        [
          { id: 'second', name: 'Second after' },
          { id: 'first', name: 'First after' },
        ],
      ),
    ).toEqual([
      { id: 'first', name: 'First after' },
      { id: 'second', name: 'Second after' },
    ]);
  });

  it('falls back to the pre-write record when the post-write read is stale', () => {
    expect(
      getUpdateEventRecords(
        [
          { id: 'first', name: 'First before' },
          { id: 'second', name: 'Second before' },
        ],
        [{ id: 'first', name: 'First after' }],
      ),
    ).toEqual([
      { id: 'first', name: 'First after' },
      { id: 'second', name: 'Second before' },
    ]);
  });
});
