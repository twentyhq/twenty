import { t } from '@lingui/core/macro';
import {
  extractAndSanitizeObjectStringFields,
  isDefined,
} from 'twenty-shared/utils';

import { type FlatViewFilterMaps } from 'src/engine/metadata-modules/flat-view-filter/types/flat-view-filter-maps.type';
import { type FlatViewFilter } from 'src/engine/metadata-modules/flat-view-filter/types/flat-view-filter.type';
import { type DestroyViewFilterInput } from 'src/engine/metadata-modules/view-filter/dtos/inputs/destroy-view-filter.input';
import {
  ViewFilterException,
  ViewFilterExceptionCode,
} from 'src/engine/metadata-modules/view-filter/exceptions/view-filter.exception';

export const fromDestroyViewFilterInputToFlatViewFilterOrThrow = ({
  destroyViewFilterInput,
  flatViewFilterMaps,
}: {
  destroyViewFilterInput: DestroyViewFilterInput;
  flatViewFilterMaps: FlatViewFilterMaps;
}): FlatViewFilter => {
  const { id: viewFilterId } = extractAndSanitizeObjectStringFields(
    destroyViewFilterInput,
    ['id'],
  );

  const existingFlatViewFilterToDestroy = flatViewFilterMaps.byId[viewFilterId];

  if (!isDefined(existingFlatViewFilterToDestroy)) {
    throw new ViewFilterException(
      t`View filter to destroy not found`,
      ViewFilterExceptionCode.VIEW_FILTER_NOT_FOUND,
    );
  }

  return existingFlatViewFilterToDestroy;
};
