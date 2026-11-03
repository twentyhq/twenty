import { isArray, isUndefined } from '@sniptt/guards';
import { type ConditionalDisplay } from 'twenty-shared/types';
import { isEmptyObject, isPlainObject } from 'twenty-shared/utils';

export const isConditionalDisplay = (
  value: unknown,
): value is ConditionalDisplay => {
  if (!isPlainObject(value)) {
    return false;
  }

  const {
    recordFilters,
    recordFilterGroups,
    selectedRecordsMatch,
    ...otherProperties
  } = value;

  return (
    isEmptyObject(otherProperties) &&
    (isUndefined(recordFilters) || isArray(recordFilters)) &&
    (isUndefined(recordFilterGroups) || isArray(recordFilterGroups)) &&
    (isUndefined(selectedRecordsMatch) ||
      selectedRecordsMatch === 'EVERY' ||
      selectedRecordsMatch === 'SOME')
  );
};
