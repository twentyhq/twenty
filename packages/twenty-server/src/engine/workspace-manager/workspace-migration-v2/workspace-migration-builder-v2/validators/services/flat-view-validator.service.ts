import { msg, t } from '@lingui/core/macro';
import { type ALL_METADATA_NAME } from 'twenty-shared/metadata';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type FlatView } from 'src/engine/metadata-modules/flat-view/types/flat-view.type';
import { ViewType } from 'src/engine/metadata-modules/view/enums/view-type.enum';
import { ViewExceptionCode } from 'src/engine/metadata-modules/view/exceptions/view.exception';
import { findFlatEntityPropertyUpdate } from 'src/engine/workspace-manager/workspace-migration-v2/utils/find-flat-entity-property-update.util';
import { type FailedFlatEntityValidation } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/types/failed-flat-entity-validation.type';
import { getEmptyFlatEntityValidationError } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/utils/get-flat-entity-validation-error.util';
import { type FlatEntityUpdateValidationArgs } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/flat-entity-update-validation-args.type';
import { type FlatEntityValidationArgs } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/flat-entity-validation-args.type';
import { fromFlatEntityPropertiesUpdatesToPartialFlatEntity } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/utils/from-flat-entity-properties-updates-to-partial-flat-entity';

export class FlatViewValidatorService {
  constructor() {}

