import { computeTrashCleanupCutoffDate } from 'src/engine/trash-cleanup/utils/compute-trash-cleanup-cutoff-date.util';

describe('computeTrashCleanupCutoffDate', () => {
  it.each([
    {
      trashRetentionDays: 1,
      cleanupRunAt: '2026-11-16T00:10:00.000Z',
      isPurged: false,
    },
    {
      trashRetentionDays: 1,
      cleanupRunAt: '2026-11-17T00:10:00.000Z',
      isPurged: true,
    },
    {
      trashRetentionDays: 14,
      cleanupRunAt: '2026-11-29T00:10:00.000Z',
      isPurged: false,
    },
    {
      trashRetentionDays: 14,
      cleanupRunAt: '2026-11-30T00:10:00.000Z',
      isPurged: true,
    },
  ])(
    'purges a record deleted at 23:50 UTC with $trashRetentionDays day(s) retention at $cleanupRunAt: $isPurged',
    ({ trashRetentionDays, cleanupRunAt, isPurged }) => {
      const deletedAt = new Date('2026-11-15T23:50:00.000Z');
      const cutoffDate = computeTrashCleanupCutoffDate({
        now: new Date(cleanupRunAt),
        trashRetentionDays,
      });

      expect(deletedAt < cutoffDate).toBe(isPurged);
    },
  );
});
