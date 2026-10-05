import { isChildRecordBoundAtDeletion } from 'src/engine/twenty-orm/utils/is-child-record-bound-at-deletion.util';

describe('isChildRecordBoundAtDeletion', () => {
  it('should bind a live child record whatever the record state', () => {
    expect(
      isChildRecordBoundAtDeletion({
        childRecord: { deletedAt: null },
        record: { deletedAt: null },
      }),
    ).toBe(true);
    expect(
      isChildRecordBoundAtDeletion({
        childRecord: { deletedAt: null },
        record: { deletedAt: '2026-09-15T08:00:00.000Z' },
      }),
    ).toBe(true);
  });

  it('should not bind a child record detached before a live record is deleted', () => {
    expect(
      isChildRecordBoundAtDeletion({
        childRecord: { deletedAt: '2026-09-15T07:00:00.000Z' },
        record: { deletedAt: null },
      }),
    ).toBe(false);
  });

  it('should bind a child record deleted with or after a trashed record', () => {
    expect(
      isChildRecordBoundAtDeletion({
        childRecord: { deletedAt: new Date('2026-09-15T08:00:00.000Z') },
        record: { deletedAt: '2026-09-15T08:00:00.000Z' },
      }),
    ).toBe(true);
    expect(
      isChildRecordBoundAtDeletion({
        childRecord: { deletedAt: '2026-09-15T08:00:01.000Z' },
        record: { deletedAt: new Date('2026-09-15T08:00:00.000Z') },
      }),
    ).toBe(true);
  });

  it('should not bind a child record detached before a trashed record was deleted', () => {
    expect(
      isChildRecordBoundAtDeletion({
        childRecord: { deletedAt: '2026-09-15T07:59:59.000Z' },
        record: { deletedAt: '2026-09-15T08:00:00.000Z' },
      }),
    ).toBe(false);
  });
});
