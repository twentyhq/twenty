import { msg, t } from '@lingui/core/macro';
import { type ALL_METADATA_NAME } from 'twenty-shared/metadata';
import { FeatureFlagKey, ViewType } from 'twenty-shared/types';
import { getViewLayoutFromViewType, isDefined } from 'twenty-shared/utils';

import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { ViewExceptionCode } from 'src/engine/metadata-modules/view/exceptions/view.exception';
import { type FailedFlatEntityValidation } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/types/failed-flat-entity-validation.type';
import { getEmptyFlatEntityValidationError } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/utils/get-flat-entity-validation-error.util';
import { type UniversalFlatEntityValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-validation-args.type';
import { validateCalendarFields } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/utils/validate-calendar-fields.util';
import { isAllowedKanbanMainGroupByField } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/utils/is-allowed-kanban-main-group-by-field.util';

export const validateFlatViewCreation = ({
  flatEntityToValidate: flatViewToValidate,
  optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
    flatViewMaps: optimisticFlatViewMaps,
    flatFieldMetadataMaps,
    flatObjectMetadataMaps,
  },
  additionalCacheDataMaps: { featureFlagsMap },
}: UniversalFlatEntityValidationArgs<
  typeof ALL_METADATA_NAME.view
>): FailedFlatEntityValidation<'view', 'create'> => {
  const validationResult = getEmptyFlatEntityValidationError({
    flatEntityMinimalInformation: {
      universalIdentifier: flatViewToValidate.universalIdentifier,
    },
    metadataName: 'view',
    type: 'create',
  });

  const optimisticFlatObjectMetadata = findFlatEntityByUniversalIdentifier({
    universalIdentifier: flatViewToValidate.objectMetadataUniversalIdentifier,
    flatEntityMaps: flatObjectMetadataMaps,
  });

  if (!isDefined(optimisticFlatObjectMetadata)) {
    validationResult.errors.push({
      code: ViewExceptionCode.INVALID_VIEW_DATA,
      message: t`Object metadata not found`,
      userFriendlyMessage: msg`Object metadata not found`,
    });
  }

  if (
    isDefined(
      findFlatEntityByUniversalIdentifier({
        universalIdentifier: flatViewToValidate.universalIdentifier,
        flatEntityMaps: optimisticFlatViewMaps,
      }),
    )
  ) {
    validationResult.errors.push({
      code: ViewExceptionCode.INVALID_VIEW_DATA,
      message: t`View with same universal identifier already exists`,
      userFriendlyMessage: msg`View already exists`,
    });
  }

  // Every ViewKey value is reserved for an engine-owned singleton view per
  // object (INDEX table view, FIELDS_WIDGET record-page view).
  const reservedViewKey = flatViewToValidate.key;

  if (isDefined(reservedViewKey)) {
    if (flatViewToValidate.isSystemSideEffect !== true) {
      validationResult.errors.push({
        code: ViewExceptionCode.INVALID_VIEW_DATA,
        message: t`The ${reservedViewKey} view key is reserved for the engine-owned default view; remove the key from the view definition`,
        userFriendlyMessage: msg`The ${reservedViewKey} view key is reserved for the default view`,
      });
    }

    const objectAlreadyHasFlatViewWithSameKey =
      isDefined(optimisticFlatObjectMetadata) &&
      optimisticFlatObjectMetadata.viewUniversalIdentifiers.some(
        (viewUniversalIdentifier) => {
          const flatView = findFlatEntityByUniversalIdentifier({
            universalIdentifier: viewUniversalIdentifier,
            flatEntityMaps: optimisticFlatViewMaps,
          });

          return (
            isDefined(flatView) &&
            flatView.key === reservedViewKey &&
            !isDefined(flatView.deletedAt)
          );
        },
      );

    if (objectAlreadyHasFlatViewWithSameKey) {
      validationResult.errors.push({
        code: ViewExceptionCode.INVALID_VIEW_DATA,
        message: t`Object already has a view with the ${reservedViewKey} key`,
        userFriendlyMessage: msg`This object already has a default view`,
      });
    }
  }

  if (
    isDefined(
      flatViewToValidate.kanbanAggregateOperationFieldMetadataUniversalIdentifier,
    ) &&
    !isDefined(
      findFlatEntityByUniversalIdentifier({
        universalIdentifier:
          flatViewToValidate.kanbanAggregateOperationFieldMetadataUniversalIdentifier,
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

  const isKanban =
    getViewLayoutFromViewType(flatViewToValidate.type) === ViewType.KANBAN;

  if (isKanban) {
    if (
      !isDefined(flatViewToValidate.mainGroupByFieldMetadataUniversalIdentifier)
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
        flatViewToValidate.mainGroupByFieldMetadataUniversalIdentifier,
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
      flatView: flatViewToValidate,
      flatFieldMetadataMaps,
      isCalendarWeekViewEnabled:
        featureFlagsMap[FeatureFlagKey.IS_CALENDAR_WEEK_VIEW_ENABLED],
    }),
  );

  return validationResult;
};
