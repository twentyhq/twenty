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

export type DestroyPageLayoutTabInput = {
  id: string;
};

export const fromDestroyPageLayoutTabInputToFlatPageLayoutTabOrThrow = ({
  destroyPageLayoutTabInput,
  flatPageLayoutTabMaps,
}: {
  destroyPageLayoutTabInput: DestroyPageLayoutTabInput;
  flatPageLayoutTabMaps: FlatPageLayoutTabMaps;
}): FlatPageLayoutTab => {
  const { id: pageLayoutTabId } = extractAndSanitizeObjectStringFields(
    destroyPageLayoutTabInput,
    ['id'],
  );

  const existingFlatPageLayoutTabToDestroy =
    flatPageLayoutTabMaps.byId[pageLayoutTabId];

  if (!isDefined(existingFlatPageLayoutTabToDestroy)) {
    throw new PageLayoutTabException(
      t`Page layout tab to destroy not found`,
      PageLayoutTabExceptionCode.PAGE_LAYOUT_TAB_NOT_FOUND,
    );
  }

  return existingFlatPageLayoutTabToDestroy;
};
