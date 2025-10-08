import { t } from '@lingui/core/macro';
import {
    extractAndSanitizeObjectStringFields,
    isDefined,
    trimAndRemoveDuplicatedWhitespacesFromObjectStringProperties,
} from 'twenty-shared/utils';

import { type UpdateViewInput } from 'src/engine/metadata-modules/view/dtos/inputs/update-view.input';
import {
    ViewException,
    ViewExceptionCode,
} from 'src/engine/metadata-modules/view/exceptions/view.exception';
import { FLAT_VIEW_EDITABLE_PROPERTIES } from 'src/engine/metadata-modules/view/flat-view/constants/flat-view-editable-properties.constant';
import { type FlatViewMaps } from 'src/engine/metadata-modules/view/flat-view/types/flat-view-maps.type';
import { type FlatView } from 'src/engine/metadata-modules/view/flat-view/types/flat-view.type';
import { mergeUpdateInExistingRecord } from 'src/utils/merge-update-in-existing-record.util';

export const fromUpdateViewInputToFlatViewToUpdateOrThrow = ({
  updateViewInput: rawUpdateViewInput,
  flatViewMaps,
}: {
  updateViewInput: UpdateViewInput;
  flatViewMaps: FlatViewMaps;
}): FlatView => {
  const { id: viewToUpdateId } =
    trimAndRemoveDuplicatedWhitespacesFromObjectStringProperties(
      rawUpdateViewInput,
      ['id'],
    );

  const existingFlatViewToUpdate = flatViewMaps.byId[viewToUpdateId];

  if (!isDefined(existingFlatViewToUpdate)) {
    throw new ViewException(
      t`View to update not found`,
      ViewExceptionCode.VIEW_NOT_FOUND,
    );
  }

  const updatedEditableFieldProperties = extractAndSanitizeObjectStringFields(
    rawUpdateViewInput,
    FLAT_VIEW_EDITABLE_PROPERTIES,
  );

  return mergeUpdateInExistingRecord({
    existing: existingFlatViewToUpdate,
    properties: FLAT_VIEW_EDITABLE_PROPERTIES,
    update: updatedEditableFieldProperties,
  });
};
