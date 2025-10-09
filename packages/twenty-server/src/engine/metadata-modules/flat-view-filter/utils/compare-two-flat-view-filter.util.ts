import { isEqual } from 'lodash';

import { FLAT_VIEW_FILTER_PROPERTIES_TO_COMPARE } from 'src/engine/metadata-modules/flat-view-filter/constants/flat-view-filter-properties-to-compare.constant';
import { type FlatViewFilter } from 'src/engine/metadata-modules/flat-view-filter/types/flat-view-filter.type';

export const compareTwoFlatViewFilter = (
  flatViewFilter1: FlatViewFilter,
  flatViewFilter2: FlatViewFilter,
): boolean => {
  for (const property of FLAT_VIEW_FILTER_PROPERTIES_TO_COMPARE) {
    if (!isEqual(flatViewFilter1[property], flatViewFilter2[property])) {
      return false;
    }
  }

  return true;
};

