import { t } from '@lingui/core/macro';
import {
  extractAndSanitizeObjectStringFields,
  isDefined,
} from 'twenty-shared/utils';

import { type FlatViewMaps } from 'src/engine/metadata-modules/flat-view/types/flat-view-maps.type';
import { type FlatView } from 'src/engine/metadata-modules/flat-view/types/flat-view.type';
import { type DestroyViewInput } from 'src/engine/metadata-modules/view/dtos/inputs/destroy-view.input';
import {
  ViewException,
  ViewExceptionCode,
} from 'src/engine/metadata-modules/view/exceptions/view.exception';

export const fromDestroyViewInputToFlatViewOrThrow = ({
  destroyViewInput: rawDestroyViewInput,
  flatViewMaps,
}: {
  destroyViewInput: DestroyViewInput;
  flatViewMaps: FlatViewMaps;
}): FlatView => {
  const { id: viewId } = extractAndSanitizeObjectStringFields(
    rawDestroyViewInput,
    ['id'],
  );

  const existingFlatViewToDestroy = flatViewMaps.byId[viewId];

  if (!isDefined(existingFlatViewToDestroy)) {
    throw new ViewException(
      t`View to destroy not found`,
      ViewExceptionCode.VIEW_NOT_FOUND,
    );
  }

  return existingFlatViewToDestroy;
};
