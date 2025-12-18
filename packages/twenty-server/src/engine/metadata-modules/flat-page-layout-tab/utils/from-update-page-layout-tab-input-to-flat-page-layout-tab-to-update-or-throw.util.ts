import { t } from '@lingui/core/macro';
import {
  extractAndSanitizeObjectStringFields,
  isDefined,
} from 'twenty-shared/utils';

import { FLAT_PAGE_LAYOUT_TAB_EDITABLE_PROPERTIES } from 'src/engine/metadata-modules/flat-page-layout-tab/constants/flat-page-layout-tab-editable-properties.constant';
import { type FlatPageLayoutTabMaps } from 'src/engine/metadata-modules/flat-page-layout-tab/types/flat-page-layout-tab-maps.type';
import { type FlatPageLayoutTab } from 'src/engine/metadata-modules/flat-page-layout-tab/types/flat-page-layout-tab.type';
import { type UpdatePageLayoutTabInput } from 'src/engine/metadata-modules/page-layout-tab/dtos/inputs/update-page-layout-tab.input';
import {
  PageLayoutTabException,
  PageLayoutTabExceptionCode,
} from 'src/engine/metadata-modules/page-layout-tab/exceptions/page-layout-tab.exception';
import { mergeUpdateInExistingRecord } from 'src/utils/merge-update-in-existing-record.util';

export type UpdatePageLayoutTabInputWithId = {
  id: string;
  update: UpdatePageLayoutTabInput;
};

export const fromUpdatePageLayoutTabInputToFlatPageLayoutTabToUpdateOrThrow = ({
  updatePageLayoutTabInput: rawUpdatePageLayoutTabInput,
  flatPageLayoutTabMaps,
}: {
  updatePageLayoutTabInput: UpdatePageLayoutTabInputWithId;
  flatPageLayoutTabMaps: FlatPageLayoutTabMaps;
}): FlatPageLayoutTab => {
  const { id: pageLayoutTabToUpdateId } = extractAndSanitizeObjectStringFields(
    rawUpdatePageLayoutTabInput,
    ['id'],
  );

  const existingFlatPageLayoutTabToUpdate =
    flatPageLayoutTabMaps.byId[pageLayoutTabToUpdateId];

  if (!isDefined(existingFlatPageLayoutTabToUpdate)) {
    throw new PageLayoutTabException(
      t`Page layout tab to update not found`,
      PageLayoutTabExceptionCode.PAGE_LAYOUT_TAB_NOT_FOUND,
    );
  }

  const updatedEditableFieldProperties = extractAndSanitizeObjectStringFields(
    rawUpdatePageLayoutTabInput.update,
    FLAT_PAGE_LAYOUT_TAB_EDITABLE_PROPERTIES,
  );

  return mergeUpdateInExistingRecord({
    existing: existingFlatPageLayoutTabToUpdate,
    properties: [...FLAT_PAGE_LAYOUT_TAB_EDITABLE_PROPERTIES],
    update: updatedEditableFieldProperties,
  });
};
