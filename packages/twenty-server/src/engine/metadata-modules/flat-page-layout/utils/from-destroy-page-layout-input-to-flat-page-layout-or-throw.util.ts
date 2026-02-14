import { t } from '@lingui/core/macro';
import {
  extractAndSanitizeObjectStringFields,
  isDefined,
} from 'twenty-shared/utils';

import { type FlatPageLayoutMaps } from 'src/engine/metadata-modules/flat-page-layout/types/flat-page-layout-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
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

  const existingFlatPageLayoutToDestroy = findFlatEntityByIdInFlatEntityMaps({
    flatEntityId: pageLayoutId,
    flatEntityMaps: flatPageLayoutMaps,
  });

  if (!isDefined(existingFlatPageLayoutToDestroy)) {
    throw new PageLayoutException(
      t`Page layout to destroy not found`,
      PageLayoutExceptionCode.PAGE_LAYOUT_NOT_FOUND,
    );
  }

  return existingFlatPageLayoutToDestroy;
};
