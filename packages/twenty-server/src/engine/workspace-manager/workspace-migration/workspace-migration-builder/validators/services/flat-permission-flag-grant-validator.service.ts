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
export class FlatPermissionFlagGrantValidatorService {
  validateFlatPermissionFlagGrantCreation({
    flatEntityToValidate: flatPermissionFlagGrantToValidate,
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
      flatPermissionFlagGrantMaps: optimisticFlatPermissionFlagGrantMaps,
      flatRoleMaps,
    },
    buildOptions,
  }: UniversalFlatEntityValidationArgs<
    typeof ALL_METADATA_NAME.permissionFlagGrant
  >): FailedFlatEntityValidation<'permissionFlagGrant', 'create'> {
    const validationResult = getEmptyFlatEntityValidationError({
      flatEntityMinimalInformation: {
        universalIdentifier: flatPermissionFlagGrantToValidate.universalIdentifier,
        roleUniversalIdentifier:
          flatPermissionFlagGrantToValidate.roleUniversalIdentifier,
      },
      metadataName: 'permissionFlagGrant',
      type: 'create',
    });

    const existingByUniversalId = findFlatEntityByUniversalIdentifier({
      universalIdentifier: flatPermissionFlagGrantToValidate.universalIdentifier,
      flatEntityMaps: optimisticFlatPermissionFlagGrantMaps,
    });

    if (isDefined(existingByUniversalId)) {
      validationResult.errors.push({
        code: PermissionsExceptionCode.INVALID_SETTING,
        message: t`Permission flag with universal identifier ${flatPermissionFlagGrantToValidate.universalIdentifier} already exists`,
        userFriendlyMessage: msg`Permission flag already exists`,
      });
    }

    const referencedRole = findFlatEntityByUniversalIdentifier({
      universalIdentifier: flatPermissionFlagGrantToValidate.roleUniversalIdentifier,
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
      isDefined(flatPermissionFlagGrantToValidate.flag) &&
      Object.values(PermissionFlagType).includes(
        flatPermissionFlagGrantToValidate.flag,
      );

    if (!isValidFlag) {
      validationResult.errors.push({
        code: PermissionsExceptionCode.INVALID_SETTING,
        message: t`Invalid permission flag value`,
        userFriendlyMessage: msg`Invalid permission setting`,
      });
    }

    const duplicateForSameRole = Object.values(
      optimisticFlatPermissionFlagGrantMaps.byUniversalIdentifier,
    ).filter(
      (pf) =>
        isDefined(pf) &&
        pf.roleUniversalIdentifier ===
          flatPermissionFlagGrantToValidate.roleUniversalIdentifier &&
        pf.flag === flatPermissionFlagGrantToValidate.flag &&
        pf.universalIdentifier !==
          flatPermissionFlagGrantToValidate.universalIdentifier,
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

  validateFlatPermissionFlagGrantUpdate({
    universalIdentifier,
    flatEntityUpdate,
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
      flatPermissionFlagGrantMaps: optimisticFlatPermissionFlagGrantMaps,
      flatRoleMaps,
    },
    buildOptions,
  }: FlatEntityUpdateValidationArgs<
    typeof ALL_METADATA_NAME.permissionFlagGrant
  >): FailedFlatEntityValidation<'permissionFlagGrant', 'update'> {
    const existingFlatPermissionFlagGrant = findFlatEntityByUniversalIdentifier({
      universalIdentifier,
      flatEntityMaps: optimisticFlatPermissionFlagGrantMaps,
    });

    const validationResult = getEmptyFlatEntityValidationError({
      flatEntityMinimalInformation: {
        universalIdentifier,
      },
      metadataName: 'permissionFlagGrant',
      type: 'update',
    });

    if (!isDefined(existingFlatPermissionFlagGrant)) {
      validationResult.errors.push({
        code: PermissionsExceptionCode.PERMISSION_NOT_FOUND,
        message: t`Permission flag to update not found`,
        userFriendlyMessage: msg`Permission flag not found`,
      });

      return validationResult;
    }

    const updatedFlatPermissionFlagGrant = {
      ...existingFlatPermissionFlagGrant,
      ...flatEntityUpdate,
    };

    const referencedRole = findFlatEntityByUniversalIdentifier({
      universalIdentifier: updatedFlatPermissionFlagGrant.roleUniversalIdentifier,
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
      optimisticFlatPermissionFlagGrantMaps.byUniversalIdentifier,
    ).filter(
      (pf) =>
        isDefined(pf) &&
        pf.roleUniversalIdentifier ===
          updatedFlatPermissionFlagGrant.roleUniversalIdentifier &&
        pf.flag === updatedFlatPermissionFlagGrant.flag &&
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

  validateFlatPermissionFlagGrantDeletion({
    flatEntityToValidate: { universalIdentifier },
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
      flatPermissionFlagGrantMaps: optimisticFlatPermissionFlagGrantMaps,
      flatRoleMaps,
    },
  }: UniversalFlatEntityValidationArgs<
    typeof ALL_METADATA_NAME.permissionFlagGrant
  >): FailedFlatEntityValidation<'permissionFlagGrant', 'delete'> {
    const validationResult = getEmptyFlatEntityValidationError({
      flatEntityMinimalInformation: {
        universalIdentifier,
      },
      metadataName: 'permissionFlagGrant',
      type: 'delete',
    });

    const existingFlatPermissionFlagGrant = findFlatEntityByUniversalIdentifier({
      universalIdentifier,
      flatEntityMaps: optimisticFlatPermissionFlagGrantMaps,
    });

    if (!isDefined(existingFlatPermissionFlagGrant)) {
      validationResult.errors.push({
        code: PermissionsExceptionCode.PERMISSION_NOT_FOUND,
        message: t`Permission flag to delete not found`,
        userFriendlyMessage: msg`Permission flag not found`,
      });
    } else {
      const referencedRole = findFlatEntityByUniversalIdentifier({
        universalIdentifier: existingFlatPermissionFlagGrant.roleUniversalIdentifier,
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
