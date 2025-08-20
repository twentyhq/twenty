import { type StringPropertyKeys } from '@/utils/trim-and-remove-duplicated-whitespaces-from-object-string-properties';
import { isDefined } from '@/utils/validation';

export const fromArrayToValuesByKeyRecord = <T extends object>({
  array,
  key,
}: {
  array: T[];
  key: StringPropertyKeys<T>;
}) => {
  return array.reduce<Record<string, T[]>>((acc, value) => {
    const computedKey = value[key] as string;
    const occurrence = acc[computedKey];

    if (isDefined(occurrence)) {
      return {
        ...acc,
        [computedKey]: [...occurrence, value],
      };
    }

    return {
      ...acc,
      [computedKey]: [value],
    };
  }, {});
};
