import { isDefined } from 'twenty-shared/utils';

type OnlyStringPropertiesKey<T> = Extract<keyof T, string>;

type StringPropertyKeys<T> = {
  [K in OnlyStringPropertiesKey<T>]: T[K] extends string | undefined
    ? K
    : never;
}[OnlyStringPropertiesKey<T>];

const sanitizeString = (str: string | null) =>
  isDefined(str) ? str.trim().replace(/\s+/g, ' ') : str;

const stripQuotes = (str: string | null) =>
  isDefined(str) ? str.replace(/^['"](.*)['"]$/, '$1') : str;

export const trimAndRemoveDuplicatedWhitespacesFromObjectStringProperties = <T>(
  obj: T,
  keys: StringPropertyKeys<T>[],
) => {
  return keys.reduce((acc, key) => {
    const occurrence = acc[key];

    if (occurrence === undefined || typeof occurrence !== 'string') {
      return acc;
    }

    return {
      ...acc,
      [key]: stripQuotes(sanitizeString(acc[key] as string | null)),
    };
  }, obj);
};
