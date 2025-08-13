import { type StringPropertyKeys } from './trim-and-remove-duplicated-whitespaces-from-object-string-properties';
import { isDefined } from './validation/isDefined';

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
        `Should never occur, flat array contains twice the same unique key ${currentUniqueKey}`,
      );
    }

    return {
      ...acc,
      [currentUniqueKey]: occurrence,
    };
  }, {});
};
