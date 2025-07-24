import { isDefined } from "class-validator";
import { StringPropertyKeys } from "src/utils/trim-and-remove-duplicated-whitespaces-from-object-string-properties";

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
        `Should never occur, flat field metadata contains twice the same field ${occurence[uniqueKey]}`,
      );
    }

    return {
      ...acc,
      [currentUniqueKey]: occurence,
    };
  }, {});
};
