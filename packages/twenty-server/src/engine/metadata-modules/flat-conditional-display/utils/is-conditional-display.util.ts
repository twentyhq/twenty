import { isArray, isString, isUndefined } from '@sniptt/guards';
import { type ConditionalDisplay } from 'twenty-shared/types';
import { isEmptyObject, isPlainObject } from 'twenty-shared/utils';

import { CONDITIONAL_DISPLAY_SELECTED_RECORDS_MATCHES } from 'src/engine/metadata-modules/flat-conditional-display/constants/conditional-display-selected-records-matches.constant';

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
      (isString(selectedRecordsMatch) &&
        Object.keys(CONDITIONAL_DISPLAY_SELECTED_RECORDS_MATCHES).includes(
          selectedRecordsMatch,
        )))
  );
};
