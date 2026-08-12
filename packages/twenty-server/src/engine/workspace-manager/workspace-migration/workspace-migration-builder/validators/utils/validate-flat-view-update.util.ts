import { msg, t } from '@lingui/core/macro';
import { type ALL_METADATA_NAME } from 'twenty-shared/metadata';
import { FeatureFlagKey, ViewType } from 'twenty-shared/types';
import { getViewLayoutFromViewType, isDefined } from 'twenty-shared/utils';

import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { ViewExceptionCode } from 'src/engine/metadata-modules/view/exceptions/view.exception';
import { type UniversalFlatView } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-view.type';
import { type FailedFlatEntityValidation } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/types/failed-flat-entity-validation.type';
import { getEmptyFlatEntityValidationError } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/utils/get-flat-entity-validation-error.util';
import { type FlatEntityUpdateValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-update-validation-args.type';
import { validateCalendarFields } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/utils/validate-calendar-fields.util';
import { isAllowedKanbanMainGroupByField } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/utils/is-allowed-kanban-main-group-by-field.util';

export const validateFlatViewUpdate = ({
  universalIdentifier,
  flatEntityUpdate,
  optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
    flatViewMaps: optimisticFlatViewMaps,
    flatFieldMetadataMaps,
  },
  additionalCacheDataMaps: { featureFlagsMap },
}: FlatEntityUpdateValidationArgs<
  typeof ALL_METADATA_NAME.view
>): FailedFlatEntityValidation<'view', 'update'> => {
  const existingFlatView = findFlatEntityByUniversalIdentifier({
    universalIdentifier,
    flatEntityMaps: optimisticFlatViewMaps,
  });

  const validationResult = getEmptyFlatEntityValidationError({
    flatEntityMinimalInformation: {
      universalIdentifier,
    },
    metadataName: 'view',
    type: 'update',
  });

  if (!isDefined(existingFlatView)) {
    validationResult.errors.push({
      code: ViewExceptionCode.INVALID_VIEW_DATA,
      message: t`View not found`,
      userFriendlyMessage: msg`View not found`,
    });

    return validationResult;
  }

  const updatedFlatView: UniversalFlatView = {
    ...existingFlatView,
    ...flatEntityUpdate,
  };

  const kanbanAggregateOperationFieldMetadataUniversalIdentifierUpdate =
    flatEntityUpdate.kanbanAggregateOperationFieldMetadataUniversalIdentifier;

  if (
    isDefined(kanbanAggregateOperationFieldMetadataUniversalIdentifierUpdate) &&
    kanbanAggregateOperationFieldMetadataUniversalIdentifierUpdate !== null &&
    !isDefined(
      findFlatEntityByUniversalIdentifier({
        universalIdentifier:
          kanbanAggregateOperationFieldMetadataUniversalIdentifierUpdate,
        flatEntityMaps: flatFieldMetadataMaps,
      }),
    )
  ) {
    validationResult.errors.push({
      code: ViewExceptionCode.INVALID_VIEW_DATA,
      message: t`View kanban aggregate field metadata not found`,
      userFriendlyMessage: msg`View kanban aggregate field metadata not found`,
    });
  }

  const viewBecomesKanban =
    getViewLayoutFromViewType(updatedFlatView.type) === ViewType.KANBAN &&
    getViewLayoutFromViewType(existingFlatView.type) !== ViewType.KANBAN;

  if (viewBecomesKanban) {
    if (
      !isDefined(updatedFlatView.mainGroupByFieldMetadataUniversalIdentifier)
    ) {
      validationResult.errors.push({
        code: ViewExceptionCode.INVALID_VIEW_DATA,
        message: t`Kanban view must have a main group by field`,
        userFriendlyMessage: msg`Kanban view must have a main group by field`,
      });

      return validationResult;
    }

    const mainGroupByFieldMetadata = findFlatEntityByUniversalIdentifier({
      universalIdentifier:
        updatedFlatView.mainGroupByFieldMetadataUniversalIdentifier,
      flatEntityMaps: flatFieldMetadataMaps,
    });

    if (!isDefined(mainGroupByFieldMetadata)) {
      validationResult.errors.push({
        code: ViewExceptionCode.INVALID_VIEW_DATA,
        message: t`Kanban main group by field metadata not found`,
        userFriendlyMessage: msg`Kanban main group by field metadata not found`,
      });
    } else if (
      !isAllowedKanbanMainGroupByField({
        mainGroupByFieldMetadata,
      })
    ) {
      validationResult.errors.push({
        code: ViewExceptionCode.INVALID_VIEW_DATA,
        message: t`Kanban main group by field must be a SELECT or a many-to-one relation field`,
        userFriendlyMessage: msg`Kanban main group by field must be a select or a many-to-one relation field`,
      });
    }
  }

  const updatedMainGroupByFieldMetadataUniversalIdentifier =
    updatedFlatView.mainGroupByFieldMetadataUniversalIdentifier;

  const mainGroupByFieldMetadataIsAddedOrUpdated =
    isDefined(updatedMainGroupByFieldMetadataUniversalIdentifier) &&
    existingFlatView.mainGroupByFieldMetadataUniversalIdentifier !==
      updatedMainGroupByFieldMetadataUniversalIdentifier;

  if (mainGroupByFieldMetadataIsAddedOrUpdated && !viewBecomesKanban) {
    const mainGroupByFieldMetadata = findFlatEntityByUniversalIdentifier({
      universalIdentifier: updatedMainGroupByFieldMetadataUniversalIdentifier,
      flatEntityMaps: flatFieldMetadataMaps,
    });

    if (!isDefined(mainGroupByFieldMetadata)) {
      validationResult.errors.push({
        code: ViewExceptionCode.INVALID_VIEW_DATA,
        message: t`Kanban main group by field metadata not found`,
        userFriendlyMessage: msg`Kanban main group by field metadata not found`,
      });
    } else if (
      !isAllowedKanbanMainGroupByField({
        mainGroupByFieldMetadata,
      })
    ) {
      validationResult.errors.push({
        code: ViewExceptionCode.INVALID_VIEW_DATA,
        message: t`Kanban main group by field must be a SELECT or a many-to-one relation field`,
        userFriendlyMessage: msg`Kanban main group by field must be a select or a many-to-one relation field`,
      });
    }
  }

  validationResult.errors.push(
    ...validateCalendarFields({
      flatView: updatedFlatView,
      flatFieldMetadataMaps,
      isCalendarWeekViewEnabled:
        featureFlagsMap[FeatureFlagKey.IS_CALENDAR_WEEK_VIEW_ENABLED],
    }),
  );

  return validationResult;
};
