import { t } from '@lingui/core/macro';
import {
  extractAndSanitizeObjectStringFields,
  isDefined,
  trimAndRemoveDuplicatedWhitespacesFromObjectStringProperties,
} from 'twenty-shared/utils';

import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { FLAT_VIEW_FIELD_GROUP_EDITABLE_PROPERTIES } from 'src/engine/metadata-modules/flat-view-field-group/constants/flat-view-field-group-editable-properties.constant';
import { type FlatViewFieldGroupMaps } from 'src/engine/metadata-modules/flat-view-field-group/types/flat-view-field-group-maps.type';
import { isCallerOverridingEntity } from 'src/engine/metadata-modules/utils/is-caller-overriding-entity.util';
import { sanitizeOverridableEntityInput } from 'src/engine/metadata-modules/utils/sanitize-overridable-entity-input.util';
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
    callerApplicationUniversalIdentifier,
    workspaceCustomApplicationUniversalIdentifier,
  }: {
    updateViewFieldGroupInput: UpdateViewFieldGroupInput;
    flatViewFieldGroupMaps: FlatViewFieldGroupMaps;
    callerApplicationUniversalIdentifier: string;
    workspaceCustomApplicationUniversalIdentifier: string;
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

    const editableProperties = extractAndSanitizeObjectStringFields(
      rawUpdateViewFieldGroupInput.update,
      FLAT_VIEW_FIELD_GROUP_EDITABLE_PROPERTIES,
    );

    const shouldOverride = isCallerOverridingEntity({
      callerApplicationUniversalIdentifier,
      entityApplicationUniversalIdentifier:
        existingFlatViewFieldGroupToUpdate.applicationUniversalIdentifier,
      workspaceCustomApplicationUniversalIdentifier,
    });

    const { overrides, updatedEditableProperties } =
      sanitizeOverridableEntityInput({
        metadataName: 'viewFieldGroup',
        existingFlatEntity: existingFlatViewFieldGroupToUpdate,
        updatedEditableProperties: editableProperties,
        shouldOverride,
      });

    return {
      ...mergeUpdateInExistingRecord({
        existing: existingFlatViewFieldGroupToUpdate,
        properties: [...FLAT_VIEW_FIELD_GROUP_EDITABLE_PROPERTIES],
        update: updatedEditableProperties,
      }),
      overrides,
    };
  };
