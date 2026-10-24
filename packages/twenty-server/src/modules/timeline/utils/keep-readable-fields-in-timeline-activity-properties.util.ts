import { isDefined, isPlainObject } from 'twenty-shared/utils';

const keepFieldNames = ({
  value,
  fieldNames,
}: {
  value: unknown;
  fieldNames: Set<string>;
}): unknown =>
  isPlainObject(value)
    ? Object.fromEntries(
        Object.entries(value).filter(([fieldName]) =>
          fieldNames.has(fieldName),
        ),
      )
    : value;

export const keepReadableFieldsInTimelineActivityProperties = ({
  properties,
  readableFieldNames,
}: {
  properties: unknown;
  readableFieldNames: Set<string>;
}): unknown => {
  if (!isPlainObject(properties)) {
    return properties;
  }

  return {
    ...properties,
    ...(isDefined(properties.diff) && {
      diff: keepFieldNames({
        value: properties.diff,
        fieldNames: readableFieldNames,
      }),
    }),
    ...(isDefined(properties.before) && {
      before: keepFieldNames({
        value: properties.before,
        fieldNames: readableFieldNames,
      }),
    }),
    ...(isDefined(properties.after) && {
      after: keepFieldNames({
        value: properties.after,
        fieldNames: readableFieldNames,
      }),
    }),
    ...(Array.isArray(properties.updatedFields) && {
      updatedFields: properties.updatedFields.filter((fieldName) =>
        readableFieldNames.has(fieldName),
      ),
    }),
  };
};
