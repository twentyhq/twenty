import { t } from '@lingui/core/macro';
import {
  extractAndSanitizeObjectStringFields,
  isDefined,
} from 'twenty-shared/utils';

import { type FlatPageLayoutTabMaps } from 'src/engine/metadata-modules/flat-page-layout-tab/types/flat-page-layout-tab-maps.type';
import { type FlatPageLayoutTab } from 'src/engine/metadata-modules/flat-page-layout-tab/types/flat-page-layout-tab.type';
import {
  PageLayoutTabException,
  PageLayoutTabExceptionCode,
} from 'src/engine/metadata-modules/page-layout-tab/exceptions/page-layout-tab.exception';

export type DeletePageLayoutTabInput = {
  id: string;
};

export const fromDeletePageLayoutTabInputToFlatPageLayoutTabOrThrow = ({
  deletePageLayoutTabInput: rawDeletePageLayoutTabInput,
  flatPageLayoutTabMaps,
}: {
  deletePageLayoutTabInput: DeletePageLayoutTabInput;
  flatPageLayoutTabMaps: FlatPageLayoutTabMaps;
}): FlatPageLayoutTab => {
  const { id: pageLayoutTabId } = extractAndSanitizeObjectStringFields(
    rawDeletePageLayoutTabInput,
    ['id'],
  );

  const existingFlatPageLayoutTabToDelete =
    flatPageLayoutTabMaps.byId[pageLayoutTabId];

  if (!isDefined(existingFlatPageLayoutTabToDelete)) {
    throw new PageLayoutTabException(
      t`Page layout tab to delete not found`,
      PageLayoutTabExceptionCode.PAGE_LAYOUT_TAB_NOT_FOUND,
    );
  }

  return {
    ...existingFlatPageLayoutTabToDelete,
    deletedAt: new Date().toISOString(),
  };
};
