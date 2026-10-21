import { Injectable } from '@nestjs/common';

import { msg, t } from '@lingui/core/macro';
import { ALL_METADATA_NAME } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { validateUniversalFlatEntityConditionalDisplays } from 'src/engine/metadata-modules/flat-conditional-display/utils/validate-universal-flat-entity-conditional-displays.util';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { PageLayoutTabExceptionCode } from 'src/engine/metadata-modules/page-layout-tab/exceptions/page-layout-tab.exception';
import { PageLayoutExceptionCode } from 'src/engine/metadata-modules/page-layout/exceptions/page-layout.exception';
import { type UniversalFlatPageLayoutTab } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-page-layout-tab.type';
import {
  type FailedFlatEntityValidation,
  type FlatEntityValidationError,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/types/failed-flat-entity-validation.type';
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
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps,
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
      flatEntityMaps:
        optimisticFlatEntityMapsAndRelatedFlatEntityMaps.flatPageLayoutMaps,
    });

    if (!isDefined(referencedPageLayout)) {
      validationResult.errors.push({
        code: PageLayoutExceptionCode.PAGE_LAYOUT_NOT_FOUND,
        message: t`Page layout not found`,
        userFriendlyMessage: msg`Page layout not found`,
      });
    }

    validationResult.errors.push(
      ...this.validateConditionalDisplay({
        flatPageLayoutTab,
        optimisticFlatEntityMapsAndRelatedFlatEntityMaps,
      }),
    );

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
    flatEntityUpdate,
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps,
  }: FlatEntityUpdateValidationArgs<
    typeof ALL_METADATA_NAME.pageLayoutTab
  >): FailedFlatEntityValidation<'pageLayoutTab', 'update'> {
    const fromFlatPageLayoutTab = findFlatEntityByUniversalIdentifier({
      universalIdentifier,
      flatEntityMaps:
        optimisticFlatEntityMapsAndRelatedFlatEntityMaps.flatPageLayoutTabMaps,
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

    validationResult.errors.push(
      ...this.validateConditionalDisplay({
        flatPageLayoutTab: { ...fromFlatPageLayoutTab, ...flatEntityUpdate },
        optimisticFlatEntityMapsAndRelatedFlatEntityMaps,
      }),
    );

    return validationResult;
  }

  private validateConditionalDisplay({
    flatPageLayoutTab,
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
      flatPageLayoutMaps,
      flatFieldMetadataMaps,
      flatRoleMaps,
    },
  }: {
    flatPageLayoutTab: UniversalFlatPageLayoutTab;
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: UniversalFlatEntityValidationArgs<
      typeof ALL_METADATA_NAME.pageLayoutTab
    >['optimisticFlatEntityMapsAndRelatedFlatEntityMaps'];
  }): FlatEntityValidationError[] {
    const pageLayout = findFlatEntityByUniversalIdentifier({
      universalIdentifier: flatPageLayoutTab.pageLayoutUniversalIdentifier,
      flatEntityMaps: flatPageLayoutMaps,
    });

    return validateUniversalFlatEntityConditionalDisplays({
      flatEntity: flatPageLayoutTab,
      surface: 'pageLayoutTab',
      objectMetadataUniversalIdentifier:
        pageLayout?.objectMetadataUniversalIdentifier ?? null,
      invalidDataCode: PageLayoutTabExceptionCode.INVALID_PAGE_LAYOUT_TAB_DATA,
      flatFieldMetadataMaps,
      flatRoleMaps,
    });
  }
}
