import { t } from '@lingui/core/macro';
import {
  extractAndSanitizeObjectStringFields,
  isDefined,
  trimAndRemoveDuplicatedWhitespacesFromObjectStringProperties,
} from 'twenty-shared/utils';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { FLAT_VIEW_SORT_EDITABLE_PROPERTIES } from 'src/engine/metadata-modules/flat-view-sort/constants/flat-view-sort-editable-properties.constant';
import { type FlatViewSort } from 'src/engine/metadata-modules/flat-view-sort/types/flat-view-sort.type';
import { type UpdateViewSortInput } from 'src/engine/metadata-modules/view-sort/dtos/inputs/update-view-sort.input';
import {
  ViewSortException,
  ViewSortExceptionCode,
} from 'src/engine/metadata-modules/view-sort/exceptions/view-sort.exception';
import { mergeUpdateInExistingRecord } from 'src/utils/merge-update-in-existing-record.util';

export const fromUpdateViewSortInputToFlatViewSortToUpdateOrThrow = ({
  updateViewSortInput: rawUpdateViewSortInput,
  flatViewSortMaps,
}: {
  updateViewSortInput: UpdateViewSortInput;
  flatViewSortMaps: FlatEntityMaps<FlatViewSort>;
}): FlatViewSort => {
  const { id: viewSortToUpdateId, update } =
    trimAndRemoveDuplicatedWhitespacesFromObjectStringProperties(
      rawUpdateViewSortInput,
      ['id'],
    );

  const existingFlatViewSortToUpdate =
    flatViewSortMaps.byId[viewSortToUpdateId];

  if (!isDefined(existingFlatViewSortToUpdate)) {
    throw new ViewSortException(
      t`View sort to update not found`,
      ViewSortExceptionCode.VIEW_SORT_NOT_FOUND,
    );
  }

  const updatedEditableSortProperties = extractAndSanitizeObjectStringFields(
    update,
    FLAT_VIEW_SORT_EDITABLE_PROPERTIES,
  );

  return mergeUpdateInExistingRecord({
    existing: existingFlatViewSortToUpdate,
    properties: FLAT_VIEW_SORT_EDITABLE_PROPERTIES,
    update: updatedEditableSortProperties,
  });
};
