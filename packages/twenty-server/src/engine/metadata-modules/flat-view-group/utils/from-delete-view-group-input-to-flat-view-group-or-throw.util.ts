import { t } from '@lingui/core/macro';
import {
  extractAndSanitizeObjectStringFields,
  isDefined,
} from 'twenty-shared/utils';

import { type FlatViewGroupMaps } from 'src/engine/metadata-modules/flat-view-group/types/flat-view-group-maps.type';
import { type FlatViewGroup } from 'src/engine/metadata-modules/flat-view-group/types/flat-view-group.type';
import { type DeleteViewGroupInput } from 'src/engine/metadata-modules/view-group/dtos/inputs/delete-view-group.input';
import {
  ViewGroupException,
  ViewGroupExceptionCode,
} from 'src/engine/metadata-modules/view-group/exceptions/view-group.exception';

export const fromDeleteViewGroupInputToFlatViewGroupOrThrow = ({
  deleteViewGroupInput: rawDeleteViewGroupInput,
  flatViewGroupMaps,
}: {
  deleteViewGroupInput: DeleteViewGroupInput;
  flatViewGroupMaps: FlatViewGroupMaps;
}): FlatViewGroup => {
  const { id: viewGroupId } = extractAndSanitizeObjectStringFields(
    rawDeleteViewGroupInput,
    ['id'],
  );

  const existingFlatViewGroupToDelete = flatViewGroupMaps.byId[viewGroupId];

  if (!isDefined(existingFlatViewGroupToDelete)) {
    throw new ViewGroupException(
      t`View group to delete not found`,
      ViewGroupExceptionCode.VIEW_GROUP_NOT_FOUND,
    );
  }

  return {
    ...existingFlatViewGroupToDelete,
    deletedAt: new Date().toISOString(),
  };
};
