import { Injectable } from '@nestjs/common';

import { msg, t } from '@lingui/core/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { ALL_METADATA_NAME } from 'twenty-shared/metadata';
import { FileFolder } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { ALLOWED_EXTENSIONS_BY_APPLICATION_FILE_FOLDER } from 'src/engine/core-modules/file-storage/constants/allowed-extensions-by-application-file-folder.constant';
import { hasAllowedExtension } from 'src/engine/core-modules/file-storage/utils/has-allowed-extension.util';
import { isSafeRelativePath } from 'src/engine/core-modules/file-storage/utils/is-safe-relative-path.util';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { FrontComponentExceptionCode } from 'src/engine/metadata-modules/front-component/front-component.exception';
import { type FailedFlatEntityValidation } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/types/failed-flat-entity-validation.type';
import { getEmptyFlatEntityValidationError } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/utils/get-flat-entity-validation-error.util';
import { type FlatEntityUpdateValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-update-validation-args.type';
import { type UniversalFlatEntityValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-validation-args.type';

@Injectable()
export class FlatFrontComponentValidatorService {
  public validateFlatFrontComponentCreation({
    flatEntityToValidate: flatFrontComponent,
  }: UniversalFlatEntityValidationArgs<
    typeof ALL_METADATA_NAME.frontComponent
  >): FailedFlatEntityValidation<'frontComponent', 'create'> {
    const validationResult = getEmptyFlatEntityValidationError({
      flatEntityMinimalInformation: {
        universalIdentifier: flatFrontComponent.universalIdentifier,
        name: flatFrontComponent.name,
      },
      metadataName: 'frontComponent',
      type: 'create',
    });

    if (!isNonEmptyString(flatFrontComponent.name)) {
      validationResult.errors.push({
        code: FrontComponentExceptionCode.INVALID_FRONT_COMPONENT_INPUT,
        message: t`Front component name is required`,
        userFriendlyMessage: msg`Front component name is required`,
      });
    }

    if (
      isDefined(flatFrontComponent.builtComponentPath) &&
      !isSafeRelativePath(flatFrontComponent.builtComponentPath)
    ) {
      validationResult.errors.push({
        code: FrontComponentExceptionCode.INVALID_FRONT_COMPONENT_INPUT,
        message: t`Built component path contains unsafe characters`,
        userFriendlyMessage: msg`Built component path contains unsafe characters`,
      });
    }

    if (
      isDefined(flatFrontComponent.builtComponentPath) &&
      !hasAllowedExtension({
        filePath: flatFrontComponent.builtComponentPath,
        allowedExtensions:
          ALLOWED_EXTENSIONS_BY_APPLICATION_FILE_FOLDER[
            FileFolder.BuiltFrontComponent
          ],
      })
    ) {
      validationResult.errors.push({
        code: FrontComponentExceptionCode.INVALID_FRONT_COMPONENT_INPUT,
        message: t`Built component path must have a .mjs extension`,
        userFriendlyMessage: msg`Built component path must have a .mjs extension`,
      });
    }

    if (
      isDefined(flatFrontComponent.sourceComponentPath) &&
      !isSafeRelativePath(flatFrontComponent.sourceComponentPath)
    ) {
      validationResult.errors.push({
        code: FrontComponentExceptionCode.INVALID_FRONT_COMPONENT_INPUT,
        message: t`Source component path contains unsafe characters`,
        userFriendlyMessage: msg`Source component path contains unsafe characters`,
      });
    }

    if (
      isDefined(flatFrontComponent.sourceComponentPath) &&
      !hasAllowedExtension({
        filePath: flatFrontComponent.sourceComponentPath,
        allowedExtensions:
          ALLOWED_EXTENSIONS_BY_APPLICATION_FILE_FOLDER[FileFolder.Source],
      })
    ) {
      validationResult.errors.push({
        code: FrontComponentExceptionCode.INVALID_FRONT_COMPONENT_INPUT,
        message: t`Source component path must have a .ts or .tsx extension`,
        userFriendlyMessage: msg`Source component path must have a .ts or .tsx extension`,
      });
    }

    return validationResult;
  }

  public validateFlatFrontComponentDeletion({
    flatEntityToValidate,
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
      flatFrontComponentMaps: optimisticFlatFrontComponentMaps,
    },
  }: UniversalFlatEntityValidationArgs<
    typeof ALL_METADATA_NAME.frontComponent
  >): FailedFlatEntityValidation<'frontComponent', 'delete'> {
    const validationResult = getEmptyFlatEntityValidationError({
      flatEntityMinimalInformation: {
        universalIdentifier: flatEntityToValidate.universalIdentifier,
        name: flatEntityToValidate.name,
      },
      metadataName: 'frontComponent',
      type: 'delete',
    });

    const existingFrontComponent = findFlatEntityByUniversalIdentifier({
      universalIdentifier: flatEntityToValidate.universalIdentifier,
      flatEntityMaps: optimisticFlatFrontComponentMaps,
    });

    if (!isDefined(existingFrontComponent)) {
      validationResult.errors.push({
        code: FrontComponentExceptionCode.FRONT_COMPONENT_NOT_FOUND,
        message: t`Front component not found`,
        userFriendlyMessage: msg`Front component not found`,
      });

      return validationResult;
    }

    return validationResult;
  }

  public validateFlatFrontComponentUpdate({
    universalIdentifier,
    flatEntityUpdate,
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
      flatFrontComponentMaps: optimisticFlatFrontComponentMaps,
    },
  }: FlatEntityUpdateValidationArgs<
    typeof ALL_METADATA_NAME.frontComponent
  >): FailedFlatEntityValidation<'frontComponent', 'update'> {
    const fromFlatFrontComponent = findFlatEntityByUniversalIdentifier({
      universalIdentifier,
      flatEntityMaps: optimisticFlatFrontComponentMaps,
    });

    const validationResult = getEmptyFlatEntityValidationError({
      flatEntityMinimalInformation: {
        universalIdentifier,
      },
      metadataName: 'frontComponent',
      type: 'update',
    });

    if (!isDefined(fromFlatFrontComponent)) {
      validationResult.errors.push({
        code: FrontComponentExceptionCode.FRONT_COMPONENT_NOT_FOUND,
        message: t`Front component not found`,
        userFriendlyMessage: msg`Front component not found`,
      });

      return validationResult;
    }

    if (
      isDefined(flatEntityUpdate.builtComponentPath) &&
      !isSafeRelativePath(flatEntityUpdate.builtComponentPath)
    ) {
      validationResult.errors.push({
        code: FrontComponentExceptionCode.INVALID_FRONT_COMPONENT_INPUT,
        message: t`Built component path contains unsafe characters`,
        userFriendlyMessage: msg`Built component path contains unsafe characters`,
      });
    }

    if (
      isDefined(flatEntityUpdate.builtComponentPath) &&
      !hasAllowedExtension({
        filePath: flatEntityUpdate.builtComponentPath,
        allowedExtensions:
          ALLOWED_EXTENSIONS_BY_APPLICATION_FILE_FOLDER[
            FileFolder.BuiltFrontComponent
          ],
      })
    ) {
      validationResult.errors.push({
        code: FrontComponentExceptionCode.INVALID_FRONT_COMPONENT_INPUT,
        message: t`Built component path must have a .mjs extension`,
        userFriendlyMessage: msg`Built component path must have a .mjs extension`,
      });
    }

    if (
      isDefined(flatEntityUpdate.sourceComponentPath) &&
      !isSafeRelativePath(flatEntityUpdate.sourceComponentPath)
    ) {
      validationResult.errors.push({
        code: FrontComponentExceptionCode.INVALID_FRONT_COMPONENT_INPUT,
        message: t`Source component path contains unsafe characters`,
        userFriendlyMessage: msg`Source component path contains unsafe characters`,
      });
    }

    if (
      isDefined(flatEntityUpdate.sourceComponentPath) &&
      !hasAllowedExtension({
        filePath: flatEntityUpdate.sourceComponentPath,
        allowedExtensions:
          ALLOWED_EXTENSIONS_BY_APPLICATION_FILE_FOLDER[FileFolder.Source],
      })
    ) {
      validationResult.errors.push({
        code: FrontComponentExceptionCode.INVALID_FRONT_COMPONENT_INPUT,
        message: t`Source component path must have a .ts or .tsx extension`,
        userFriendlyMessage: msg`Source component path must have a .ts or .tsx extension`,
      });
    }

    return validationResult;
  }
}
