import { type StringPropertyKeys } from '@/utils/trim-and-remove-duplicated-whitespaces-from-object-string-properties';
import { isDefined } from '@/utils/validation';

export const fromArrayToUniqueKeyRecord = <T extends object>({
  array,
  uniqueKey,
}: {
  array: T[];
  uniqueKey: StringPropertyKeys<T>;
}) => {
  return array.reduce<Record<string, T>>((acc, occurrence) => {
    const currentUniqueKey = occurrence[uniqueKey] as string;

    if (isDefined(acc[currentUniqueKey])) {
      throw new Error(
        `Should never occur, flat array contains twice the same unique key ${occurrence[uniqueKey]}`,
      );
    }

    return {
      ...acc,
      [currentUniqueKey]: occurrence,
    };
  }, {});
};
