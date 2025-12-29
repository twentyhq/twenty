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

export type RestorePageLayoutInput = {
  id: string;
};

export const fromRestorePageLayoutInputToFlatPageLayoutOrThrow = ({
  restorePageLayoutInput,
  flatPageLayoutMaps,
}: {
  restorePageLayoutInput: RestorePageLayoutInput;
  flatPageLayoutMaps: FlatPageLayoutMaps;
}): FlatPageLayout => {
  const { id: pageLayoutId } = extractAndSanitizeObjectStringFields(
    restorePageLayoutInput,
    ['id'],
  );

  const existingFlatPageLayoutToRestore = flatPageLayoutMaps.byId[pageLayoutId];

  if (!isDefined(existingFlatPageLayoutToRestore)) {
    throw new PageLayoutException(
      t`Page layout to restore not found`,
      PageLayoutExceptionCode.PAGE_LAYOUT_NOT_FOUND,
    );
  }

  if (!isDefined(existingFlatPageLayoutToRestore.deletedAt)) {
    throw new PageLayoutException(
      t`Page layout is not deleted and cannot be restored`,
      PageLayoutExceptionCode.INVALID_PAGE_LAYOUT_DATA,
    );
  }

  return {
    ...existingFlatPageLayoutToRestore,
    deletedAt: null,
  };
};
