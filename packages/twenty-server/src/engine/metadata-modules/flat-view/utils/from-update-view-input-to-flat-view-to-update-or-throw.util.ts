import { t } from '@lingui/core/macro';
import {
  extractAndSanitizeObjectStringFields,
  isDefined,
  trimAndRemoveDuplicatedWhitespacesFromObjectStringProperties,
} from 'twenty-shared/utils';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatViewGroupMaps } from 'src/engine/metadata-modules/flat-view-group/types/flat-view-group-maps.type';
import { type FlatViewGroup } from 'src/engine/metadata-modules/flat-view-group/types/flat-view-group.type';
import { FLAT_VIEW_EDITABLE_PROPERTIES } from 'src/engine/metadata-modules/flat-view/constants/flat-view-editable-properties.constant';
import { type FlatViewMaps } from 'src/engine/metadata-modules/flat-view/types/flat-view-maps.type';
import { type FlatView } from 'src/engine/metadata-modules/flat-view/types/flat-view.type';
import { handleFlatViewUpdateSideEffect } from 'src/engine/metadata-modules/flat-view/utils/handle-flat-view-update-side-effect.util';
import { type UpdateViewInput } from 'src/engine/metadata-modules/view/dtos/inputs/update-view.input';
import {
  ViewException,
  ViewExceptionCode,
} from 'src/engine/metadata-modules/view/exceptions/view.exception';
import { mergeUpdateInExistingRecord } from 'src/utils/merge-update-in-existing-record.util';

export const fromUpdateViewInputToFlatViewToUpdateOrThrow = ({
  updateViewInput: rawUpdateViewInput,
  flatViewMaps,
  flatViewGroupMaps,
  flatFieldMetadataMaps,
  userWorkspaceId,
}: {
  updateViewInput: UpdateViewInput;
  flatViewMaps: FlatViewMaps;
  flatViewGroupMaps: FlatViewGroupMaps;
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
  userWorkspaceId?: string;
}): {
  flatViewToUpdate: FlatView;
  flatViewGroupsToDelete: FlatViewGroup[];
  flatViewGroupsToCreate: FlatViewGroup[];
} => {
  const { id: viewToUpdateId } =
    trimAndRemoveDuplicatedWhitespacesFromObjectStringProperties(
      rawUpdateViewInput,
      ['id'],
    );

  const existingFlatViewToUpdate = flatViewMaps.byId[viewToUpdateId];

  if (!isDefined(existingFlatViewToUpdate)) {
    throw new ViewException(
      t`View to update not found`,
      ViewExceptionCode.VIEW_NOT_FOUND,
    );
  }

  const updatedEditableFieldProperties = extractAndSanitizeObjectStringFields(
    rawUpdateViewInput,
    FLAT_VIEW_EDITABLE_PROPERTIES,
  );

  const flatViewToUpdate = mergeUpdateInExistingRecord({
    existing: existingFlatViewToUpdate,
    properties: FLAT_VIEW_EDITABLE_PROPERTIES,
    update: updatedEditableFieldProperties,
  });

  // If changing visibility from WORKSPACE to UNLISTED, ensure createdByUserWorkspaceId is set
  // This prevents the view from disappearing for the user making the change
  if (
    isDefined(rawUpdateViewInput.visibility) &&
    rawUpdateViewInput.visibility === 'UNLISTED' &&
    existingFlatViewToUpdate.visibility === 'WORKSPACE' &&
    isDefined(userWorkspaceId)
  ) {
    // Re-allocate the view to the current user
    flatViewToUpdate.createdByUserWorkspaceId = userWorkspaceId;
  }

  const { flatViewGroupsToDelete, flatViewGroupsToCreate } =
    handleFlatViewUpdateSideEffect({
      fromFlatView: existingFlatViewToUpdate,
      toFlatView: flatViewToUpdate,
      flatViewGroupMaps: flatViewGroupMaps,
      flatFieldMetadataMaps: flatFieldMetadataMaps,
    });

  return {
    flatViewToUpdate,
    flatViewGroupsToDelete,
    flatViewGroupsToCreate,
  };
};
