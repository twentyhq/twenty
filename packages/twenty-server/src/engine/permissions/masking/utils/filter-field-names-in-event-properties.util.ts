import { isString } from '@sniptt/guards';
import { isDefined, isPlainObject } from 'twenty-shared/utils';

type EventPropertiesWithFieldNames = {
  before?: unknown;
  after?: unknown;
  diff?: unknown;
  updatedFields?: unknown;
};

export const filterFieldNamesInEventProperties = ({
  properties,
  isFieldNameKept,
}: {
  properties: EventPropertiesWithFieldNames;
  isFieldNameKept: (fieldName: string) => boolean;
}): EventPropertiesWithFieldNames => {
  const keepFieldNames = (value: unknown) =>
    isPlainObject(value)
      ? Object.fromEntries(
          Object.entries(value).filter(([fieldName]) =>
            isFieldNameKept(fieldName),
          ),
        )
      : undefined;

  return {
    ...(isDefined(properties.before) && {
      before: keepFieldNames(properties.before),
    }),
    ...(isDefined(properties.after) && {
      after: keepFieldNames(properties.after),
    }),
    ...(isDefined(properties.diff) && {
      diff: keepFieldNames(properties.diff),
    }),
    ...(Array.isArray(properties.updatedFields) && {
      updatedFields: properties.updatedFields.filter(
        (fieldName) => isString(fieldName) && isFieldNameKept(fieldName),
      ),
    }),
  };
};
