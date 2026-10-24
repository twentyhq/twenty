import { isDefined, isPlainObject } from 'twenty-shared/utils';

const keepFieldNames = ({
  value,
  fieldNames,
}: {
  value: unknown;
  fieldNames: Set<string>;
}): Record<string, unknown> | undefined =>
  isPlainObject(value)
    ? Object.fromEntries(
        Object.entries(value).filter(([fieldName]) =>
          fieldNames.has(fieldName),
        ),
      )
    : undefined;

export const keepReadableFieldsInTimelineActivityProperties = ({
  properties,
  readableFieldNames,
}: {
  properties: unknown;
  readableFieldNames: Set<string>;
}): Record<string, unknown> | null => {
  if (!isPlainObject(properties)) {
    return null;
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
