import { Injectable } from '@nestjs/common';

import { msg, t } from '@lingui/core/macro';
import { type ALL_METADATA_NAME } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { type FlatPageLayoutTab } from 'src/engine/metadata-modules/flat-page-layout-tab/types/flat-page-layout-tab.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type FailedFlatEntityValidation } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/types/failed-flat-entity-validation.type';
import { type FlatEntityUpdateValidationArgs } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/flat-entity-update-validation-args.type';
import { type FlatEntityValidationArgs } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/flat-entity-validation-args.type';

const PAGE_LAYOUT_TAB_EXCEPTION_CODE = {
  PAGE_LAYOUT_TAB_NOT_FOUND: 'PAGE_LAYOUT_TAB_NOT_FOUND',
} as const;

@Injectable()
export class FlatPageLayoutTabValidatorService {
  public validateFlatPageLayoutTabCreation({
    flatEntityToValidate: flatPageLayoutTab,
  }: FlatEntityValidationArgs<
    typeof ALL_METADATA_NAME.pageLayoutTab
  >): FailedFlatEntityValidation<FlatPageLayoutTab> {
    const validationResult: FailedFlatEntityValidation<FlatPageLayoutTab> = {
      type: 'create_page_layout_tab',
      errors: [],
      flatEntityMinimalInformation: {
        id: flatPageLayoutTab.id,
        title: flatPageLayoutTab.title,
      },
    };

    return validationResult;
  }

  public validateFlatPageLayoutTabDeletion({
    flatEntityToValidate,
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
      flatPageLayoutTabMaps: optimisticFlatPageLayoutTabMaps,
    },
  }: FlatEntityValidationArgs<
    typeof ALL_METADATA_NAME.pageLayoutTab
  >): FailedFlatEntityValidation<FlatPageLayoutTab> {
    const validationResult: FailedFlatEntityValidation<FlatPageLayoutTab> = {
      type: 'delete_page_layout_tab',
      errors: [],
      flatEntityMinimalInformation: {
        id: flatEntityToValidate.id,
        title: flatEntityToValidate.title,
      },
    };

    const existingPageLayoutTab = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: flatEntityToValidate.id,
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
    flatEntityId,
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
      flatPageLayoutTabMaps: optimisticFlatPageLayoutTabMaps,
    },
  }: FlatEntityUpdateValidationArgs<
    typeof ALL_METADATA_NAME.pageLayoutTab
  >): FailedFlatEntityValidation<FlatPageLayoutTab> {
    const validationResult: FailedFlatEntityValidation<FlatPageLayoutTab> = {
      type: 'update_page_layout_tab',
      errors: [],
      flatEntityMinimalInformation: {
        id: flatEntityId,
      },
    };

    const fromFlatPageLayoutTab = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId,
      flatEntityMaps: optimisticFlatPageLayoutTabMaps,
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
