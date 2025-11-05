import { msg, t } from '@lingui/core/macro';
import { type ALL_METADATA_NAME } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type FlatView } from 'src/engine/metadata-modules/flat-view/types/flat-view.type';
import { ViewExceptionCode } from 'src/engine/metadata-modules/view/exceptions/view.exception';
import { findFlatEntityPropertyUpdate } from 'src/engine/workspace-manager/workspace-migration-v2/utils/find-flat-entity-property-update.util';
import { type FailedFlatEntityValidation } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/types/failed-flat-entity-validation.type';
import { type FlatEntityUpdateValidationArgs } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/flat-entity-update-validation-args.type';
import { type FlatEntityValidationArgs } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/flat-entity-validation-args.type';

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
  >): FailedFlatEntityValidation<FlatView> {
    const validationResult: FailedFlatEntityValidation<FlatView> = {
      type: 'update_view',
      errors: [],
      flatEntityMinimalInformation: {
        id: flatEntityId,
      },
    };

    const existingFlatView = optimisticFlatViewMaps.byId[flatEntityId];

    if (!isDefined(existingFlatView)) {
      validationResult.errors.push({
        code: ViewExceptionCode.INVALID_VIEW_DATA,
        message: t`View not found`,
        userFriendlyMessage: msg`View not found`,
      });
    }

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

    return validationResult;
  }

  public validateFlatViewDeletion({
    flatEntityToValidate: { id: viewIdToDelete },
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
      flatViewMaps: optimisticFlatViewMaps,
    },
  }: FlatEntityValidationArgs<
    typeof ALL_METADATA_NAME.view
  >): FailedFlatEntityValidation<FlatView> {
    const validationResult: FailedFlatEntityValidation<FlatView> = {
      type: 'delete_view',
      errors: [],
      flatEntityMinimalInformation: {
        id: viewIdToDelete,
      },
    };

    const existingFlatView = optimisticFlatViewMaps.byId[viewIdToDelete];

    if (!isDefined(existingFlatView)) {
      validationResult.errors.push({
        code: ViewExceptionCode.INVALID_VIEW_DATA,
        message: t`View not found`,
        userFriendlyMessage: msg`View not found`,
      });
    }

    return validationResult;
  }

  public async validateFlatViewCreation({
    flatEntityToValidate: flatViewToValidate,
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
      flatViewMaps: optimisticFlatViewMaps,
      flatFieldMetadataMaps,
      flatObjectMetadataMaps,
    },
  }: FlatEntityValidationArgs<typeof ALL_METADATA_NAME.view>): Promise<
    FailedFlatEntityValidation<FlatView>
  > {
    const validationResult: FailedFlatEntityValidation<FlatView> = {
      type: 'create_view',
      errors: [],
      flatEntityMinimalInformation: {
        id: flatViewToValidate.id,
      },
    };

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

    return validationResult;
  }
}
