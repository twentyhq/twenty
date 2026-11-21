import { isString } from '@sniptt/guards';

// An insert can skip conflicting rows, so a returned row is only matched by position when none was skipped.
export const getInsertedRecordIdsByInputIndex = ({
  records,
  insertedIds,
}: {
  records: { id?: unknown }[];
  insertedIds: string[];
}): (string | undefined)[] => {
  const insertedIdSet = new Set(insertedIds);
  const wasEveryRecordInserted = insertedIds.length === records.length;

  return records.map(({ id }, recordIndex) => {
    if (isString(id)) {
      return insertedIdSet.has(id) ? id : undefined;
    }

    return wasEveryRecordInserted ? insertedIds[recordIndex] : undefined;
  });
};
