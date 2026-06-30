import { Injectable } from '@nestjs/common';

import { msg, t } from '@lingui/core/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { ALL_METADATA_NAME } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { PERMISSION_FLAG_PERMISSION_TYPES } from 'src/engine/metadata-modules/permission-flag/constants/permission-flag-permission-type.constant';
import { PermissionFlagExceptionCode } from 'src/engine/metadata-modules/permission-flag/permission-flag.exception';
import { belongsToTwentyStandardApp } from 'src/engine/metadata-modules/utils/belongs-to-twenty-standard-app.util';
import { isCallerTwentyStandardApp } from 'src/engine/metadata-modules/utils/is-caller-twenty-standard-app.util';
import { type FailedFlatEntityValidation } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/types/failed-flat-entity-validation.type';
import { getEmptyFlatEntityValidationError } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/utils/get-flat-entity-validation-error.util';
import { type FlatEntityUpdateValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-update-validation-args.type';
import { type UniversalFlatEntityValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-validation-args.type';

@Injectable()
export class FlatPermissionFlagValidatorService {
  validateFlatPermissionFlagCreation({
    flatEntityToValidate: flatPermissionFlagToValidate,
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
      flatPermissionFlagMaps: optimisticFlatPermissionFlagMaps,
    },
  }: UniversalFlatEntityValidationArgs<
    typeof ALL_METADATA_NAME.permissionFlag
  >): FailedFlatEntityValidation<'permissionFlag', 'create'> {
    const validationResult = getEmptyFlatEntityValidationError({
      flatEntityMinimalInformation: {
        universalIdentifier: flatPermissionFlagToValidate.universalIdentifier,
        key: flatPermissionFlagToValidate.key,
      },
      metadataName: 'permissionFlag',
      type: 'create',
    });

    const existingByUniversalId = findFlatEntityByUniversalIdentifier({
      universalIdentifier: flatPermissionFlagToValidate.universalIdentifier,
      flatEntityMaps: optimisticFlatPermissionFlagMaps,
    });

    if (isDefined(existingByUniversalId)) {
      validationResult.errors.push({
        code: PermissionFlagExceptionCode.PERMISSION_FLAG_ALREADY_EXISTS,
        message: t`Permission flag definition with universal identifier ${flatPermissionFlagToValidate.universalIdentifier} already exists`,
        userFriendlyMessage: msg`Permission flag definition already exists`,
      });
    }

    if (!isNonEmptyString(flatPermissionFlagToValidate.key)) {
      validationResult.errors.push({
        code: PermissionFlagExceptionCode.INVALID_PERMISSION_FLAG_KEY,
        message: t`Permission flag definition key is required`,
        userFriendlyMessage: msg`Key is required`,
      });
    }

    const collidingPermissionFlag = Object.values(
      optimisticFlatPermissionFlagMaps.byUniversalIdentifier,
    ).find(
      (definition) =>
        isDefined(definition) &&
        definition.key === flatPermissionFlagToValidate.key &&
        definition.universalIdentifier !==
          flatPermissionFlagToValidate.universalIdentifier,
    );

    if (isDefined(collidingPermissionFlag)) {
      validationResult.errors.push({
        code: PermissionFlagExceptionCode.PERMISSION_FLAG_ALREADY_EXISTS,
        message: t`Permission flag definition with key "${flatPermissionFlagToValidate.key}" is already registered in this workspace.`,
        userFriendlyMessage: msg`Another application in this workspace has already registered a permission flag with this key.`,
      });
    }

    if (
      !PERMISSION_FLAG_PERMISSION_TYPES.includes(
        flatPermissionFlagToValidate.permissionType,
      )
    ) {
      validationResult.errors.push({
        code: PermissionFlagExceptionCode.INVALID_PERMISSION_FLAG_PERMISSION_TYPE,
        message: t`Permission flag definition permission type must be 'settings' or 'tool'`,
        userFriendlyMessage: msg`Invalid permission type`,
      });
    }

    return validationResult;
  }

  validateFlatPermissionFlagUpdate({
    universalIdentifier,
    flatEntityUpdate,
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
      flatPermissionFlagMaps: optimisticFlatPermissionFlagMaps,
    },
    buildOptions,
  }: FlatEntityUpdateValidationArgs<
    typeof ALL_METADATA_NAME.permissionFlag
  >): FailedFlatEntityValidation<'permissionFlag', 'update'> {
    const validationResult = getEmptyFlatEntityValidationError({
      flatEntityMinimalInformation: {
        universalIdentifier,
      },
      metadataName: 'permissionFlag',
      type: 'update',
    });

    const existing = findFlatEntityByUniversalIdentifier({
      universalIdentifier,
      flatEntityMaps: optimisticFlatPermissionFlagMaps,
    });

    if (!isDefined(existing)) {
      validationResult.errors.push({
        code: PermissionFlagExceptionCode.PERMISSION_FLAG_NOT_FOUND,
        message: t`Permission flag definition to update not found`,
        userFriendlyMessage: msg`Permission flag definition not found`,
      });

      return validationResult;
    }

    if (
      !isCallerTwentyStandardApp(buildOptions) &&
      belongsToTwentyStandardApp({
        universalIdentifier: existing.universalIdentifier,
        applicationUniversalIdentifier: existing.applicationUniversalIdentifier,
      })
    ) {
      validationResult.errors.push({
        code: PermissionFlagExceptionCode.PERMISSION_FLAG_IS_STANDARD,
        message: t`Cannot update standard permission flag definition`,
        userFriendlyMessage: msg`Cannot update standard permission flag definition`,
      });
    }

    if (
      isDefined(flatEntityUpdate.key) &&
      flatEntityUpdate.key !== existing.key
    ) {
      validationResult.errors.push({
        code: PermissionFlagExceptionCode.PERMISSION_FLAG_KEY_IMMUTABLE,
        message: t`Permission flag definition key cannot be changed after creation`,
        userFriendlyMessage: msg`Key cannot be changed`,
      });
    }

    if (
      isDefined(flatEntityUpdate.permissionType) &&
      !PERMISSION_FLAG_PERMISSION_TYPES.includes(
        flatEntityUpdate.permissionType,
      )
    ) {
      validationResult.errors.push({
        code: PermissionFlagExceptionCode.INVALID_PERMISSION_FLAG_PERMISSION_TYPE,
        message: t`Permission flag definition permission type must be 'settings' or 'tool'`,
        userFriendlyMessage: msg`Invalid permission type`,
      });
    }

    return validationResult;
  }

  validateFlatPermissionFlagDeletion({
    flatEntityToValidate: { universalIdentifier },
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
      flatPermissionFlagMaps: optimisticFlatPermissionFlagMaps,
    },
    buildOptions,
  }: UniversalFlatEntityValidationArgs<
    typeof ALL_METADATA_NAME.permissionFlag
  >): FailedFlatEntityValidation<'permissionFlag', 'delete'> {
    const validationResult = getEmptyFlatEntityValidationError({
      flatEntityMinimalInformation: {
        universalIdentifier,
      },
      metadataName: 'permissionFlag',
      type: 'delete',
    });

    const existing = findFlatEntityByUniversalIdentifier({
      universalIdentifier,
      flatEntityMaps: optimisticFlatPermissionFlagMaps,
    });

    if (!isDefined(existing)) {
      validationResult.errors.push({
        code: PermissionFlagExceptionCode.PERMISSION_FLAG_NOT_FOUND,
        message: t`Permission flag definition to delete not found`,
        userFriendlyMessage: msg`Permission flag definition not found`,
      });

      return validationResult;
    }

    if (
      !isCallerTwentyStandardApp(buildOptions) &&
      belongsToTwentyStandardApp({
        universalIdentifier: existing.universalIdentifier,
        applicationUniversalIdentifier: existing.applicationUniversalIdentifier,
      })
    ) {
      validationResult.errors.push({
        code: PermissionFlagExceptionCode.PERMISSION_FLAG_IS_STANDARD,
        message: t`Cannot delete standard permission flag definition`,
        userFriendlyMessage: msg`Cannot delete standard permission flag definition`,
      });
    }

    return validationResult;
  }
}
