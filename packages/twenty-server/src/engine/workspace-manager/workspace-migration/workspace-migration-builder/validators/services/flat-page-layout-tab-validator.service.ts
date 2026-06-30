import { Injectable } from '@nestjs/common';

import { msg, t } from '@lingui/core/macro';
import { ALL_METADATA_NAME } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { PageLayoutExceptionCode } from 'src/engine/metadata-modules/page-layout/exceptions/page-layout.exception';
import { type FailedFlatEntityValidation } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/types/failed-flat-entity-validation.type';
import { getEmptyFlatEntityValidationError } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/utils/get-flat-entity-validation-error.util';
import { type FlatEntityUpdateValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-update-validation-args.type';
import { UniversalFlatEntityValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-validation-args.type';

const PAGE_LAYOUT_TAB_EXCEPTION_CODE = {
  PAGE_LAYOUT_TAB_NOT_FOUND: 'PAGE_LAYOUT_TAB_NOT_FOUND',
} as const;

@Injectable()
export class FlatPageLayoutTabValidatorService {
  public validateFlatPageLayoutTabCreation({
    flatEntityToValidate: flatPageLayoutTab,
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: { flatPageLayoutMaps },
  }: UniversalFlatEntityValidationArgs<
    typeof ALL_METADATA_NAME.pageLayoutTab
  >): FailedFlatEntityValidation<'pageLayoutTab', 'create'> {
    const validationResult = getEmptyFlatEntityValidationError({
      flatEntityMinimalInformation: {
        universalIdentifier: flatPageLayoutTab.universalIdentifier,
        title: flatPageLayoutTab.title,
      },
      metadataName: 'pageLayoutTab',
      type: 'create',
    });

    const referencedPageLayout = findFlatEntityByUniversalIdentifier({
      universalIdentifier: flatPageLayoutTab.pageLayoutUniversalIdentifier,
      flatEntityMaps: flatPageLayoutMaps,
    });

    if (!isDefined(referencedPageLayout)) {
      validationResult.errors.push({
        code: PageLayoutExceptionCode.PAGE_LAYOUT_NOT_FOUND,
        message: t`Page layout not found`,
        userFriendlyMessage: msg`Page layout not found`,
      });
    }

    return validationResult;
  }

  public validateFlatPageLayoutTabDeletion({
    flatEntityToValidate,
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
      flatPageLayoutTabMaps: optimisticFlatPageLayoutTabMaps,
    },
  }: UniversalFlatEntityValidationArgs<
    typeof ALL_METADATA_NAME.pageLayoutTab
  >): FailedFlatEntityValidation<'pageLayoutTab', 'delete'> {
    const validationResult = getEmptyFlatEntityValidationError({
      flatEntityMinimalInformation: {
        universalIdentifier: flatEntityToValidate.universalIdentifier,
        title: flatEntityToValidate.title,
      },
      metadataName: 'pageLayoutTab',
      type: 'delete',
    });

    const existingPageLayoutTab = findFlatEntityByUniversalIdentifier({
      universalIdentifier: flatEntityToValidate.universalIdentifier,
      flatEntityMaps: optimisticFlatPageLayoutTabMaps,
    });

    if (!isDefined(existingPageLayoutTab)) {
      validationResult.errors.push({
        code: PAGE_LAYOUT_TAB_EXCEPTION_CODE.PAGE_LAYOUT_TAB_NOT_FOUND,
        message: t`Page layout tab not found`,
        userFriendlyMessage: msg`Page layout tab not found`,
      });

      return validationResult;
    }

    return validationResult;
  }

  public validateFlatPageLayoutTabUpdate({
    universalIdentifier,
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
      flatPageLayoutTabMaps: optimisticFlatPageLayoutTabMaps,
    },
  }: FlatEntityUpdateValidationArgs<
    typeof ALL_METADATA_NAME.pageLayoutTab
  >): FailedFlatEntityValidation<'pageLayoutTab', 'update'> {
    const fromFlatPageLayoutTab = findFlatEntityByUniversalIdentifier({
      universalIdentifier,
      flatEntityMaps: optimisticFlatPageLayoutTabMaps,
    });

    const validationResult = getEmptyFlatEntityValidationError({
      flatEntityMinimalInformation: {
        universalIdentifier,
      },
      metadataName: 'pageLayoutTab',
      type: 'update',
    });

    if (!isDefined(fromFlatPageLayoutTab)) {
      validationResult.errors.push({
        code: PAGE_LAYOUT_TAB_EXCEPTION_CODE.PAGE_LAYOUT_TAB_NOT_FOUND,
        message: t`Page layout tab not found`,
        userFriendlyMessage: msg`Page layout tab not found`,
      });

      return validationResult;
    }

    return validationResult;
  }
}
