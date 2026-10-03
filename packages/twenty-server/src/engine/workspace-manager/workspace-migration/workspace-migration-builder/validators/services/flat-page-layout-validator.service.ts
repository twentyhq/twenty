import { Injectable } from '@nestjs/common';

import { msg, t } from '@lingui/core/macro';
import { ALL_METADATA_NAME } from 'twenty-shared/metadata';
import { PageLayoutType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { type UniversalFlatPageLayout } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-page-layout.type';
import { type FailedFlatEntityValidation } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/types/failed-flat-entity-validation.type';
import { getEmptyFlatEntityValidationError } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/utils/get-flat-entity-validation-error.util';
import { type FlatEntityUpdateValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-update-validation-args.type';
import { type UniversalFlatEntityValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-validation-args.type';
import {
  type FlatEntityEnumPropertyRules,
  validateFlatEntityEnumProperties,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/utils/validate-flat-entity-enum-properties.util';

const PAGE_LAYOUT_EXCEPTION_CODE = {
  PAGE_LAYOUT_NOT_FOUND: 'PAGE_LAYOUT_NOT_FOUND',
  INVALID_PAGE_LAYOUT_DATA: 'INVALID_PAGE_LAYOUT_DATA',
} as const;

const FLAT_PAGE_LAYOUT_ENUM_PROPERTY_RULES = {
  type: { enumObject: PageLayoutType },
} satisfies FlatEntityEnumPropertyRules<UniversalFlatPageLayout>;

@Injectable()
export class FlatPageLayoutValidatorService {
  public validateFlatPageLayoutCreation({
    flatEntityToValidate: flatPageLayout,
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
      flatObjectMetadataMaps,
    },
  }: UniversalFlatEntityValidationArgs<
    typeof ALL_METADATA_NAME.pageLayout
  >): FailedFlatEntityValidation<'pageLayout', 'create'> {
    const validationResult = getEmptyFlatEntityValidationError({
      flatEntityMinimalInformation: {
        universalIdentifier: flatPageLayout.universalIdentifier,
        name: flatPageLayout.name,
      },
      metadataName: 'pageLayout',
      type: 'create',
    });

    validationResult.errors.push(
      ...validateFlatEntityEnumProperties({
        flatEntity: flatPageLayout,
        enumPropertyRules: FLAT_PAGE_LAYOUT_ENUM_PROPERTY_RULES,
        code: PAGE_LAYOUT_EXCEPTION_CODE.INVALID_PAGE_LAYOUT_DATA,
      }),
    );

    // Workspace-level layouts are not attached to any object
    if (isDefined(flatPageLayout.objectMetadataUniversalIdentifier)) {
      const optimisticFlatObjectMetadata = findFlatEntityByUniversalIdentifier({
        universalIdentifier: flatPageLayout.objectMetadataUniversalIdentifier,
        flatEntityMaps: flatObjectMetadataMaps,
      });

      if (!isDefined(optimisticFlatObjectMetadata)) {
        validationResult.errors.push({
          code: PAGE_LAYOUT_EXCEPTION_CODE.INVALID_PAGE_LAYOUT_DATA,
          message: t`Object metadata not found`,
          userFriendlyMessage: msg`Object metadata not found`,
        });
      }
    }

    return validationResult;
  }

  public validateFlatPageLayoutDeletion({
    flatEntityToValidate,
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
      flatPageLayoutMaps: optimisticFlatPageLayoutMaps,
    },
  }: UniversalFlatEntityValidationArgs<
    typeof ALL_METADATA_NAME.pageLayout
  >): FailedFlatEntityValidation<'pageLayout', 'delete'> {
    const validationResult = getEmptyFlatEntityValidationError({
      flatEntityMinimalInformation: {
        universalIdentifier: flatEntityToValidate.universalIdentifier,
        name: flatEntityToValidate.name,
      },
      metadataName: 'pageLayout',
      type: 'delete',
    });

    const existingPageLayout = findFlatEntityByUniversalIdentifier({
      universalIdentifier: flatEntityToValidate.universalIdentifier,
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
    universalIdentifier,
    flatEntityUpdate,
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
      flatPageLayoutMaps: optimisticFlatPageLayoutMaps,
    },
  }: FlatEntityUpdateValidationArgs<
    typeof ALL_METADATA_NAME.pageLayout
  >): FailedFlatEntityValidation<'pageLayout', 'update'> {
    const fromFlatPageLayout = findFlatEntityByUniversalIdentifier({
      universalIdentifier,
      flatEntityMaps: optimisticFlatPageLayoutMaps,
    });

    const validationResult = getEmptyFlatEntityValidationError({
      flatEntityMinimalInformation: {
        universalIdentifier,
      },
      metadataName: 'pageLayout',
      type: 'update',
    });

    if (!isDefined(fromFlatPageLayout)) {
      validationResult.errors.push({
        code: PAGE_LAYOUT_EXCEPTION_CODE.PAGE_LAYOUT_NOT_FOUND,
        message: t`Page layout not found`,
        userFriendlyMessage: msg`Page layout not found`,
      });

      return validationResult;
    }

    validationResult.errors.push(
      ...validateFlatEntityEnumProperties({
        flatEntity: flatEntityUpdate,
        enumPropertyRules: FLAT_PAGE_LAYOUT_ENUM_PROPERTY_RULES,
        code: PAGE_LAYOUT_EXCEPTION_CODE.INVALID_PAGE_LAYOUT_DATA,
      }),
    );

    return validationResult;
  }
}
