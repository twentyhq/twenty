import { getLastDeletedRecordIdsByParentId } from 'src/utils/get-last-deleted-record-ids-by-parent-id.util';

describe('getLastDeletedRecordIdsByParentId', () => {
  it('keeps the records deleted last for each parent', () => {
    const recordIds = getLastDeletedRecordIdsByParentId([
      {
        id: 'removedEarlier',
        parentId: 'task1',
        deletedAt: '2026-01-01T10:00:00.000Z',
      },
      {
        id: 'deletedWithTask1',
        parentId: 'task1',
        deletedAt: '2026-01-02T10:00:00.000Z',
      },
      {
        id: 'alsoDeletedWithTask1',
        parentId: 'task1',
        deletedAt: '2026-01-02T10:00:00.000Z',
      },
      {
        id: 'deletedWithTask2',
        parentId: 'task2',
        deletedAt: '2026-01-01T09:00:00.000Z',
      },
      { id: 'live', parentId: 'task2', deletedAt: null },
      { id: 'orphan', parentId: null, deletedAt: '2026-01-03T10:00:00.000Z' },
    ]);

    expect(recordIds).toEqual([
      'deletedWithTask1',
      'alsoDeletedWithTask1',
      'deletedWithTask2',
    ]);
  });
});
