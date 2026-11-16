export const computeTrashCleanupCutoffDate = ({
  now,
  trashRetentionDays,
}: {
  now: Date;
  trashRetentionDays: number;
}): Date =>
  new Date(
    Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate() - trashRetentionDays,
    ),
  );
