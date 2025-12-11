import { t } from '@lingui/core/macro';
import {
  extractAndSanitizeObjectStringFields,
  isDefined,
} from 'twenty-shared/utils';

import { type FlatPageLayoutMaps } from 'src/engine/metadata-modules/flat-page-layout/types/flat-page-layout-maps.type';
import { type FlatPageLayout } from 'src/engine/metadata-modules/flat-page-layout/types/flat-page-layout.type';
import {
  PageLayoutException,
  PageLayoutExceptionCode,
} from 'src/engine/metadata-modules/page-layout/exceptions/page-layout.exception';

export type DestroyPageLayoutInput = {
  id: string;
};

export const fromDestroyPageLayoutInputToFlatPageLayoutOrThrow = ({
  destroyPageLayoutInput,
  flatPageLayoutMaps,
}: {
  destroyPageLayoutInput: DestroyPageLayoutInput;
  flatPageLayoutMaps: FlatPageLayoutMaps;
}): FlatPageLayout => {
  const { id: pageLayoutId } = extractAndSanitizeObjectStringFields(
    destroyPageLayoutInput,
    ['id'],
  );

  const existingFlatPageLayoutToDestroy = flatPageLayoutMaps.byId[pageLayoutId];

  if (!isDefined(existingFlatPageLayoutToDestroy)) {
    throw new PageLayoutException(
      t`Page layout to destroy not found`,
      PageLayoutExceptionCode.PAGE_LAYOUT_NOT_FOUND,
    );
  }

  return existingFlatPageLayoutToDestroy;
};
