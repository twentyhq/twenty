import { trimAndRemoveDuplicatedWhitespacesFromString } from 'src/utils/trim-and-remove-duplicated-whitespaces-from-string';

type OnlyStringPropertiesKey<T> = Extract<keyof T, string>;

type StringPropertyKeys<T> = {
  [K in OnlyStringPropertiesKey<T>]: T[K] extends string | undefined
    ? K
    : never;
}[OnlyStringPropertiesKey<T>];

export const trimAndRemoveDuplicatedWhitespacesFromObjectStringProperties = <T>(
  obj: T,
  keys: StringPropertyKeys<T>[],
) => {
  return keys.reduce((acc, key) => {
    const occurrence = acc[key];

    if (
      occurrence === undefined ||
      typeof occurrence !== 'string' ||
      occurrence === null
    ) {
      return acc;
    }

    return {
      ...acc,
      [key]: trimAndRemoveDuplicatedWhitespacesFromString(occurrence),
    };
  }, obj);
};
