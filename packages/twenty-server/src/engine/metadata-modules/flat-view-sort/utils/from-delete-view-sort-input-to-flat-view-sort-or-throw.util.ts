import { t } from '@lingui/core/macro';
import {
  extractAndSanitizeObjectStringFields,
  isDefined,
} from 'twenty-shared/utils';

import { type FlatViewSortMaps } from 'src/engine/metadata-modules/flat-view-sort/types/flat-view-sort-maps.type';
import { type FlatViewSort } from 'src/engine/metadata-modules/flat-view-sort/types/flat-view-sort.type';
import { type DeleteViewSortInput } from 'src/engine/metadata-modules/view-sort/dtos/inputs/delete-view-sort.input';
import {
  ViewSortException,
  ViewSortExceptionCode,
} from 'src/engine/metadata-modules/view-sort/exceptions/view-sort.exception';

export const fromDeleteViewSortInputToFlatViewSortOrThrow = ({
  deleteViewSortInput: rawDeleteViewSortInput,
  flatViewSortMaps,
}: {
  deleteViewSortInput: DeleteViewSortInput;
  flatViewSortMaps: FlatViewSortMaps;
}): FlatViewSort => {
  const { id: viewSortId } = extractAndSanitizeObjectStringFields(
    rawDeleteViewSortInput,
    ['id'],
  );

  const existingFlatViewSortToDelete = flatViewSortMaps.byId[viewSortId];

  if (!isDefined(existingFlatViewSortToDelete)) {
    throw new ViewSortException(
      t`View sort to delete not found`,
      ViewSortExceptionCode.VIEW_SORT_NOT_FOUND,
    );
  }

  return {
    ...existingFlatViewSortToDelete,
    deletedAt: new Date().toISOString(),
  };
};
