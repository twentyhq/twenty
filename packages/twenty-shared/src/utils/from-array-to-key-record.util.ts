import { StringPropertyKeys } from '@/utils/trim-and-remove-duplicated-whitespaces-from-object-string-properties';
import { isDefined } from '@/utils/validation';

export const fromArrayToKeyRecordArray = <T extends object>({
  array,
  key,
}: {
  array: T[];
  key: StringPropertyKeys<T>;
}) => {
  return array.reduce<Record<string, T[]>>((acc, value) => {
    const currentKey = value[key] as string;
    const occurrence = acc[currentKey];

    if (isDefined(occurrence)) {
      return {
        ...acc,
        [currentKey]: [...occurrence, value],
      };
    }

    return {
      ...acc,
      [key]: [value],
    };
  }, {});
};
