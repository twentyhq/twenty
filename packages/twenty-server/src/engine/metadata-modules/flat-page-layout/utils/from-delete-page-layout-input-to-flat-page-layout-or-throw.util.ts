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

export type DeletePageLayoutInput = {
  id: string;
};

export const fromDeletePageLayoutInputToFlatPageLayoutOrThrow = ({
  deletePageLayoutInput: rawDeletePageLayoutInput,
  flatPageLayoutMaps,
}: {
  deletePageLayoutInput: DeletePageLayoutInput;
  flatPageLayoutMaps: FlatPageLayoutMaps;
}): FlatPageLayout => {
  const { id: pageLayoutId } = extractAndSanitizeObjectStringFields(
    rawDeletePageLayoutInput,
    ['id'],
  );

  const existingFlatPageLayoutToDelete = flatPageLayoutMaps.byId[pageLayoutId];

  if (!isDefined(existingFlatPageLayoutToDelete)) {
    throw new PageLayoutException(
      t`Page layout to delete not found`,
      PageLayoutExceptionCode.PAGE_LAYOUT_NOT_FOUND,
    );
  }

  return {
    ...existingFlatPageLayoutToDelete,
    deletedAt: new Date().toISOString(),
  };
};
