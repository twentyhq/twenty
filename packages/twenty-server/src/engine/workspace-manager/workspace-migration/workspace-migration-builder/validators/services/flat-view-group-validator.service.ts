import { Injectable } from '@nestjs/common';

import { msg, t } from '@lingui/core/macro';
import { ALL_METADATA_NAME } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { ViewExceptionCode } from 'src/engine/metadata-modules/view/exceptions/view.exception';
import { FailedFlatEntityValidation } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/types/failed-flat-entity-validation.type';
import { getEmptyFlatEntityValidationError } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/utils/get-flat-entity-validation-error.util';
import { FlatEntityUpdateValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-update-validation-args.type';
import { UniversalFlatEntityValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-validation-args.type';

@Injectable()
export class FlatViewGroupValidatorService {
  public validateFlatViewGroupUpdate({
    universalIdentifier,
    flatEntityUpdate,
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
      flatViewGroupMaps: optimisticFlatViewGroupMaps,
      flatViewMaps,
    },
  }: FlatEntityUpdateValidationArgs<
    typeof ALL_METADATA_NAME.viewGroup
  >): FailedFlatEntityValidation<'viewGroup', 'update'> {
    const existingFlatViewGroup = findFlatEntityByUniversalIdentifier({
      universalIdentifier,
      flatEntityMaps: optimisticFlatViewGroupMaps,
    });

    const validationResult = getEmptyFlatEntityValidationError({
      flatEntityMinimalInformation: {
        universalIdentifier,
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
      viewUniversalIdentifier: updatedFlatViewGroup.viewUniversalIdentifier,
    };

    const flatView = findFlatEntityByUniversalIdentifier({
      universalIdentifier: updatedFlatViewGroup.viewUniversalIdentifier,
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
    flatEntityToValidate: { universalIdentifier },
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
      flatViewGroupMaps: optimisticFlatViewGroupMaps,
    },
  }: UniversalFlatEntityValidationArgs<
    typeof ALL_METADATA_NAME.viewGroup
  >): FailedFlatEntityValidation<'viewGroup', 'delete'> {
    const validationResult = getEmptyFlatEntityValidationError({
      flatEntityMinimalInformation: {
        universalIdentifier,
      },
      metadataName: 'viewGroup',
      type: 'delete',
    });

    const existingFlatViewGroup = findFlatEntityByUniversalIdentifier({
      universalIdentifier,
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
  }: UniversalFlatEntityValidationArgs<
    typeof ALL_METADATA_NAME.viewGroup
  >): FailedFlatEntityValidation<'viewGroup', 'create'> {
    const validationResult = getEmptyFlatEntityValidationError({
      flatEntityMinimalInformation: {
        universalIdentifier: flatViewGroupToValidate.universalIdentifier,
        viewUniversalIdentifier:
          flatViewGroupToValidate.viewUniversalIdentifier,
      },
      metadataName: 'viewGroup',
      type: 'create',
    });

    const existingFlatViewGroup = findFlatEntityByUniversalIdentifier({
      universalIdentifier: flatViewGroupToValidate.universalIdentifier,
      flatEntityMaps: optimisticFlatViewGroupMaps,
    });

    if (isDefined(existingFlatViewGroup)) {
      const flatViewGroupUniversalIdentifier =
        flatViewGroupToValidate.universalIdentifier;

      validationResult.errors.push({
        code: ViewExceptionCode.INVALID_VIEW_DATA,
        message: t`View group metadata with universal identifier ${flatViewGroupUniversalIdentifier} already exists`,
        userFriendlyMessage: msg`View group metadata already exists`,
      });
    }

    const flatView = findFlatEntityByUniversalIdentifier({
      universalIdentifier: flatViewGroupToValidate.viewUniversalIdentifier,
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
