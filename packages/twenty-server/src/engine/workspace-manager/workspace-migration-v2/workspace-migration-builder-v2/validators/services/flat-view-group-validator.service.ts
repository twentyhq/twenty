import { Injectable } from '@nestjs/common';

import { msg, t } from '@lingui/core/macro';
import { ALL_METADATA_NAME } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { FlatViewGroup } from 'src/engine/metadata-modules/flat-view-group/types/flat-view-group.type';
import { ViewExceptionCode } from 'src/engine/metadata-modules/view/exceptions/view.exception';
import { FailedFlatEntityValidation } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/types/failed-flat-entity-validation.type';
import { FlatEntityUpdateValidationArgs } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/flat-entity-update-validation-args.type';
import { FlatEntityValidationArgs } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/flat-entity-validation-args.type';
import { fromFlatEntityPropertiesUpdatesToPartialFlatEntity } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/utils/from-flat-entity-properties-updates-to-partial-flat-entity';

@Injectable()
export class FlatViewGroupValidatorService {
  public validateFlatViewGroupUpdate({
    flatEntityId,
    flatEntityUpdates,
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
      flatViewGroupMaps: optimisticFlatViewGroupMaps,
      flatViewMaps,
    },
  }: FlatEntityUpdateValidationArgs<
    typeof ALL_METADATA_NAME.viewGroup
  >): FailedFlatEntityValidation<FlatViewGroup> {
    const validationResult: FailedFlatEntityValidation<FlatViewGroup> = {
      type: 'update_view_group',
      errors: [],
      flatEntityMinimalInformation: {
        id: flatEntityId,
      },
    };

    const existingFlatViewGroup =
      optimisticFlatViewGroupMaps.byId[flatEntityId];

    if (!isDefined(existingFlatViewGroup)) {
      validationResult.errors.push({
        code: ViewExceptionCode.INVALID_VIEW_DATA,
        message: t`View group to update not found`,
        userFriendlyMessage: msg`View group to update not found`,
      });

      return validationResult;
    }

    const updatedFlatViewGroup = {
      ...existingFlatViewGroup,
      ...fromFlatEntityPropertiesUpdatesToPartialFlatEntity({
        updates: flatEntityUpdates,
      }),
    };

    if (!isDefined(updatedFlatViewGroup.fieldValue)) {
      validationResult.errors.push({
        code: ViewExceptionCode.INVALID_VIEW_DATA,
        message: t`Field value is required`,
        userFriendlyMessage: msg`Field value is required`,
      });
    }

    validationResult.flatEntityMinimalInformation = {
      id: updatedFlatViewGroup.id,
      viewId: updatedFlatViewGroup.viewId,
    };

    const flatView = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: updatedFlatViewGroup.viewId,
      flatEntityMaps: flatViewMaps,
    });

    if (!isDefined(flatView)) {
      validationResult.errors.push({
        code: ViewExceptionCode.INVALID_VIEW_DATA,
        message: t`View group to update parent view not found`,
        userFriendlyMessage: msg`View group to update parent view not found`,
      });
    }

    return validationResult;
  }

  public validateFlatViewGroupDeletion({
    flatEntityToValidate: { id: viewGroupIdToDelete },
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
      flatViewGroupMaps: optimisticFlatViewGroupMaps,
    },
  }: FlatEntityValidationArgs<
    typeof ALL_METADATA_NAME.viewGroup
  >): FailedFlatEntityValidation<FlatViewGroup> {
    const validationResult: FailedFlatEntityValidation<FlatViewGroup> = {
      type: 'delete_view_group',
      errors: [],
      flatEntityMinimalInformation: {
        id: viewGroupIdToDelete,
      },
    };

    const existingFlatViewGroup =
      optimisticFlatViewGroupMaps.byId[viewGroupIdToDelete];

    if (!isDefined(existingFlatViewGroup)) {
      validationResult.errors.push({
        code: ViewExceptionCode.INVALID_VIEW_DATA,
        message: t`View group to delete not found`,
        userFriendlyMessage: msg`View group to delete not found`,
      });
    }

    return validationResult;
  }

  public validateFlatViewGroupCreation({
    flatEntityToValidate: flatViewGroupToValidate,
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
      flatViewGroupMaps: optimisticFlatViewGroupMaps,
      flatViewMaps,
    },
  }: FlatEntityValidationArgs<
    typeof ALL_METADATA_NAME.viewGroup
  >): FailedFlatEntityValidation<FlatViewGroup> {
    const validationResult: FailedFlatEntityValidation<FlatViewGroup> = {
      type: 'create_view_group',
      errors: [],
      flatEntityMinimalInformation: {
        id: flatViewGroupToValidate.id,
        viewId: flatViewGroupToValidate.viewId,
      },
    };

    const existingFlatViewGroup =
      optimisticFlatViewGroupMaps.byId[flatViewGroupToValidate.id];

    if (isDefined(existingFlatViewGroup)) {
      const flatViewGroupId = flatViewGroupToValidate.id;

      validationResult.errors.push({
        code: ViewExceptionCode.INVALID_VIEW_DATA,
        message: t`View group metadata with id ${flatViewGroupId} already exists`,
        userFriendlyMessage: msg`View group metadata already exists`,
      });
    }

    const flatView = flatViewMaps.byId[flatViewGroupToValidate.viewId];

    if (!isDefined(flatView)) {
      validationResult.errors.push({
        code: ViewExceptionCode.INVALID_VIEW_DATA,
        message: t`View not found`,
        userFriendlyMessage: msg`View not found`,
      });

      return validationResult;
    }

    if (!isDefined(flatViewGroupToValidate.fieldValue)) {
      validationResult.errors.push({
        code: ViewExceptionCode.INVALID_VIEW_DATA,
        message: t`Field value is required`,
        userFriendlyMessage: msg`Field value is required`,
      });
    }

    return validationResult;
  }
}
