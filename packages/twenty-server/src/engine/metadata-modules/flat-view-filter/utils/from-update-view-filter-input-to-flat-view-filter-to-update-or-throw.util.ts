import { t } from '@lingui/core/macro';
import {
  extractAndSanitizeObjectStringFields,
  isDefined,
  trimAndRemoveDuplicatedWhitespacesFromObjectStringProperties,
} from 'twenty-shared/utils';

import { FLAT_VIEW_FILTER_EDITABLE_PROPERTIES } from 'src/engine/metadata-modules/flat-view-filter/constants/flat-view-filter-editable-properties.constant';
import { type FlatViewFilterMaps } from 'src/engine/metadata-modules/flat-view-filter/types/flat-view-filter-maps.type';
import { type FlatViewFilter } from 'src/engine/metadata-modules/flat-view-filter/types/flat-view-filter.type';
import { type UpdateViewFilterInput } from 'src/engine/metadata-modules/view-filter/dtos/inputs/update-view-filter.input';
import {
  ViewFilterException,
  ViewFilterExceptionCode,
} from 'src/engine/metadata-modules/view-filter/exceptions/view-filter.exception';
import { mergeUpdateInExistingRecord } from 'src/utils/merge-update-in-existing-record.util';

export const fromUpdateViewFilterInputToFlatViewFilterToUpdateOrThrow = ({
  updateViewFilterInput: rawUpdateViewFilterInput,
  flatViewFilterMaps,
}: {
  updateViewFilterInput: UpdateViewFilterInput;
  flatViewFilterMaps: FlatViewFilterMaps;
}): FlatViewFilter => {
  const { id: viewFilterToUpdateId } =
    trimAndRemoveDuplicatedWhitespacesFromObjectStringProperties(
      rawUpdateViewFilterInput,
      ['id'],
    );

  const existingFlatViewFilterToUpdate =
    flatViewFilterMaps.byId[viewFilterToUpdateId];

  if (!isDefined(existingFlatViewFilterToUpdate)) {
    throw new ViewFilterException(
      t`View filter to update not found`,
      ViewFilterExceptionCode.VIEW_FILTER_NOT_FOUND,
    );
  }

  const updatedEditableFieldProperties = extractAndSanitizeObjectStringFields(
    rawUpdateViewFilterInput.update,
    FLAT_VIEW_FILTER_EDITABLE_PROPERTIES,
  );

  return mergeUpdateInExistingRecord({
    existing: existingFlatViewFilterToUpdate,
    properties: FLAT_VIEW_FILTER_EDITABLE_PROPERTIES,
    update: updatedEditableFieldProperties,
  });
};
