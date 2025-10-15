import { t } from '@lingui/core/macro';
import {
  extractAndSanitizeObjectStringFields,
  isDefined,
  trimAndRemoveDuplicatedWhitespacesFromObjectStringProperties,
} from 'twenty-shared/utils';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { FLAT_VIEW_GROUP_EDITABLE_PROPERTIES } from 'src/engine/metadata-modules/flat-view-group/constants/flat-view-group-editable-properties.constant';
import { type FlatViewGroup } from 'src/engine/metadata-modules/flat-view-group/types/flat-view-group.type';
import { type UpdateViewGroupInput } from 'src/engine/metadata-modules/view-group/dtos/inputs/update-view-group.input';
import {
  ViewGroupException,
  ViewGroupExceptionCode,
} from 'src/engine/metadata-modules/view-group/exceptions/view-group.exception';
import { mergeUpdateInExistingRecord } from 'src/utils/merge-update-in-existing-record.util';

export const fromUpdateViewGroupInputToFlatViewGroupToUpdateOrThrow = ({
  updateViewGroupInput: rawUpdateViewGroupInput,
  flatViewGroupMaps,
}: {
  updateViewGroupInput: UpdateViewGroupInput;
  flatViewGroupMaps: FlatEntityMaps<FlatViewGroup>;
}): FlatViewGroup => {
  const { id: viewGroupToUpdateId, update } =
    trimAndRemoveDuplicatedWhitespacesFromObjectStringProperties(
      rawUpdateViewGroupInput,
      ['id'],
    );

  const existingFlatViewGroupToUpdate =
    flatViewGroupMaps.byId[viewGroupToUpdateId];

  if (!isDefined(existingFlatViewGroupToUpdate)) {
    throw new ViewGroupException(
      t`View group to update not found`,
      ViewGroupExceptionCode.VIEW_GROUP_NOT_FOUND,
    );
  }
  const updatedEditableGroupProperties = extractAndSanitizeObjectStringFields(
    update,
    FLAT_VIEW_GROUP_EDITABLE_PROPERTIES,
  );

  return mergeUpdateInExistingRecord({
    existing: existingFlatViewGroupToUpdate,
    properties: FLAT_VIEW_GROUP_EDITABLE_PROPERTIES,
    update: updatedEditableGroupProperties,
  });
};
