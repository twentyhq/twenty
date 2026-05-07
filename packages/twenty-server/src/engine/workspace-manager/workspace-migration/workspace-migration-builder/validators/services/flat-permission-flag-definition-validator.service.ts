import { Injectable } from '@nestjs/common';

import { msg, t } from '@lingui/core/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { ALL_METADATA_NAME } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { PERMISSION_FLAG_DEFINITION_PERMISSION_TYPES } from 'src/engine/metadata-modules/permission-flag-definition/constants/permission-flag-definition-permission-type.constant';
import { PermissionFlagDefinitionExceptionCode } from 'src/engine/metadata-modules/permission-flag-definition/permission-flag-definition.exception';
import { belongsToTwentyStandardApp } from 'src/engine/metadata-modules/utils/belongs-to-twenty-standard-app.util';
import { isCallerTwentyStandardApp } from 'src/engine/metadata-modules/utils/is-caller-twenty-standard-app.util';
import { type FailedFlatEntityValidation } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/types/failed-flat-entity-validation.type';
import { getEmptyFlatEntityValidationError } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/utils/get-flat-entity-validation-error.util';
import { type FlatEntityUpdateValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-update-validation-args.type';
import { type UniversalFlatEntityValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-validation-args.type';

@Injectable()
export class FlatPermissionFlagDefinitionValidatorService {
  validateFlatPermissionFlagDefinitionCreation({
    flatEntityToValidate: flatPermissionFlagDefinitionToValidate,
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
      flatPermissionFlagDefinitionMaps:
        optimisticFlatPermissionFlagDefinitionMaps,
    },
  }: UniversalFlatEntityValidationArgs<
    typeof ALL_METADATA_NAME.permissionFlagDefinition
  >): FailedFlatEntityValidation<'permissionFlagDefinition', 'create'> {
    const validationResult = getEmptyFlatEntityValidationError({
      flatEntityMinimalInformation: {
        universalIdentifier:
          flatPermissionFlagDefinitionToValidate.universalIdentifier,
        key: flatPermissionFlagDefinitionToValidate.key,
      },
      metadataName: 'permissionFlagDefinition',
      type: 'create',
    });

    const existingByUniversalId = findFlatEntityByUniversalIdentifier({
      universalIdentifier:
        flatPermissionFlagDefinitionToValidate.universalIdentifier,
      flatEntityMaps: optimisticFlatPermissionFlagDefinitionMaps,
    });

    if (isDefined(existingByUniversalId)) {
      validationResult.errors.push({
        code: PermissionFlagDefinitionExceptionCode.PERMISSION_FLAG_DEFINITION_ALREADY_EXISTS,
        message: t`Permission flag definition with universal identifier ${flatPermissionFlagDefinitionToValidate.universalIdentifier} already exists`,
        userFriendlyMessage: msg`Permission flag definition already exists`,
      });
    }

    if (!isNonEmptyString(flatPermissionFlagDefinitionToValidate.key)) {
      validationResult.errors.push({
        code: PermissionFlagDefinitionExceptionCode.INVALID_PERMISSION_FLAG_DEFINITION_KEY,
        message: t`Permission flag definition key is required`,
        userFriendlyMessage: msg`Key is required`,
      });
    }

    const duplicateKey = Object.values(
      optimisticFlatPermissionFlagDefinitionMaps.byUniversalIdentifier,
    ).filter(
      (definition) =>
        isDefined(definition) &&
        definition.key === flatPermissionFlagDefinitionToValidate.key &&
        definition.universalIdentifier !==
          flatPermissionFlagDefinitionToValidate.universalIdentifier,
    );

    if (duplicateKey.length > 0) {
      validationResult.errors.push({
        code: PermissionFlagDefinitionExceptionCode.PERMISSION_FLAG_DEFINITION_ALREADY_EXISTS,
        message: t`Permission flag definition with key ${flatPermissionFlagDefinitionToValidate.key} already exists in this workspace`,
        userFriendlyMessage: msg`A permission flag with this key already exists`,
      });
    }

    if (
      !PERMISSION_FLAG_DEFINITION_PERMISSION_TYPES.includes(
        flatPermissionFlagDefinitionToValidate.permissionType,
      )
    ) {
      validationResult.errors.push({
        code: PermissionFlagDefinitionExceptionCode.INVALID_PERMISSION_FLAG_DEFINITION_PERMISSION_TYPE,
        message: t`Permission flag definition permission type must be 'settings' or 'tool'`,
        userFriendlyMessage: msg`Invalid permission type`,
      });
    }

    return validationResult;
  }

  validateFlatPermissionFlagDefinitionUpdate({
    universalIdentifier,
    flatEntityUpdate,
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
      flatPermissionFlagDefinitionMaps:
        optimisticFlatPermissionFlagDefinitionMaps,
    },
    buildOptions,
  }: FlatEntityUpdateValidationArgs<
    typeof ALL_METADATA_NAME.permissionFlagDefinition
  >): FailedFlatEntityValidation<'permissionFlagDefinition', 'update'> {
    const validationResult = getEmptyFlatEntityValidationError({
      flatEntityMinimalInformation: {
        universalIdentifier,
      },
      metadataName: 'permissionFlagDefinition',
      type: 'update',
    });

    const existing = findFlatEntityByUniversalIdentifier({
      universalIdentifier,
      flatEntityMaps: optimisticFlatPermissionFlagDefinitionMaps,
    });

    if (!isDefined(existing)) {
      validationResult.errors.push({
        code: PermissionFlagDefinitionExceptionCode.PERMISSION_FLAG_DEFINITION_NOT_FOUND,
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
        code: PermissionFlagDefinitionExceptionCode.PERMISSION_FLAG_DEFINITION_IS_STANDARD,
        message: t`Cannot update standard permission flag definition`,
        userFriendlyMessage: msg`Cannot update standard permission flag definition`,
      });
    }

    if (
      isDefined(flatEntityUpdate.key) &&
      flatEntityUpdate.key !== existing.key
    ) {
      validationResult.errors.push({
        code: PermissionFlagDefinitionExceptionCode.PERMISSION_FLAG_DEFINITION_KEY_IMMUTABLE,
        message: t`Permission flag definition key cannot be changed after creation`,
        userFriendlyMessage: msg`Key cannot be changed`,
      });
    }

    if (
      isDefined(flatEntityUpdate.permissionType) &&
      !PERMISSION_FLAG_DEFINITION_PERMISSION_TYPES.includes(
        flatEntityUpdate.permissionType,
      )
    ) {
      validationResult.errors.push({
        code: PermissionFlagDefinitionExceptionCode.INVALID_PERMISSION_FLAG_DEFINITION_PERMISSION_TYPE,
        message: t`Permission flag definition permission type must be 'settings' or 'tool'`,
        userFriendlyMessage: msg`Invalid permission type`,
      });
    }

    return validationResult;
  }

  validateFlatPermissionFlagDefinitionDeletion({
    flatEntityToValidate: { universalIdentifier },
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
      flatPermissionFlagDefinitionMaps:
        optimisticFlatPermissionFlagDefinitionMaps,
      flatPermissionFlagMaps: optimisticFlatPermissionFlagMaps,
    },
    buildOptions,
  }: UniversalFlatEntityValidationArgs<
    typeof ALL_METADATA_NAME.permissionFlagDefinition
  >): FailedFlatEntityValidation<'permissionFlagDefinition', 'delete'> {
    const validationResult = getEmptyFlatEntityValidationError({
      flatEntityMinimalInformation: {
        universalIdentifier,
      },
      metadataName: 'permissionFlagDefinition',
      type: 'delete',
    });

    const existing = findFlatEntityByUniversalIdentifier({
      universalIdentifier,
      flatEntityMaps: optimisticFlatPermissionFlagDefinitionMaps,
    });

    if (!isDefined(existing)) {
      validationResult.errors.push({
        code: PermissionFlagDefinitionExceptionCode.PERMISSION_FLAG_DEFINITION_NOT_FOUND,
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
        code: PermissionFlagDefinitionExceptionCode.PERMISSION_FLAG_DEFINITION_IS_STANDARD,
        message: t`Cannot delete standard permission flag definition`,
        userFriendlyMessage: msg`Cannot delete standard permission flag definition`,
      });
    }

    const isPermissionFlagDefinitionInUse = Object.values(
      optimisticFlatPermissionFlagMaps.byUniversalIdentifier,
    ).some(
      (permissionFlag) =>
        isDefined(permissionFlag) && permissionFlag.flag === existing.key,
    );

    if (isPermissionFlagDefinitionInUse) {
      validationResult.errors.push({
        code: PermissionFlagDefinitionExceptionCode.PERMISSION_FLAG_DEFINITION_IN_USE,
        message: t`Permission flag definition with key ${existing.key} is still assigned to a role`,
        userFriendlyMessage: msg`Remove this permission from all roles before deleting it`,
      });
    }

    return validationResult;
  }
}
