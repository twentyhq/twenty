import { isNonEmptyArray } from '@sniptt/guards';

import { safeGetNestedProperty } from '@/utils/conditional-availability/safeGetNestedProperty';

export const createArrayPropertyCheck =
  (
    method: 'every' | 'some',
    predicate: (propertyValue: unknown, value: unknown) => boolean,
  ) =>
  (array: unknown, propertyPath: string, value?: unknown) =>
    isNonEmptyArray(array) &&
    array[method]((item) =>
      predicate(safeGetNestedProperty(item, propertyPath), value),
    );
