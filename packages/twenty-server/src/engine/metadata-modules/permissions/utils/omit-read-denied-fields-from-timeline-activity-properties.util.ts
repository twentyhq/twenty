import { isDefined, isPlainObject } from 'twenty-shared/utils';

const omitFieldNames = (value: unknown, fieldNames: Set<string>): unknown =>
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
      diff: omitFieldNames(properties.diff, readDeniedFieldNames),
    }),
    ...(isDefined(properties.before) && {
      before: omitFieldNames(properties.before, readDeniedFieldNames),
    }),
    ...(isDefined(properties.after) && {
      after: omitFieldNames(properties.after, readDeniedFieldNames),
    }),
    ...(Array.isArray(properties.updatedFields) && {
      updatedFields: properties.updatedFields.filter(
        (fieldName) => !readDeniedFieldNames.has(fieldName),
      ),
    }),
  };
};
