import { Injectable } from '@nestjs/common';

import { msg, t } from '@lingui/core/macro';
import { ALL_METADATA_NAME } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { ViewTabExceptionCode } from 'src/engine/metadata-modules/view-tab/exceptions/view-tab.exception';
import { FailedFlatEntityValidation } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/types/failed-flat-entity-validation.type';
import { getEmptyFlatEntityValidationError } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/utils/get-flat-entity-validation-error.util';
import { FlatEntityUpdateValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-update-validation-args.type';
import { UniversalFlatEntityValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-validation-args.type';
import { getFlatViewTabTypeErrors } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/utils/get-flat-view-tab-type-errors.util';

@Injectable()
export class FlatViewTabValidatorService {
  public validateFlatViewTabUpdate({
    universalIdentifier,
    flatEntityUpdate,
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
      flatViewTabMaps: optimisticFlatViewTabMaps,
      flatViewMaps,
    },
  }: FlatEntityUpdateValidationArgs<
    typeof ALL_METADATA_NAME.viewTab
  >): FailedFlatEntityValidation<'viewTab', 'update'> {
    const existingFlatViewTab = findFlatEntityByUniversalIdentifier({
      universalIdentifier,
      flatEntityMaps: optimisticFlatViewTabMaps,
    });

    const validationResult = getEmptyFlatEntityValidationError({
      flatEntityMinimalInformation: {
        universalIdentifier,
      },
      metadataName: 'viewTab',
      type: 'update',
    });

    if (!isDefined(existingFlatViewTab)) {
      validationResult.errors.push({
        code: ViewTabExceptionCode.VIEW_TAB_NOT_FOUND,
        message: t`View tab to update not found`,
        userFriendlyMessage: msg`View tab to update not found`,
      });

      return validationResult;
    }

    const updatedFlatViewTab = {
      ...existingFlatViewTab,
      ...flatEntityUpdate,
    };

    validationResult.flatEntityMinimalInformation = {
      ...validationResult.flatEntityMinimalInformation,
      viewUniversalIdentifier: updatedFlatViewTab.viewUniversalIdentifier,
    };

    const flatView = findFlatEntityByUniversalIdentifier({
      universalIdentifier: updatedFlatViewTab.viewUniversalIdentifier,
      flatEntityMaps: flatViewMaps,
    });

    if (!isDefined(flatView)) {
      validationResult.errors.push({
        code: ViewTabExceptionCode.VIEW_NOT_FOUND,
        message: t`View tab to update parent view not found`,
        userFriendlyMessage: msg`View tab to update parent view not found`,
      });

      return validationResult;
    }

    validationResult.errors.push(
      ...getFlatViewTabTypeErrors({
        viewTab: updatedFlatViewTab,
        flatView,
        flatViewTabMaps: optimisticFlatViewTabMaps,
      }),
    );

    return validationResult;
  }

  public validateFlatViewTabDeletion({
    flatEntityToValidate: { universalIdentifier },
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
      flatViewTabMaps: optimisticFlatViewTabMaps,
    },
  }: UniversalFlatEntityValidationArgs<
    typeof ALL_METADATA_NAME.viewTab
  >): FailedFlatEntityValidation<'viewTab', 'delete'> {
    const validationResult = getEmptyFlatEntityValidationError({
      flatEntityMinimalInformation: {
        universalIdentifier,
      },
      metadataName: 'viewTab',
      type: 'delete',
    });

    const existingFlatViewTab = findFlatEntityByUniversalIdentifier({
      universalIdentifier,
      flatEntityMaps: optimisticFlatViewTabMaps,
    });

    if (!isDefined(existingFlatViewTab)) {
      validationResult.errors.push({
        code: ViewTabExceptionCode.VIEW_TAB_NOT_FOUND,
        message: t`View tab to delete not found`,
        userFriendlyMessage: msg`View tab to delete not found`,
      });
    }

    return validationResult;
  }

  public validateFlatViewTabCreation({
    flatEntityToValidate: flatViewTabToValidate,
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
      flatViewTabMaps: optimisticFlatViewTabMaps,
      flatViewMaps,
    },
  }: UniversalFlatEntityValidationArgs<
    typeof ALL_METADATA_NAME.viewTab
  >): FailedFlatEntityValidation<'viewTab', 'create'> {
    const validationResult = getEmptyFlatEntityValidationError({
      flatEntityMinimalInformation: {
        universalIdentifier: flatViewTabToValidate.universalIdentifier,
        viewUniversalIdentifier: flatViewTabToValidate.viewUniversalIdentifier,
      },
      metadataName: 'viewTab',
      type: 'create',
    });

    const existingFlatViewTab = findFlatEntityByUniversalIdentifier({
      universalIdentifier: flatViewTabToValidate.universalIdentifier,
      flatEntityMaps: optimisticFlatViewTabMaps,
    });

    if (isDefined(existingFlatViewTab)) {
      const flatViewTabUniversalIdentifier =
        flatViewTabToValidate.universalIdentifier;

      validationResult.errors.push({
        code: ViewTabExceptionCode.INVALID_VIEW_TAB_DATA,
        message: t`View tab metadata with universal identifier ${flatViewTabUniversalIdentifier} already exists`,
        userFriendlyMessage: msg`View tab metadata already exists`,
      });
    }

    const flatView = findFlatEntityByUniversalIdentifier({
      universalIdentifier: flatViewTabToValidate.viewUniversalIdentifier,
      flatEntityMaps: flatViewMaps,
    });

    if (!isDefined(flatView)) {
      validationResult.errors.push({
        code: ViewTabExceptionCode.VIEW_NOT_FOUND,
        message: t`View not found`,
        userFriendlyMessage: msg`View not found`,
      });

      return validationResult;
    }

    validationResult.errors.push(
      ...getFlatViewTabTypeErrors({
        viewTab: flatViewTabToValidate,
        flatView,
        flatViewTabMaps: optimisticFlatViewTabMaps,
      }),
    );

    return validationResult;
  }
}
