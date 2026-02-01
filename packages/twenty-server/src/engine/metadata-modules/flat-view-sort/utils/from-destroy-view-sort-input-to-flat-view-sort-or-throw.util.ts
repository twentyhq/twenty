import { t } from '@lingui/core/macro';
import {
  extractAndSanitizeObjectStringFields,
  isDefined,
} from 'twenty-shared/utils';

import { type FlatViewSortMaps } from 'src/engine/metadata-modules/flat-view-sort/types/flat-view-sort-maps.type';
import { type FlatViewSort } from 'src/engine/metadata-modules/flat-view-sort/types/flat-view-sort.type';
import { type DestroyViewSortInput } from 'src/engine/metadata-modules/view-sort/dtos/inputs/destroy-view-sort.input';
import {
  ViewSortException,
  ViewSortExceptionCode,
} from 'src/engine/metadata-modules/view-sort/exceptions/view-sort.exception';

export const fromDestroyViewSortInputToFlatViewSortOrThrow = ({
  destroyViewSortInput,
  flatViewSortMaps,
}: {
  destroyViewSortInput: DestroyViewSortInput;
  flatViewSortMaps: FlatViewSortMaps;
}): FlatViewSort => {
  const { id: viewSortId } = extractAndSanitizeObjectStringFields(
    destroyViewSortInput,
    ['id'],
  );

  const existingFlatViewSortToDestroy = flatViewSortMaps.byId[viewSortId];

  if (!isDefined(existingFlatViewSortToDestroy)) {
    throw new ViewSortException(
      t`View sort to destroy not found`,
      ViewSortExceptionCode.VIEW_SORT_NOT_FOUND,
    );
  }

  return existingFlatViewSortToDestroy;
};
