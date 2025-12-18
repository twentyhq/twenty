import { t } from '@lingui/core/macro';
import {
  extractAndSanitizeObjectStringFields,
  isDefined,
} from 'twenty-shared/utils';

import { type FlatViewMaps } from 'src/engine/metadata-modules/flat-view/types/flat-view-maps.type';
import { type FlatView } from 'src/engine/metadata-modules/flat-view/types/flat-view.type';
import { type DeleteViewInput } from 'src/engine/metadata-modules/view/dtos/inputs/delete-view.input';
import {
  ViewException,
  ViewExceptionCode,
} from 'src/engine/metadata-modules/view/exceptions/view.exception';

export const fromDeleteViewInputToFlatViewOrThrow = ({
  deleteViewInput: rawDeleteViewInput,
  flatViewMaps,
}: {
  deleteViewInput: DeleteViewInput;
  flatViewMaps: FlatViewMaps;
}): FlatView => {
  const { id: viewId } = extractAndSanitizeObjectStringFields(
    rawDeleteViewInput,
    ['id'],
  );

  const existingFlatViewToDelete = flatViewMaps.byId[viewId];

  if (!isDefined(existingFlatViewToDelete)) {
    throw new ViewException(
      t`View to delete not found`,
      ViewExceptionCode.VIEW_NOT_FOUND,
    );
  }

  return {
    ...existingFlatViewToDelete,
    deletedAt: new Date().toISOString(),
  };
};
