import { t } from '@lingui/core/macro';
import {
  extractAndSanitizeObjectStringFields,
  isDefined,
} from 'twenty-shared/utils';

import { type FlatViewGroupMaps } from 'src/engine/metadata-modules/flat-view-group/types/flat-view-group-maps.type';
import { type FlatViewGroup } from 'src/engine/metadata-modules/flat-view-group/types/flat-view-group.type';
import { type DestroyViewGroupInput } from 'src/engine/metadata-modules/view-group/dtos/inputs/destroy-view-group.input';
import {
  ViewGroupException,
  ViewGroupExceptionCode,
} from 'src/engine/metadata-modules/view-group/exceptions/view-group.exception';

export const fromDestroyViewGroupInputToFlatViewGroupOrThrow = ({
  destroyViewGroupInput,
  flatViewGroupMaps,
}: {
  destroyViewGroupInput: DestroyViewGroupInput;
  flatViewGroupMaps: FlatViewGroupMaps;
}): FlatViewGroup => {
  const { id: viewGroupId } = extractAndSanitizeObjectStringFields(
    destroyViewGroupInput,
    ['id'],
  );

  const existingFlatViewGroupToDestroy = flatViewGroupMaps.byId[viewGroupId];

  if (!isDefined(existingFlatViewGroupToDestroy)) {
    throw new ViewGroupException(
      t`View group to destroy not found`,
      ViewGroupExceptionCode.VIEW_GROUP_NOT_FOUND,
    );
  }

  return existingFlatViewGroupToDestroy;
};
