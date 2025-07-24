import { StringPropertyKeys } from '@/utils/trim-and-remove-duplicated-whitespaces-from-object-string-properties';
import { isDefined } from '@/utils/validation';

export const fromArrayToUniqueKeyRecord = <T extends object>({
  array,
  uniqueKey,
}: {
  array: T[];
  uniqueKey: StringPropertyKeys<T>;
}) => {
  return array.reduce<Record<string, T>>((acc, occurence) => {
    const currentUniqueKey = occurence[uniqueKey] as string;

    if (isDefined(acc[currentUniqueKey])) {
      throw new Error(
        `Should never occur, flat array contains twice the same unique key ${occurence[uniqueKey]}`,
      );
    }

    return {
      ...acc,
      [currentUniqueKey]: occurence,
    };
  }, {});
};
