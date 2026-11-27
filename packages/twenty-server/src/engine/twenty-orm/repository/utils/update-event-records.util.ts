import { isNonEmptyString } from '@sniptt/guards';
import { type ObjectRecord } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type MutationKind } from 'src/engine/twenty-orm/sql/utils/build-mutation-statement.util';
import { type WorkspaceTableShape } from 'src/engine/twenty-orm/table-shape/types/workspace-table-shape.type';

export const getMutationEventColumnsToReturn = ({
  kind,
  columnsToReturn,
  tableShape,
}: {
  kind: MutationKind;
  columnsToReturn: string[];
  tableShape: Pick<WorkspaceTableShape, 'columnShapeByColumnName'>;
}): string[] =>
  kind === 'update' && isDefined(tableShape.columnShapeByColumnName.updatedAt)
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
