import { Injectable } from '@nestjs/common';

import { msg, t } from '@lingui/core/macro';
import { PermissionFlagType } from 'twenty-shared/constants';
import { ALL_METADATA_NAME } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { PermissionsExceptionCode } from 'src/engine/metadata-modules/permissions/permissions.exception';
import { FailedFlatEntityValidation } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/types/failed-flat-entity-validation.type';
import { getEmptyFlatEntityValidationError } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/utils/get-flat-entity-validation-error.util';
import { FlatEntityUpdateValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-update-validation-args.type';
import { UniversalFlatEntityValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-validation-args.type';
import { validateRoleBelongsToCallerApplication } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/utils/validate-role-belongs-to-caller-application.util';

@Injectable()
export class FlatPermissionFlagValidatorService {
  validateFlatPermissionFlagCreation({
    flatEntityToValidate: flatPermissionFlagToValidate,
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
      flatPermissionFlagMaps: optimisticFlatPermissionFlagMaps,
      flatRoleMaps,
    },
    buildOptions,
  }: UniversalFlatEntityValidationArgs<
    typeof ALL_METADATA_NAME.permissionFlag
  >): FailedFlatEntityValidation<'permissionFlag', 'create'> {
    const validationResult = getEmptyFlatEntityValidationError({
      flatEntityMinimalInformation: {
        universalIdentifier: flatPermissionFlagToValidate.universalIdentifier,
        roleUniversalIdentifier:
          flatPermissionFlagToValidate.roleUniversalIdentifier,
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
        code: PermissionsExceptionCode.INVALID_SETTING,
        message: t`Permission flag with universal identifier ${flatPermissionFlagToValidate.universalIdentifier} already exists`,
        userFriendlyMessage: msg`Permission flag already exists`,
      });
    }

    const referencedRole = findFlatEntityByUniversalIdentifier({
      universalIdentifier: flatPermissionFlagToValidate.roleUniversalIdentifier,
      flatEntityMaps: flatRoleMaps,
    });

    if (!isDefined(referencedRole)) {
      validationResult.errors.push({
        code: PermissionsExceptionCode.ROLE_NOT_FOUND,
        message: t`Role not found`,
        userFriendlyMessage: msg`Role not found`,
      });
    } else {
      validationResult.errors.push(
        ...validateRoleBelongsToCallerApplication({
          referencedRole,
          buildOptions,
        }),
      );

      if (!referencedRole.isEditable) {
        validationResult.errors.push({
          code: PermissionsExceptionCode.ROLE_NOT_EDITABLE,
          message: t`Role is not editable`,
          userFriendlyMessage: msg`This role cannot be modified because it is a system role. Only custom roles can be edited.`,
        });
      }
    }

    const isValidFlag =
      isDefined(flatPermissionFlagToValidate.flag) &&
      Object.values(PermissionFlagType).includes(
        flatPermissionFlagToValidate.flag,
      );

    if (!isValidFlag) {
      validationResult.errors.push({
        code: PermissionsExceptionCode.INVALID_SETTING,
        message: t`Invalid permission flag value`,
        userFriendlyMessage: msg`Invalid permission setting`,
      });
    }

    const duplicateForSameRole = Object.values(
      optimisticFlatPermissionFlagMaps.byUniversalIdentifier,
    ).filter(
      (pf) =>
        isDefined(pf) &&
        pf.roleUniversalIdentifier ===
          flatPermissionFlagToValidate.roleUniversalIdentifier &&
        pf.flag === flatPermissionFlagToValidate.flag &&
        pf.universalIdentifier !==
          flatPermissionFlagToValidate.universalIdentifier,
    );

    if (duplicateForSameRole.length > 0) {
      validationResult.errors.push({
        code: PermissionsExceptionCode.INVALID_SETTING,
        message: t`Permission flag for this role and setting already exists`,
        userFriendlyMessage: msg`This permission is already set for the role`,
      });
    }

    return validationResult;
  }

  validateFlatPermissionFlagUpdate({
    universalIdentifier,
    flatEntityUpdate,
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
      flatPermissionFlagMaps: optimisticFlatPermissionFlagMaps,
      flatRoleMaps,
    },
  }: FlatEntityUpdateValidationArgs<
    typeof ALL_METADATA_NAME.permissionFlag
  >): FailedFlatEntityValidation<'permissionFlag', 'update'> {
    const existingFlatPermissionFlag = findFlatEntityByUniversalIdentifier({
      universalIdentifier,
      flatEntityMaps: optimisticFlatPermissionFlagMaps,
    });

    const validationResult = getEmptyFlatEntityValidationError({
      flatEntityMinimalInformation: {
        universalIdentifier,
      },
      metadataName: 'permissionFlag',
      type: 'update',
    });

    if (!isDefined(existingFlatPermissionFlag)) {
      validationResult.errors.push({
        code: PermissionsExceptionCode.PERMISSION_NOT_FOUND,
        message: t`Permission flag to update not found`,
        userFriendlyMessage: msg`Permission flag not found`,
      });

      return validationResult;
    }

    const updatedFlatPermissionFlag = {
      ...existingFlatPermissionFlag,
      ...flatEntityUpdate,
    };

    const referencedRole = findFlatEntityByUniversalIdentifier({
      universalIdentifier: updatedFlatPermissionFlag.roleUniversalIdentifier,
      flatEntityMaps: flatRoleMaps,
    });

    if (!isDefined(referencedRole)) {
      validationResult.errors.push({
        code: PermissionsExceptionCode.ROLE_NOT_FOUND,
        message: t`Role not found`,
        userFriendlyMessage: msg`Role not found`,
      });
    } else if (!referencedRole.isEditable) {
      validationResult.errors.push({
        code: PermissionsExceptionCode.ROLE_NOT_EDITABLE,
        message: t`Role is not editable`,
        userFriendlyMessage: msg`This role cannot be modified because it is a system role. Only custom roles can be edited.`,
      });
    }

    if (isDefined(flatEntityUpdate.flag)) {
      const isValidFlag = Object.values(PermissionFlagType).includes(
        flatEntityUpdate.flag as PermissionFlagType,
      );

      if (!isValidFlag) {
        validationResult.errors.push({
          code: PermissionsExceptionCode.INVALID_SETTING,
          message: t`Invalid permission flag value`,
          userFriendlyMessage: msg`Invalid permission setting`,
        });
      }
    }

    const duplicateForSameRole = Object.values(
      optimisticFlatPermissionFlagMaps.byUniversalIdentifier,
    ).filter(
      (pf) =>
        isDefined(pf) &&
        pf.roleUniversalIdentifier ===
          updatedFlatPermissionFlag.roleUniversalIdentifier &&
        pf.flag === updatedFlatPermissionFlag.flag &&
        pf.universalIdentifier !== universalIdentifier,
    );

    if (duplicateForSameRole.length > 0) {
      validationResult.errors.push({
        code: PermissionsExceptionCode.INVALID_SETTING,
        message: t`Permission flag for this role and setting already exists`,
        userFriendlyMessage: msg`This permission is already set for the role`,
      });
    }

    return validationResult;
  }

  validateFlatPermissionFlagDeletion({
    flatEntityToValidate: { universalIdentifier },
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
      flatPermissionFlagMaps: optimisticFlatPermissionFlagMaps,
      flatRoleMaps,
    },
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

    const existingFlatPermissionFlag = findFlatEntityByUniversalIdentifier({
      universalIdentifier,
      flatEntityMaps: optimisticFlatPermissionFlagMaps,
    });

    if (!isDefined(existingFlatPermissionFlag)) {
      validationResult.errors.push({
        code: PermissionsExceptionCode.PERMISSION_NOT_FOUND,
        message: t`Permission flag to delete not found`,
        userFriendlyMessage: msg`Permission flag not found`,
      });
    } else {
      const referencedRole = findFlatEntityByUniversalIdentifier({
        universalIdentifier: existingFlatPermissionFlag.roleUniversalIdentifier,
        flatEntityMaps: flatRoleMaps,
      });

      if (isDefined(referencedRole) && !referencedRole.isEditable) {
        validationResult.errors.push({
          code: PermissionsExceptionCode.ROLE_NOT_EDITABLE,
          message: t`Role is not editable`,
          userFriendlyMessage: msg`This role cannot be modified because it is a system role. Only custom roles can be edited.`,
        });
      }
    }

    return validationResult;
  }
}