  public validateFlatViewUpdate({
    flatEntityId,
    flatEntityUpdates,
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
      flatViewMaps: optimisticFlatViewMaps,
      flatFieldMetadataMaps,
    },
  }: FlatEntityUpdateValidationArgs<
    typeof ALL_METADATA_NAME.view
  >): FailedFlatEntityValidation<'view', 'update'> {
    const existingFlatView = optimisticFlatViewMaps.byId[flatEntityId];

    const validationResult = getEmptyFlatEntityValidationError({
      flatEntityMinimalInformation: {
        id: flatEntityId,
        universalIdentifier: existingFlatView?.universalIdentifier,
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

    const partialUpdates = fromFlatEntityPropertiesUpdatesToPartialFlatEntity({
      updates: flatEntityUpdates,
    });

    const updatedFlatView: FlatView = {
      ...existingFlatView,
      ...partialUpdates,
    };

    const kanbanAggregateOperationFieldMetadataIdUpdate =
      findFlatEntityPropertyUpdate({
        property: 'kanbanAggregateOperationFieldMetadataId',
        flatEntityUpdates,
      });

    if (
      isDefined(kanbanAggregateOperationFieldMetadataIdUpdate) &&
      kanbanAggregateOperationFieldMetadataIdUpdate.to !== null &&
      !isDefined(
        findFlatEntityByIdInFlatEntityMaps({
          flatEntityId: kanbanAggregateOperationFieldMetadataIdUpdate.to,
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
      updatedFlatView.type === ViewType.KANBAN &&
      existingFlatView.type !== ViewType.KANBAN;

    if (viewBecomesKanban) {
      if (!isDefined(updatedFlatView.mainGroupByFieldMetadataId)) {
        validationResult.errors.push({
          code: ViewExceptionCode.INVALID_VIEW_DATA,
          message: t`Kanban view must have a main group by field`,
          userFriendlyMessage: msg`Kanban view must have a main group by field`,
        });

        return validationResult;
      }

      const mainGroupByFieldMetadata = findFlatEntityByIdInFlatEntityMaps({
        flatEntityId: updatedFlatView.mainGroupByFieldMetadataId,
        flatEntityMaps: flatFieldMetadataMaps,
      });

      if (!isDefined(mainGroupByFieldMetadata)) {
        validationResult.errors.push({
          code: ViewExceptionCode.INVALID_VIEW_DATA,
          message: t`Kanban main group by field metadata not found`,
          userFriendlyMessage: msg`Kanban main group by field metadata not found`,
        });
      } else if (mainGroupByFieldMetadata.type !== FieldMetadataType.SELECT) {
        validationResult.errors.push({
          code: ViewExceptionCode.INVALID_VIEW_DATA,
          message: t`Kanban main group by field must be a SELECT field`,
          userFriendlyMessage: msg`Kanban main group by field must be a select field`,
        });
      }
    }

    const updatedMainGroupByFieldMetadataId =
      updatedFlatView.mainGroupByFieldMetadataId;

    const mainGroupByFieldMetadataIsAddedOrUpdated =
      isDefined(updatedMainGroupByFieldMetadataId) &&
      existingFlatView.mainGroupByFieldMetadataId !==
        updatedMainGroupByFieldMetadataId;

    if (mainGroupByFieldMetadataIsAddedOrUpdated && !viewBecomesKanban) {
      const mainGroupByFieldMetadata = findFlatEntityByIdInFlatEntityMaps({
        flatEntityId: updatedMainGroupByFieldMetadataId,
        flatEntityMaps: flatFieldMetadataMaps,
      });

      if (!isDefined(mainGroupByFieldMetadata)) {
        validationResult.errors.push({
          code: ViewExceptionCode.INVALID_VIEW_DATA,
          message: t`Kanban main group by field metadata not found`,
          userFriendlyMessage: msg`Kanban main group by field metadata not found`,
        });
      } else if (mainGroupByFieldMetadata.type !== FieldMetadataType.SELECT) {
        validationResult.errors.push({
          code: ViewExceptionCode.INVALID_VIEW_DATA,
          message: t`Kanban main group by field must be a SELECT field`,
          userFriendlyMessage: msg`Kanban main group by field must be a select field`,
        });
      }
    }

    return validationResult;
  }

  public validateFlatViewDeletion({
    flatEntityToValidate,
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
      flatViewMaps: optimisticFlatViewMaps,
    },
  }: FlatEntityValidationArgs<
    typeof ALL_METADATA_NAME.view
  >): FailedFlatEntityValidation<'view', 'delete'> {
    const validationResult = getEmptyFlatEntityValidationError({
      flatEntityMinimalInformation: {
        id: flatEntityToValidate.id,
        universalIdentifier: flatEntityToValidate.universalIdentifier,
      },
      metadataName: 'view',
      type: 'delete',
    });

    const existingFlatView =
      optimisticFlatViewMaps.byId[flatEntityToValidate.id];

    if (!isDefined(existingFlatView)) {
      validationResult.errors.push({
        code: ViewExceptionCode.INVALID_VIEW_DATA,
        message: t`View not found`,
        userFriendlyMessage: msg`View not found`,
      });
    }

    return validationResult;
  }

  public validateFlatViewCreation({
    flatEntityToValidate: flatViewToValidate,
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
      flatViewMaps: optimisticFlatViewMaps,
      flatFieldMetadataMaps,
      flatObjectMetadataMaps,
    },
  }: FlatEntityValidationArgs<
    typeof ALL_METADATA_NAME.view
  >): FailedFlatEntityValidation<'view', 'create'> {
    const validationResult = getEmptyFlatEntityValidationError({
      flatEntityMinimalInformation: {
        id: flatViewToValidate.id,
        universalIdentifier: flatViewToValidate.universalIdentifier,
      },
      metadataName: 'view',
      type: 'create',
    });

    const optimisticFlatObjectMetadata =
      flatObjectMetadataMaps.byId[flatViewToValidate.objectMetadataId];

    if (!isDefined(optimisticFlatObjectMetadata)) {
      validationResult.errors.push({
        code: ViewExceptionCode.INVALID_VIEW_DATA,
        message: t`Object metadata not found`,
        userFriendlyMessage: msg`Object metadata not found`,
      });
    }

    if (isDefined(optimisticFlatViewMaps.byId[flatViewToValidate.id])) {
      validationResult.errors.push({
        code: ViewExceptionCode.INVALID_VIEW_DATA,
        message: t`View with same id is already exists`,
        userFriendlyMessage: msg`View already exists`,
      });
    }

    if (
      isDefined(flatViewToValidate.kanbanAggregateOperationFieldMetadataId) &&
      !isDefined(
        findFlatEntityByIdInFlatEntityMaps({
          flatEntityId:
            flatViewToValidate.kanbanAggregateOperationFieldMetadataId,
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

    const isKanban = flatViewToValidate.type === ViewType.KANBAN;

    if (isKanban) {
      if (!isDefined(flatViewToValidate.mainGroupByFieldMetadataId)) {
        validationResult.errors.push({
          code: ViewExceptionCode.INVALID_VIEW_DATA,
          message: t`Kanban view must have a main group by field`,
          userFriendlyMessage: msg`Kanban view must have a main group by field`,
        });

        return validationResult;
      }

      const mainGroupByFieldMetadata = findFlatEntityByIdInFlatEntityMaps({
        flatEntityId: flatViewToValidate.mainGroupByFieldMetadataId,
        flatEntityMaps: flatFieldMetadataMaps,
      });

      if (!isDefined(mainGroupByFieldMetadata)) {
        validationResult.errors.push({
          code: ViewExceptionCode.INVALID_VIEW_DATA,
          message: t`Kanban main group by field metadata not found`,
          userFriendlyMessage: msg`Kanban main group by field metadata not found`,
        });
      } else if (mainGroupByFieldMetadata.type !== FieldMetadataType.SELECT) {
        validationResult.errors.push({
          code: ViewExceptionCode.INVALID_VIEW_DATA,
          message: t`Kanban main group by field must be a SELECT field`,
          userFriendlyMessage: msg`Kanban main group by field must be a select field`,
        });
      }
    }

    return validationResult;
  }
}
