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

export type RestorePageLayoutTabInput = {
  id: string;
};

export const fromRestorePageLayoutTabInputToFlatPageLayoutTabOrThrow = ({
  restorePageLayoutTabInput,
  flatPageLayoutTabMaps,
}: {
  restorePageLayoutTabInput: RestorePageLayoutTabInput;
  flatPageLayoutTabMaps: FlatPageLayoutTabMaps;
}): FlatPageLayoutTab => {
  const { id: pageLayoutTabId } = extractAndSanitizeObjectStringFields(
    restorePageLayoutTabInput,
    ['id'],
  );

  const existingFlatPageLayoutTabToRestore =
    flatPageLayoutTabMaps.byId[pageLayoutTabId];

  if (!isDefined(existingFlatPageLayoutTabToRestore)) {
    throw new PageLayoutTabException(
      t`Page layout tab to restore not found`,
      PageLayoutTabExceptionCode.PAGE_LAYOUT_TAB_NOT_FOUND,
    );
  }

  if (!isDefined(existingFlatPageLayoutTabToRestore.deletedAt)) {
    throw new PageLayoutTabException(
      t`Page layout tab is not deleted and cannot be restored`,
      PageLayoutTabExceptionCode.INVALID_PAGE_LAYOUT_TAB_DATA,
    );
  }

  return {
    ...existingFlatPageLayoutTabToRestore,
    deletedAt: null,
  };
};
