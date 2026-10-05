import { isDefined } from 'twenty-shared/utils';

const toTime = (value: unknown): number | undefined =>
  isDefined(value) && (typeof value === 'string' || value instanceof Date)
    ? new Date(value).getTime()
    : undefined;

export const isChildRecordBoundAtDeletion = ({
  childRecord,
  record,
}: {
  childRecord: Record<string, unknown>;
  record: Record<string, unknown>;
}): boolean => {
  const childDeletedAt = toTime(childRecord.deletedAt);

  if (!isDefined(childDeletedAt)) {
    return true;
  }

  const recordDeletedAt = toTime(record.deletedAt);

  return isDefined(recordDeletedAt) && childDeletedAt >= recordDeletedAt;
};
