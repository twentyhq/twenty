import { Injectable } from '@nestjs/common';

import { msg, t } from '@lingui/core/macro';
import { ALL_METADATA_NAME } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { ViewExceptionCode } from 'src/engine/metadata-modules/view/exceptions/view.exception';
import { FailedFlatEntityValidation } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/types/failed-flat-entity-validation.type';
import { getEmptyFlatEntityValidationError } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/utils/get-flat-entity-validation-error.util';
import { FlatEntityUpdateValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/flat-entity-update-validation-args.type';
import { FlatEntityValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/flat-entity-validation-args.type';

@Injectable()
export class FlatViewGroupValidatorService {
  public validateFlatViewGroupUpdate({
    flatEntityId,
    flatEntityUpdate,
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
      flatViewGroupMaps: optimisticFlatViewGroupMaps,
      flatViewMaps,
    },
  }: FlatEntityUpdateValidationArgs<
    typeof ALL_METADATA_NAME.viewGroup
  >): FailedFlatEntityValidation<'viewGroup', 'update'> {
    const existingFlatViewGroup = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId,
      flatEntityMaps: optimisticFlatViewGroupMaps,
    });

    const validationResult = getEmptyFlatEntityValidationError({
      flatEntityMinimalInformation: {
        id: flatEntityId,
        universalIdentifier: existingFlatViewGroup?.universalIdentifier,
      },
      metadataName: 'viewGroup',
      type: 'update',
    });

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
      ...flatEntityUpdate,
    };

    if (!isDefined(updatedFlatViewGroup.fieldValue)) {
      validationResult.errors.push({
        code: ViewExceptionCode.INVALID_VIEW_DATA,
        message: t`Field value is required`,
        userFriendlyMessage: msg`Field value is required`,
      });
    }

    validationResult.flatEntityMinimalInformation = {
      ...validationResult.flatEntityMinimalInformation,
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
    flatEntityToValidate: { id: viewGroupIdToDelete, universalIdentifier },
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
      flatViewGroupMaps: optimisticFlatViewGroupMaps,
    },
  }: FlatEntityValidationArgs<
    typeof ALL_METADATA_NAME.viewGroup
  >): FailedFlatEntityValidation<'viewGroup', 'delete'> {
    const validationResult = getEmptyFlatEntityValidationError({
      flatEntityMinimalInformation: {
        id: viewGroupIdToDelete,
        universalIdentifier,
      },
      metadataName: 'viewGroup',
      type: 'delete',
    });

    const existingFlatViewGroup = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: viewGroupIdToDelete,
      flatEntityMaps: optimisticFlatViewGroupMaps,
    });

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
  >): FailedFlatEntityValidation<'viewGroup', 'create'> {
    const validationResult = getEmptyFlatEntityValidationError({
      flatEntityMinimalInformation: {
        id: flatViewGroupToValidate.id,
        universalIdentifier: flatViewGroupToValidate.universalIdentifier,
        viewId: flatViewGroupToValidate.viewId,
      },
      metadataName: 'viewGroup',
      type: 'create',
    });

    const existingFlatViewGroup = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: flatViewGroupToValidate.id,
      flatEntityMaps: optimisticFlatViewGroupMaps,
    });

    if (isDefined(existingFlatViewGroup)) {
      const flatViewGroupId = flatViewGroupToValidate.id;

      validationResult.errors.push({
        code: ViewExceptionCode.INVALID_VIEW_DATA,
        message: t`View group metadata with id ${flatViewGroupId} already exists`,
        userFriendlyMessage: msg`View group metadata already exists`,
      });
    }

    const flatView = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: flatViewGroupToValidate.viewId,
      flatEntityMaps: flatViewMaps,
    });

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
