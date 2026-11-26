import { t } from '@lingui/core/macro';
import { DEFAULT_VIEW_GROUP_LOAD_LIMIT } from 'twenty-shared/constants';
import {
  extractAndSanitizeObjectStringFields,
  isDefined,
  isNonEmptyArray,
  isViewCompactByDefault,
  trimAndRemoveDuplicatedWhitespacesFromObjectStringProperties,
} from 'twenty-shared/utils';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { resolveEntityRelationUniversalIdentifiers } from 'src/engine/metadata-modules/flat-entity/utils/resolve-entity-relation-universal-identifiers.util';
import { type FlatFieldMetadataOptionMaps } from 'src/engine/metadata-modules/flat-field-metadata-option/types/flat-field-metadata-option-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatViewGroupMaps } from 'src/engine/metadata-modules/flat-view-group/types/flat-view-group-maps.type';
import { FLAT_VIEW_EDITABLE_PROPERTIES } from 'src/engine/metadata-modules/flat-view/constants/flat-view-editable-properties.constant';
import { type FlatViewMaps } from 'src/engine/metadata-modules/flat-view/types/flat-view-maps.type';
import { fromViewOverridesToUniversalOverrides } from 'src/engine/metadata-modules/flat-view/utils/from-view-overrides-to-universal-overrides.util';
import { handleFlatViewUpdateSideEffect } from 'src/engine/metadata-modules/flat-view/utils/handle-flat-view-update-side-effect.util';
import { validateViewGroupLoadLimitOrThrow } from 'src/engine/metadata-modules/flat-view/utils/validate-view-group-load-limit-or-throw.util';
import { findInvalidTranslationOverrideProperties } from 'src/engine/metadata-modules/overrides/utils/find-invalid-translation-override-properties.util';
import { isCallerOverridingEntity } from 'src/engine/metadata-modules/overrides/utils/is-caller-overriding-entity.util';
import { mergeTranslationsIntoOverrides } from 'src/engine/metadata-modules/overrides/utils/merge-translations-into-overrides.util';
import { sanitizeOverridableEntityInput } from 'src/engine/metadata-modules/overrides/utils/sanitize-overridable-entity-input.util';
import { type UpdateViewInput } from 'src/engine/metadata-modules/view/dtos/inputs/update-view.input';
import { type ViewOverrides } from 'src/engine/metadata-modules/view/entities/view.entity';
import {
  ViewException,
  ViewExceptionCode,
} from 'src/engine/metadata-modules/view/exceptions/view.exception';
import { type UniversalFlatViewGroup } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-view-group.type';
import { type UniversalFlatView } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-view.type';
import { mergeUpdateInExistingRecord } from 'src/utils/merge-update-in-existing-record.util';
import { resolveEffectiveFlatEntity } from 'src/engine/metadata-modules/overrides/utils/resolve-effective-flat-entity.util';

