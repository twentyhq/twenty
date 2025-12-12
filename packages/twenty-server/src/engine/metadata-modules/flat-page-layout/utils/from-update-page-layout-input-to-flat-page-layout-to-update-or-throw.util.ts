import { t } from '@lingui/core/macro';
import {
  extractAndSanitizeObjectStringFields,
  isDefined,
} from 'twenty-shared/utils';

import { FLAT_PAGE_LAYOUT_EDITABLE_PROPERTIES } from 'src/engine/metadata-modules/flat-page-layout/constants/flat-page-layout-editable-properties.constant';
import { type FlatPageLayoutMaps } from 'src/engine/metadata-modules/flat-page-layout/types/flat-page-layout-maps.type';
import { type FlatPageLayout } from 'src/engine/metadata-modules/flat-page-layout/types/flat-page-layout.type';
import { type UpdatePageLayoutInput } from 'src/engine/metadata-modules/page-layout/dtos/inputs/update-page-layout.input';
import {
  PageLayoutException,
  PageLayoutExceptionCode,
} from 'src/engine/metadata-modules/page-layout/exceptions/page-layout.exception';
import { mergeUpdateInExistingRecord } from 'src/utils/merge-update-in-existing-record.util';

export type UpdatePageLayoutInputWithId = {
  id: string;
  update: UpdatePageLayoutInput;
};

export const fromUpdatePageLayoutInputToFlatPageLayoutToUpdateOrThrow = ({
  updatePageLayoutInput: rawUpdatePageLayoutInput,
  flatPageLayoutMaps,
}: {
  updatePageLayoutInput: UpdatePageLayoutInputWithId;
  flatPageLayoutMaps: FlatPageLayoutMaps;
}): FlatPageLayout => {
  const { id: pageLayoutToUpdateId } = extractAndSanitizeObjectStringFields(
    rawUpdatePageLayoutInput,
    ['id'],
  );

  const existingFlatPageLayoutToUpdate =
    flatPageLayoutMaps.byId[pageLayoutToUpdateId];

  if (!isDefined(existingFlatPageLayoutToUpdate)) {
    throw new PageLayoutException(
      t`Page layout to update not found`,
      PageLayoutExceptionCode.PAGE_LAYOUT_NOT_FOUND,
    );
  }

  const updatedEditableFieldProperties = extractAndSanitizeObjectStringFields(
    rawUpdatePageLayoutInput.update,
    FLAT_PAGE_LAYOUT_EDITABLE_PROPERTIES,
  );

  return mergeUpdateInExistingRecord({
    existing: existingFlatPageLayoutToUpdate,
    properties: FLAT_PAGE_LAYOUT_EDITABLE_PROPERTIES,
    update: updatedEditableFieldProperties,
  });
};
