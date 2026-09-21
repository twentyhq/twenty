import { isNonEmptyString } from '@sniptt/guards';
import { type ObjectLiteral } from 'typeorm';
import { type QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';

type UpdateValues<TRecord extends ObjectLiteral> =
  | QueryDeepPartialEntity<TRecord>
  | ObjectLiteral;

const getConcreteUpdateValues = <TRecord extends ObjectLiteral>(
  values: UpdateValues<TRecord>,
): Partial<TRecord> =>
  Object.fromEntries(
    Object.entries(values).filter(([, value]) => typeof value !== 'function'),
  ) as Partial<TRecord>;

export const mergeRecordWithUpdateValues = <TRecord extends ObjectLiteral>(
  record: TRecord,
  values: UpdateValues<TRecord> | undefined,
): TRecord => {
  if (values === undefined) {
    return record;
  }

  return { ...record, ...getConcreteUpdateValues(values) };
};

export const mergeRecordsWithUpdateValues = <TRecord extends ObjectLiteral>(
  records: TRecord[],
  values: UpdateValues<TRecord> | UpdateValues<TRecord>[],
): TRecord[] => {
  if (!Array.isArray(values)) {
    const concreteValues = getConcreteUpdateValues(values);

    return records.map((record) => ({ ...record, ...concreteValues }));
  }

  return records.map((record, index) =>
    mergeRecordWithUpdateValues(record, values[index] ?? values[0]),
  );
};

export const getUpdateEventRecords = <TRecord extends ObjectLiteral>(
  recordsBefore: TRecord[],
  recordsAfter: TRecord[],
): TRecord[] => {
  const recordsAfterById = new Map(
    recordsAfter
      .filter((record) => isNonEmptyString(record.id))
      .map((record) => [record.id, record]),
  );

  return recordsBefore.map((recordBefore, index) =>
    isNonEmptyString(recordBefore.id)
      ? (recordsAfterById.get(recordBefore.id) ?? recordBefore)
      : (recordsAfter[index] ?? recordBefore),
  );
};
