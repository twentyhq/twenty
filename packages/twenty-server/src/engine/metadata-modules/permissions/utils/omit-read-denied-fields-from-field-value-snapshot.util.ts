import { isDefined, isPlainObject } from 'twenty-shared/utils';

const omitFieldNames = ({
  value,
  fieldNames,
}: {
  value: unknown;
  fieldNames: Set<string>;
}): unknown =>
  isPlainObject(value)
    ? Object.fromEntries(
        Object.entries(value).filter(
          ([fieldName]) => !fieldNames.has(fieldName),
        ),
      )
    : value;

export const omitReadDeniedFieldsFromFieldValueSnapshot = ({
  snapshot,
  readDeniedFieldNames,
}: {
  snapshot: unknown;
  readDeniedFieldNames: Set<string>;
}): unknown => {
  if (!isPlainObject(snapshot) || readDeniedFieldNames.size === 0) {
    return snapshot;
  }

  return {
    ...snapshot,
    ...(isDefined(snapshot.diff) && {
      diff: omitFieldNames({
        value: snapshot.diff,
        fieldNames: readDeniedFieldNames,
      }),
    }),
    ...(isDefined(snapshot.before) && {
      before: omitFieldNames({
        value: snapshot.before,
        fieldNames: readDeniedFieldNames,
      }),
    }),
    ...(isDefined(snapshot.after) && {
      after: omitFieldNames({
        value: snapshot.after,
        fieldNames: readDeniedFieldNames,
      }),
    }),
    ...(Array.isArray(snapshot.updatedFields) && {
      updatedFields: snapshot.updatedFields.filter(
        (fieldName) => !readDeniedFieldNames.has(fieldName),
      ),
    }),
  };
};
