import { getInsertedRecordIdsByInputIndex } from 'src/engine/twenty-orm/field-operations/rich-text-field-file-sync/utils/get-inserted-record-ids-by-input-index.util';

describe('getInsertedRecordIdsByInputIndex', () => {
  it('should use the id each record was inserted with', () => {
    expect(
      getInsertedRecordIdsByInputIndex({
        records: [{ id: 'first' }, { id: 'second' }],
        insertedIds: ['first', 'second'],
      }),
    ).toEqual(['first', 'second']);
  });

  it('should match generated ids by position when every record was inserted', () => {
    expect(
      getInsertedRecordIdsByInputIndex({
        records: [{}, { id: 'second' }],
        insertedIds: ['generated', 'second'],
      }),
    ).toEqual(['generated', 'second']);
  });

  it('should leave out records a conflict skipped', () => {
    expect(
      getInsertedRecordIdsByInputIndex({
        records: [{ id: 'skipped' }, {}, { id: 'third' }],
        insertedIds: ['generated', 'third'],
      }),
    ).toEqual([undefined, undefined, 'third']);
  });
});
