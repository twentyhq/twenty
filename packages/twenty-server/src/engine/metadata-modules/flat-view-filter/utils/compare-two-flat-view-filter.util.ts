import { type FromTo } from 'twenty-shared/types';

import { compareTwoFlatEntity } from 'src/engine/core-modules/common/utils/compare-two-flat-entity.util';
import { FLAT_VIEW_FILTER_JSONB_PROPERTIES } from 'src/engine/metadata-modules/flat-view-filter/constants/flat-view-filter-jsonb-properties.constant';
import { FLAT_VIEW_FILTER_PROPERTIES_TO_COMPARE } from 'src/engine/metadata-modules/flat-view-filter/constants/flat-view-filter-properties-to-compare.constant';
import { type FlatViewFilter } from 'src/engine/metadata-modules/flat-view-filter/types/flat-view-filter.type';

type GetWorkspaceMigrationUpdateViewFilterActionArgs = FromTo<
  FlatViewFilter,
  'FlatViewFilter'
>;

export const compareTwoFlatViewFilter = ({
  fromFlatViewFilter,
  toFlatViewFilter,
}: GetWorkspaceMigrationUpdateViewFilterActionArgs) => {
  return compareTwoFlatEntity({
    fromFlatEntity: fromFlatViewFilter,
    toFlatEntity: toFlatViewFilter,
    jsonbProperties: FLAT_VIEW_FILTER_JSONB_PROPERTIES,
    propertiesToCompare: FLAT_VIEW_FILTER_PROPERTIES_TO_COMPARE,
  });
};
