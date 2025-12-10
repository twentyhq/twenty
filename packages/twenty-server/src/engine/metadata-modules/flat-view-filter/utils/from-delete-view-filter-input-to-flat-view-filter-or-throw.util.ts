import { t } from '@lingui/core/macro';
import {
  extractAndSanitizeObjectStringFields,
  isDefined,
} from 'twenty-shared/utils';

import { type FlatViewFilterMaps } from 'src/engine/metadata-modules/flat-view-filter/types/flat-view-filter-maps.type';
import { type FlatViewFilter } from 'src/engine/metadata-modules/flat-view-filter/types/flat-view-filter.type';
import { type DeleteViewFilterInput } from 'src/engine/metadata-modules/view-filter/dtos/inputs/delete-view-filter.input';
import {
  ViewFilterException,
  ViewFilterExceptionCode,
} from 'src/engine/metadata-modules/view-filter/exceptions/view-filter.exception';

export const fromDeleteViewFilterInputToFlatViewFilterOrThrow = ({
  deleteViewFilterInput: rawDeleteViewFilterInput,
  flatViewFilterMaps,
}: {
  deleteViewFilterInput: DeleteViewFilterInput;
  flatViewFilterMaps: FlatViewFilterMaps;
}): FlatViewFilter => {
  const { id: viewFilterId } = extractAndSanitizeObjectStringFields(
    rawDeleteViewFilterInput,
    ['id'],
  );

  const existingFlatViewFilterToDelete = flatViewFilterMaps.byId[viewFilterId];

  if (!isDefined(existingFlatViewFilterToDelete)) {
    throw new ViewFilterException(
      t`View filter to delete not found`,
      ViewFilterExceptionCode.VIEW_FILTER_NOT_FOUND,
    );
  }

  return {
    ...existingFlatViewFilterToDelete,
    deletedAt: new Date().toISOString(),
  };
};
