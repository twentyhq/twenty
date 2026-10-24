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

export const omitReadDeniedFieldsFromTimelineActivityProperties = ({
  properties,
  readDeniedFieldNames,
}: {
  properties: unknown;
  readDeniedFieldNames: Set<string>;
}): unknown => {
  if (!isPlainObject(properties) || readDeniedFieldNames.size === 0) {
    return properties;
  }

  return {
    ...properties,
    ...(isDefined(properties.diff) && {
      diff: omitFieldNames({
        value: properties.diff,
        fieldNames: readDeniedFieldNames,
      }),
    }),
    ...(isDefined(properties.before) && {
      before: omitFieldNames({
        value: properties.before,
        fieldNames: readDeniedFieldNames,
      }),
    }),
    ...(isDefined(properties.after) && {
      after: omitFieldNames({
        value: properties.after,
        fieldNames: readDeniedFieldNames,
      }),
    }),
    ...(Array.isArray(properties.updatedFields) && {
      updatedFields: properties.updatedFields.filter(
        (fieldName) => !readDeniedFieldNames.has(fieldName),
      ),
    }),
  };
};
