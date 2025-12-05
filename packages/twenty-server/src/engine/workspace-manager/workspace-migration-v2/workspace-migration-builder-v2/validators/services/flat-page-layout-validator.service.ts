import { Injectable } from '@nestjs/common';

import { msg, t } from '@lingui/core/macro';
import { type ALL_METADATA_NAME } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { type FlatPageLayout } from 'src/engine/metadata-modules/flat-page-layout/types/flat-page-layout.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type FailedFlatEntityValidation } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/types/failed-flat-entity-validation.type';
import { type FlatEntityUpdateValidationArgs } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/flat-entity-update-validation-args.type';
import { type FlatEntityValidationArgs } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/flat-entity-validation-args.type';

const PAGE_LAYOUT_EXCEPTION_CODE = {
  PAGE_LAYOUT_NOT_FOUND: 'PAGE_LAYOUT_NOT_FOUND',
} as const;

@Injectable()
export class FlatPageLayoutValidatorService {
  public validateFlatPageLayoutCreation({
    flatEntityToValidate: flatPageLayout,
  }: FlatEntityValidationArgs<
    typeof ALL_METADATA_NAME.pageLayout
  >): FailedFlatEntityValidation<FlatPageLayout> {
    const validationResult: FailedFlatEntityValidation<FlatPageLayout> = {
      type: 'create_page_layout',
      errors: [],
      flatEntityMinimalInformation: {
        id: flatPageLayout.id,
        name: flatPageLayout.name,
      },
    };

    return validationResult;
  }

  public validateFlatPageLayoutDeletion({
    flatEntityToValidate,
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
      flatPageLayoutMaps: optimisticFlatPageLayoutMaps,
    },
  }: FlatEntityValidationArgs<
    typeof ALL_METADATA_NAME.pageLayout
  >): FailedFlatEntityValidation<FlatPageLayout> {
    const validationResult: FailedFlatEntityValidation<FlatPageLayout> = {
      type: 'delete_page_layout',
      errors: [],
      flatEntityMinimalInformation: {
        id: flatEntityToValidate.id,
        name: flatEntityToValidate.name,
      },
    };

    const existingPageLayout = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: flatEntityToValidate.id,
      flatEntityMaps: optimisticFlatPageLayoutMaps,
    });

    if (!isDefined(existingPageLayout)) {
      validationResult.errors.push({
        code: PAGE_LAYOUT_EXCEPTION_CODE.PAGE_LAYOUT_NOT_FOUND,
        message: t`Page layout not found`,
        userFriendlyMessage: msg`Page layout not found`,
      });

      return validationResult;
    }

    return validationResult;
  }

  public validateFlatPageLayoutUpdate({
    flatEntityId,
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
      flatPageLayoutMaps: optimisticFlatPageLayoutMaps,
    },
  }: FlatEntityUpdateValidationArgs<
    typeof ALL_METADATA_NAME.pageLayout
  >): FailedFlatEntityValidation<FlatPageLayout> {
    const validationResult: FailedFlatEntityValidation<FlatPageLayout> = {
      type: 'update_page_layout',
      errors: [],
      flatEntityMinimalInformation: {
        id: flatEntityId,
      },
    };

    const fromFlatPageLayout = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId,
      flatEntityMaps: optimisticFlatPageLayoutMaps,
    });

    if (!isDefined(fromFlatPageLayout)) {
      validationResult.errors.push({
        code: PAGE_LAYOUT_EXCEPTION_CODE.PAGE_LAYOUT_NOT_FOUND,
        message: t`Page layout not found`,
        userFriendlyMessage: msg`Page layout not found`,
      });

      return validationResult;
    }

    return validationResult;
  }
}
