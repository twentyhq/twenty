import { isNonEmptyArray } from '@sniptt/guards';

import { type ConditionalAvailabilityArrayMethod } from '@/types/ConditionalAvailabilityArrayMethod';
import { safeGetNestedProperty } from '@/utils/conditional-availability/safeGetNestedProperty';

export const createArrayPropValueCheck = (
  method: ConditionalAvailabilityArrayMethod,
  predicate: (value: unknown, target: unknown) => boolean,
) => {
  return (array: unknown, prop: string, value: unknown) => {
    if (!isNonEmptyArray(array)) {
      return false;
    }

    return array[method]((item) =>
      predicate(safeGetNestedProperty(item, prop), value),
    );
  };
};