export const fromUpdateViewInputToFlatViewToUpdateOrThrow = ({
  updateViewInput: rawUpdateViewInput,
  flatViewMaps,
  flatViewGroupMaps,
  flatFieldMetadataMaps,
  flatFieldMetadataOptionMaps,
  callerApplicationUniversalIdentifier,
  workspaceCustomApplicationUniversalIdentifier,
}: {
  updateViewInput: UpdateViewInput;
  flatViewMaps: FlatViewMaps;
  flatViewGroupMaps: FlatViewGroupMaps;
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
  flatFieldMetadataOptionMaps: FlatFieldMetadataOptionMaps;
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

  validateViewGroupLoadLimitOrThrow(rawUpdateViewInput.groupLoadLimit);

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

  const {
    translations: rawTranslations,
    isPrivate,
    ...updateViewInputWithoutTranslationsAndPrivacy
  } = rawUpdateViewInput;
  const translations = rawTranslations ?? [];
  const updateViewInputWithoutTranslations = {
    ...updateViewInputWithoutTranslationsAndPrivacy,
    ...(isDefined(isPrivate) && { isPrivate }),
  };

  const invalidTranslationProperties = findInvalidTranslationOverrideProperties(
    translations,
    'view',
  );

  if (isNonEmptyArray(invalidTranslationProperties)) {
    throw new ViewException(
      `Cannot translate view properties: ${invalidTranslationProperties.join(', ')}`,
      ViewExceptionCode.INVALID_VIEW_DATA,
    );
  }

  // NOT NULL column: null means the default, as on create and in manifests
  const { groupLoadLimit, ...updateViewInputWithoutGroupLoadLimit } =
    updateViewInputWithoutTranslations;

  const effectiveExistingFlatView = resolveEffectiveFlatEntity({
    metadataName: 'view',
    flatEntity: existingFlatViewToUpdate,
  });

  const { type: updatedViewType, isCompact: updatedIsCompact } =
    updateViewInputWithoutGroupLoadLimit;

  const isViewCompactDefaultChanging =
    isDefined(updatedViewType) &&
    isViewCompactByDefault(updatedViewType) !==
      isViewCompactByDefault(effectiveExistingFlatView.type);

  const editableProperties = extractAndSanitizeObjectStringFields(
    {
      ...updateViewInputWithoutGroupLoadLimit,
      ...(isViewCompactDefaultChanging &&
        !isDefined(updatedIsCompact) && {
          isCompact: isViewCompactByDefault(updatedViewType),
        }),
      ...(groupLoadLimit !== undefined && {
        groupLoadLimit: groupLoadLimit ?? DEFAULT_VIEW_GROUP_LOAD_LIMIT,
      }),
    },
    FLAT_VIEW_EDITABLE_PROPERTIES,
  );

  const shouldOverride = isCallerOverridingEntity({
    callerApplicationUniversalIdentifier,
    entityApplicationUniversalIdentifier:
      existingFlatViewToUpdate.applicationUniversalIdentifier,
    workspaceCustomApplicationUniversalIdentifier,
    isSystemSideEffect: existingFlatViewToUpdate.isSystemSideEffect,
  });

  const { overrides: sanitizedOverrides, updatedEditableProperties } =
    sanitizeOverridableEntityInput({
      metadataName: 'view',
      existingFlatEntity: existingFlatViewToUpdate,
      updatedEditableProperties: editableProperties,
      shouldOverride,
      callerApplicationUniversalIdentifier,
      workspaceCustomApplicationUniversalIdentifier,
    });

  const overrides = mergeTranslationsIntoOverrides<ViewOverrides>({
    metadataName: 'view',
    existingOverrides: sanitizedOverrides,
    translationEntries: translations,
    authorUniversalIdentifier: callerApplicationUniversalIdentifier,
    authorContext: {
      workspaceCustomApplicationUniversalIdentifier,
      ownerApplicationUniversalIdentifier:
        existingFlatViewToUpdate.applicationUniversalIdentifier,
    },
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

  if (updatedEditableProperties.calendarEndFieldMetadataId !== undefined) {
    const { calendarEndFieldMetadataUniversalIdentifier } =
      resolveEntityRelationUniversalIdentifiers({
        metadataName: 'view',
        foreignKeyValues: {
          calendarEndFieldMetadataId: mergedRecord.calendarEndFieldMetadataId,
        },
        flatEntityMaps: { flatFieldMetadataMaps },
      });

    flatViewToUpdate.calendarEndFieldMetadataUniversalIdentifier =
      calendarEndFieldMetadataUniversalIdentifier;
  }

  if (updatedEditableProperties.listDateFieldMetadataId !== undefined) {
    const { listDateFieldMetadataUniversalIdentifier } =
      resolveEntityRelationUniversalIdentifiers({
        metadataName: 'view',
        foreignKeyValues: {
          listDateFieldMetadataId: mergedRecord.listDateFieldMetadataId,
        },
        flatEntityMaps: { flatFieldMetadataMaps },
      });

    flatViewToUpdate.listDateFieldMetadataUniversalIdentifier =
      listDateFieldMetadataUniversalIdentifier;
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
        overrides,
        fieldMetadataUniversalIdentifierById:
          flatFieldMetadataMaps.universalIdentifierById,
      },
    );
  } else {
    flatViewToUpdate.universalOverrides = null;
  }

  const effectiveFlatViewToUpdate = resolveEffectiveFlatEntity({
    metadataName: 'view',
    flatEntity: { ...mergedRecord, overrides },
  });

  const { flatViewGroupsToDelete, flatViewGroupsToCreate } =
    handleFlatViewUpdateSideEffect({
      fromFlatView: effectiveExistingFlatView,
      toFlatView: effectiveFlatViewToUpdate,
      flatViewGroupMaps: flatViewGroupMaps,
      flatFieldMetadataMaps: flatFieldMetadataMaps,
      flatFieldMetadataOptionMaps,
    });

  return {
    flatViewToUpdate,
    flatViewGroupsToDelete,
    flatViewGroupsToCreate,
  };
};
