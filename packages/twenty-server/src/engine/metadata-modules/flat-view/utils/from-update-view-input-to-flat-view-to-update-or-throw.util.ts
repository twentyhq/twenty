import { t } from '@lingui/core/macro';
import {
  extractAndSanitizeObjectStringFields,
  isDefined,
  trimAndRemoveDuplicatedWhitespacesFromObjectStringProperties,
} from 'twenty-shared/utils';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { resolveEntityRelationUniversalIdentifiers } from 'src/engine/metadata-modules/flat-entity/utils/resolve-entity-relation-universal-identifiers.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatViewGroupMaps } from 'src/engine/metadata-modules/flat-view-group/types/flat-view-group-maps.type';
import { FLAT_VIEW_EDITABLE_PROPERTIES } from 'src/engine/metadata-modules/flat-view/constants/flat-view-editable-properties.constant';
import { type FlatViewMaps } from 'src/engine/metadata-modules/flat-view/types/flat-view-maps.type';
import { fromViewOverridesToUniversalOverrides } from 'src/engine/metadata-modules/flat-view/utils/from-view-overrides-to-universal-overrides.util';
import { handleFlatViewUpdateSideEffect } from 'src/engine/metadata-modules/flat-view/utils/handle-flat-view-update-side-effect.util';
import { isCallerOverridingEntity } from 'src/engine/metadata-modules/utils/is-caller-overriding-entity.util';
import { sanitizeOverridableEntityInput } from 'src/engine/metadata-modules/utils/sanitize-overridable-entity-input.util';
import { type UpdateViewInput } from 'src/engine/metadata-modules/view/dtos/inputs/update-view.input';
import { type ViewOverrides } from 'src/engine/metadata-modules/view/entities/view.entity';
import {
  ViewException,
  ViewExceptionCode,
} from 'src/engine/metadata-modules/view/exceptions/view.exception';
import { type UniversalFlatViewGroup } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-view-group.type';
import { type UniversalFlatView } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-view.type';
import { mergeUpdateInExistingRecord } from 'src/utils/merge-update-in-existing-record.util';

export const fromUpdateViewInputToFlatViewToUpdateOrThrow = ({
  updateViewInput: rawUpdateViewInput,
  flatViewMaps,
  flatViewGroupMaps,
  flatFieldMetadataMaps,
  userWorkspaceId,
  callerApplicationUniversalIdentifier,
  workspaceCustomApplicationUniversalIdentifier,
}: {
  updateViewInput: UpdateViewInput;
  flatViewMaps: FlatViewMaps;
  flatViewGroupMaps: FlatViewGroupMaps;
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
  userWorkspaceId?: string;
  callerApplicationUniversalIdentifier: string;
  workspaceCustomApplicationUniversalIdentifier: string;
}): {
  flatViewToUpdate: UniversalFlatView;
  flatViewGroupsToDelete: UniversalFlatViewGroup[];
  flatViewGroupsToCreate: UniversalFlatViewGroup[];
} => {
  const { id: viewToUpdateId } =
    trimAndRemoveDuplicatedWhitespacesFromObjectStringProperties(
      rawUpdateViewInput,
      ['id'],
    );

  const existingFlatViewToUpdate = findFlatEntityByIdInFlatEntityMaps({
    flatEntityId: viewToUpdateId,
    flatEntityMaps: flatViewMaps,
  });

  if (!isDefined(existingFlatViewToUpdate)) {
    throw new ViewException(
      t`View to update not found`,
      ViewExceptionCode.VIEW_NOT_FOUND,
    );
  }

  const editableProperties = extractAndSanitizeObjectStringFields(
    rawUpdateViewInput,
    FLAT_VIEW_EDITABLE_PROPERTIES,
  );

  const shouldOverride = isCallerOverridingEntity({
    callerApplicationUniversalIdentifier,
    entityApplicationUniversalIdentifier:
      existingFlatViewToUpdate.applicationUniversalIdentifier,
    workspaceCustomApplicationUniversalIdentifier,
  });

  const { overrides, updatedEditableProperties } =
    sanitizeOverridableEntityInput({
      metadataName: 'view',
      existingFlatEntity: existingFlatViewToUpdate,
      updatedEditableProperties: editableProperties,
      shouldOverride,
    });

  const mergedRecord = mergeUpdateInExistingRecord({
    existing: existingFlatViewToUpdate,
    properties: [...FLAT_VIEW_EDITABLE_PROPERTIES],
    update: updatedEditableProperties,
  });

  const flatViewToUpdate = {
    ...mergedRecord,
    overrides,
  } as UniversalFlatView;

  if (
    updatedEditableProperties.kanbanAggregateOperationFieldMetadataId !==
    undefined
  ) {
    const { kanbanAggregateOperationFieldMetadataUniversalIdentifier } =
      resolveEntityRelationUniversalIdentifiers({
        metadataName: 'view',
        foreignKeyValues: {
          kanbanAggregateOperationFieldMetadataId:
            mergedRecord.kanbanAggregateOperationFieldMetadataId,
        },
        flatEntityMaps: { flatFieldMetadataMaps },
      });

    flatViewToUpdate.kanbanAggregateOperationFieldMetadataUniversalIdentifier =
      kanbanAggregateOperationFieldMetadataUniversalIdentifier;
  }

  if (updatedEditableProperties.calendarFieldMetadataId !== undefined) {
    const { calendarFieldMetadataUniversalIdentifier } =
      resolveEntityRelationUniversalIdentifiers({
        metadataName: 'view',
        foreignKeyValues: {
          calendarFieldMetadataId: mergedRecord.calendarFieldMetadataId,
        },
        flatEntityMaps: { flatFieldMetadataMaps },
      });

    flatViewToUpdate.calendarFieldMetadataUniversalIdentifier =
      calendarFieldMetadataUniversalIdentifier;
  }

  if (updatedEditableProperties.mainGroupByFieldMetadataId !== undefined) {
    const { mainGroupByFieldMetadataUniversalIdentifier } =
      resolveEntityRelationUniversalIdentifiers({
        metadataName: 'view',
        foreignKeyValues: {
          mainGroupByFieldMetadataId: mergedRecord.mainGroupByFieldMetadataId,
        },
        flatEntityMaps: { flatFieldMetadataMaps },
      });

    flatViewToUpdate.mainGroupByFieldMetadataUniversalIdentifier =
      mainGroupByFieldMetadataUniversalIdentifier;
  }

  if (isDefined(overrides)) {
    flatViewToUpdate.universalOverrides = fromViewOverridesToUniversalOverrides(
      {
        overrides: overrides as ViewOverrides,
        fieldMetadataUniversalIdentifierById:
          flatFieldMetadataMaps.universalIdentifierById,
      },
    );
  } else {
    flatViewToUpdate.universalOverrides = null;
  }

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

  const effectiveFlatViewToUpdate = {
    ...mergedRecord,
    ...((overrides as ViewOverrides | null) ?? {}),
  };

  const { flatViewGroupsToDelete, flatViewGroupsToCreate } =
    handleFlatViewUpdateSideEffect({
      fromFlatView: existingFlatViewToUpdate,
      toFlatView: effectiveFlatViewToUpdate,
      flatViewGroupMaps: flatViewGroupMaps,
      flatFieldMetadataMaps: flatFieldMetadataMaps,
    });

  return {
    flatViewToUpdate,
    flatViewGroupsToDelete,
    flatViewGroupsToCreate,
  };
};
