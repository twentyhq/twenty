import { isNonEmptyString } from '@sniptt/guards';
import { type ObjectRecord } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type WorkspaceTableShape } from 'src/engine/twenty-orm-v2/table-shape/types/workspace-table-shape.type';

export const getUpdateEventColumnsToReturn = (
  columnsToReturn: string[],
  tableShape: WorkspaceTableShape,
): string[] =>
  isDefined(tableShape.columnShapeByColumnName.updatedAt)
    ? [...new Set([...columnsToReturn, 'id', 'updatedAt'])]
    : [...new Set([...columnsToReturn, 'id'])];

export const mergeReturnedUpdateTimestamps = (
  eventRecords: ObjectRecord[],
  returnedRecords: ObjectRecord[],
): ObjectRecord[] => {
  const returnedRecordsById = new Map(
    returnedRecords
      .filter((record) => isNonEmptyString(record.id))
      .map((record) => [record.id, record]),
  );

  return eventRecords.map((eventRecord) => {
    const returnedRecord = isNonEmptyString(eventRecord.id)
      ? returnedRecordsById.get(eventRecord.id)
      : undefined;
    const returnedUpdatedAt = returnedRecord?.updatedAt;

    return isDefined(returnedUpdatedAt)
      ? { ...eventRecord, updatedAt: returnedUpdatedAt }
      : eventRecord;
  });
};
