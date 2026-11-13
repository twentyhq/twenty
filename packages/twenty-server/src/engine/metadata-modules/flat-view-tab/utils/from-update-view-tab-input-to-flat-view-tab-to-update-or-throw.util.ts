import { t } from '@lingui/core/macro';
import {
  extractAndSanitizeObjectStringFields,
  isDefined,
  trimAndRemoveDuplicatedWhitespacesFromObjectStringProperties,
} from 'twenty-shared/utils';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { FLAT_VIEW_TAB_EDITABLE_PROPERTIES } from 'src/engine/metadata-modules/flat-view-tab/constants/flat-view-tab-editable-properties.constant';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type FlatViewTab } from 'src/engine/metadata-modules/flat-view-tab/types/flat-view-tab.type';
import { type UpdateViewTabInput } from 'src/engine/metadata-modules/view-tab/dtos/inputs/update-view-tab.input';
import {
  ViewTabException,
  ViewTabExceptionCode,
} from 'src/engine/metadata-modules/view-tab/exceptions/view-tab.exception';
import { type UniversalFlatViewTab } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-view-tab.type';
import { mergeUpdateInExistingRecord } from 'src/utils/merge-update-in-existing-record.util';

export const fromUpdateViewTabInputToFlatViewTabToUpdateOrThrow = ({
  updateViewTabInput: rawUpdateViewTabInput,
  flatViewTabMaps,
}: {
  updateViewTabInput: UpdateViewTabInput;
  flatViewTabMaps: FlatEntityMaps<FlatViewTab>;
}): UniversalFlatViewTab => {
  const { id: viewTabToUpdateId, update } =
    trimAndRemoveDuplicatedWhitespacesFromObjectStringProperties(
      rawUpdateViewTabInput,
      ['id'],
    );

  const existingFlatViewTabToUpdate = findFlatEntityByIdInFlatEntityMaps({
    flatEntityId: viewTabToUpdateId,
    flatEntityMaps: flatViewTabMaps,
  });

  if (!isDefined(existingFlatViewTabToUpdate)) {
    throw new ViewTabException(
      t`View tab to update not found`,
      ViewTabExceptionCode.VIEW_TAB_NOT_FOUND,
    );
  }
  const updatedEditableGroupProperties = extractAndSanitizeObjectStringFields(
    update,
    FLAT_VIEW_TAB_EDITABLE_PROPERTIES,
  );

  return mergeUpdateInExistingRecord({
    existing: existingFlatViewTabToUpdate,
    properties: FLAT_VIEW_TAB_EDITABLE_PROPERTIES,
    update: updatedEditableGroupProperties,
  });
};
