// Records soft-deleted before the returned date are permanently deleted.
// The cleanup runs once a day, so a record stays in the trash for at least
// `trashRetentionDays` full days and at most one day longer.
export const computeTrashCleanupCutoffDate = (
  trashRetentionDays: number,
): Date => {
  const cutoffDate = new Date();

  cutoffDate.setUTCHours(0, 0, 0, 0);
  cutoffDate.setUTCDate(cutoffDate.getUTCDate() - trashRetentionDays);

  return cutoffDate;
};
