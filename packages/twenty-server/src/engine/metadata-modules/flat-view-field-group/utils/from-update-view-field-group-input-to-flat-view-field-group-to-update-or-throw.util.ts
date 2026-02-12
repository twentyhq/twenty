import { t } from '@lingui/core/macro';
import {
  extractAndSanitizeObjectStringFields,
  isDefined,
  trimAndRemoveDuplicatedWhitespacesFromObjectStringProperties,
} from 'twenty-shared/utils';

import { FLAT_VIEW_FIELD_GROUP_EDITABLE_PROPERTIES } from 'src/engine/metadata-modules/flat-view-field-group/constants/flat-view-field-group-editable-properties.constant';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type FlatViewFieldGroupMaps } from 'src/engine/metadata-modules/flat-view-field-group/types/flat-view-field-group-maps.type';
import { type UpdateViewFieldGroupInput } from 'src/engine/metadata-modules/view-field-group/dtos/inputs/update-view-field-group.input';
import {
  ViewFieldGroupException,
  ViewFieldGroupExceptionCode,
} from 'src/engine/metadata-modules/view-field-group/exceptions/view-field-group.exception';
import { type UniversalFlatViewFieldGroup } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-view-field-group.type';
import { mergeUpdateInExistingRecord } from 'src/utils/merge-update-in-existing-record.util';

export const fromUpdateViewFieldGroupInputToFlatViewFieldGroupToUpdateOrThrow =
  ({
    updateViewFieldGroupInput: rawUpdateViewFieldGroupInput,
    flatViewFieldGroupMaps,
  }: {
    updateViewFieldGroupInput: UpdateViewFieldGroupInput;
    flatViewFieldGroupMaps: FlatViewFieldGroupMaps;
  }): UniversalFlatViewFieldGroup => {
    const { id: viewFieldGroupToUpdateId } =
      trimAndRemoveDuplicatedWhitespacesFromObjectStringProperties(
        rawUpdateViewFieldGroupInput,
        ['id'],
      );

    const existingFlatViewFieldGroupToUpdate =
      findFlatEntityByIdInFlatEntityMaps({
        flatEntityId: viewFieldGroupToUpdateId,
        flatEntityMaps: flatViewFieldGroupMaps,
      });

    if (!isDefined(existingFlatViewFieldGroupToUpdate)) {
      throw new ViewFieldGroupException(
        t`View field group to update not found`,
        ViewFieldGroupExceptionCode.VIEW_FIELD_GROUP_NOT_FOUND,
      );
    }

    const updatedEditableProperties = extractAndSanitizeObjectStringFields(
      rawUpdateViewFieldGroupInput.update,
      FLAT_VIEW_FIELD_GROUP_EDITABLE_PROPERTIES,
    );

    return mergeUpdateInExistingRecord({
      existing: existingFlatViewFieldGroupToUpdate,
      properties: FLAT_VIEW_FIELD_GROUP_EDITABLE_PROPERTIES,
      update: updatedEditableProperties,
    });
  };
