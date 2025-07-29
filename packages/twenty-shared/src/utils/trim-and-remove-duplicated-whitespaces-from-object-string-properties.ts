import { trimAndRemoveDuplicatedWhitespacesFromString } from '@/utils/trim-and-remove-duplicated-whitespaces-from-string';

type OnlyStringPropertiesKey<T> = Extract<keyof T, string>;

export type StringPropertyKeys<T> = {
  [K in OnlyStringPropertiesKey<T>]: T[K] extends string | undefined
    ? K
    : never;
}[OnlyStringPropertiesKey<T>];

export const trimAndRemoveDuplicatedWhitespacesFromObjectStringProperties = <
  T,
  TKeys extends StringPropertyKeys<T>[],
  TExtract extends boolean = false,
>(
  obj: T,
  keys: TKeys,
  extractKeys?: TExtract,
): TExtract extends true
  ? {
      [P in TKeys[number]]: T[P];
    }
  : T => {
  return keys.reduce(
    (acc, key) => {
      const occurrence = obj[key];

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
    },
    extractKeys ? ({} as T) : obj,
  );
};
