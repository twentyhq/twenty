import { isDefined } from 'twenty-shared/utils';

type DeletedChildRecord = {
  id: string;
  parentId: string | null;
  deletedAt: string | Date | null;
};

export const getLastDeletedRecordIdsByParentId = (
  records: DeletedChildRecord[],
): string[] => {
  const lastDeletionTimeByParentId = new Map<string, number>();

  for (const { parentId, deletedAt } of records) {
    if (!isDefined(parentId) || !isDefined(deletedAt)) {
      continue;
    }

    const deletionTime = new Date(deletedAt).getTime();

    if (deletionTime > (lastDeletionTimeByParentId.get(parentId) ?? 0)) {
      lastDeletionTimeByParentId.set(parentId, deletionTime);
    }
  }

  return records
    .filter(
      ({ parentId, deletedAt }) =>
        isDefined(parentId) &&
        isDefined(deletedAt) &&
        new Date(deletedAt).getTime() ===
          lastDeletionTimeByParentId.get(parentId),
    )
    .map(({ id }) => id);
};
