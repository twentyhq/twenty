import { isNonEmptyArray } from '@sniptt/guards';

import { type ConditionalAvailabilityArrayMethod } from '@/types/ConditionalAvailabilityArrayMethod';
import { safeGetNestedProperty } from '@/utils/conditional-availability/safeGetNestedProperty';

export const createArrayPropCheck = (
  method: ConditionalAvailabilityArrayMethod,
  predicate: (value: unknown) => boolean,
) => {
  return (array: unknown, prop: string) => {
    if (!isNonEmptyArray(array)) {
      return false;
    }

    return array[method]((item) =>
      predicate(safeGetNestedProperty(item, prop)),
    );
  };
};
