import { t } from '@lingui/core/macro';
import {
  extractAndSanitizeObjectStringFields,
  isDefined,
} from 'twenty-shared/utils';

import { type FlatViewGroupMaps } from 'src/engine/metadata-modules/flat-view-group/types/flat-view-group-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type DestroyViewGroupInput } from 'src/engine/metadata-modules/view-group/dtos/inputs/destroy-view-group.input';
import {
  ViewGroupException,
  ViewGroupExceptionCode,
} from 'src/engine/metadata-modules/view-group/exceptions/view-group.exception';
import { type UniversalFlatViewGroup } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-view-group.type';

export const fromDestroyViewGroupInputToFlatViewGroupOrThrow = ({
  destroyViewGroupInput,
  flatViewGroupMaps,
}: {
  destroyViewGroupInput: DestroyViewGroupInput;
  flatViewGroupMaps: FlatViewGroupMaps;
}): UniversalFlatViewGroup => {
  const { id: viewGroupId } = extractAndSanitizeObjectStringFields(
    destroyViewGroupInput,
    ['id'],
  );

  const existingFlatViewGroupToDestroy = findFlatEntityByIdInFlatEntityMaps({
    flatEntityId: viewGroupId,
    flatEntityMaps: flatViewGroupMaps,
  });

  if (!isDefined(existingFlatViewGroupToDestroy)) {
    throw new ViewGroupException(
      t`View group to destroy not found`,
      ViewGroupExceptionCode.VIEW_GROUP_NOT_FOUND,
    );
  }

  return existingFlatViewGroupToDestroy;
};
