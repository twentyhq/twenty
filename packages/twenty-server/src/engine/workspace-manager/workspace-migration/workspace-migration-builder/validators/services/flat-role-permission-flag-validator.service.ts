import { Injectable } from '@nestjs/common';

import { msg, t } from '@lingui/core/macro';
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
export class FlatRolePermissionFlagValidatorService {
  validateFlatRolePermissionFlagCreation({
    flatEntityToValidate: flatRolePermissionFlagToValidate,
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
      flatPermissionFlagMaps,
      flatRolePermissionFlagMaps: optimisticFlatRolePermissionFlagMaps,
      flatRoleMaps,
    },
    buildOptions,
  }: UniversalFlatEntityValidationArgs<
    typeof ALL_METADATA_NAME.rolePermissionFlag
  >): FailedFlatEntityValidation<'rolePermissionFlag', 'create'> {
    const validationResult = getEmptyFlatEntityValidationError({
      flatEntityMinimalInformation: {
        universalIdentifier:
          flatRolePermissionFlagToValidate.universalIdentifier,
        permissionFlagUniversalIdentifier:
          flatRolePermissionFlagToValidate.permissionFlagUniversalIdentifier,
        roleUniversalIdentifier:
          flatRolePermissionFlagToValidate.roleUniversalIdentifier,
      },
      metadataName: 'rolePermissionFlag',
      type: 'create',
    });

    const existingByUniversalId = findFlatEntityByUniversalIdentifier({
      universalIdentifier: flatRolePermissionFlagToValidate.universalIdentifier,
      flatEntityMaps: optimisticFlatRolePermissionFlagMaps,
    });

    if (isDefined(existingByUniversalId)) {
      validationResult.errors.push({
        code: PermissionsExceptionCode.INVALID_SETTING,
        message: t`Role permission flag with universal identifier ${flatRolePermissionFlagToValidate.universalIdentifier} already exists`,
        userFriendlyMessage: msg`Role permission flag already exists`,
      });
    }

    const referencedRole = findFlatEntityByUniversalIdentifier({
      universalIdentifier:
        flatRolePermissionFlagToValidate.roleUniversalIdentifier,
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

    const referencedPermissionFlag = findFlatEntityByUniversalIdentifier({
      universalIdentifier:
        flatRolePermissionFlagToValidate.permissionFlagUniversalIdentifier,
      flatEntityMaps: flatPermissionFlagMaps,
    });

    if (!isDefined(referencedPermissionFlag)) {
      validationResult.errors.push({
        code: PermissionsExceptionCode.INVALID_SETTING,
        message: t`Permission flag not found`,
        userFriendlyMessage: msg`Invalid permission setting`,
      });
    }

    const duplicateForSameRole = Object.values(
      optimisticFlatRolePermissionFlagMaps.byUniversalIdentifier,
    ).filter(
      (pf) =>
        isDefined(pf) &&
        pf.roleUniversalIdentifier ===
          flatRolePermissionFlagToValidate.roleUniversalIdentifier &&
        pf.permissionFlagUniversalIdentifier ===
          flatRolePermissionFlagToValidate.permissionFlagUniversalIdentifier &&
        pf.universalIdentifier !==
          flatRolePermissionFlagToValidate.universalIdentifier,
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

  validateFlatRolePermissionFlagUpdate({
    universalIdentifier,
    flatEntityUpdate,
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
      flatPermissionFlagMaps,
      flatRolePermissionFlagMaps: optimisticFlatRolePermissionFlagMaps,
      flatRoleMaps,
    },
    buildOptions,
  }: FlatEntityUpdateValidationArgs<
    typeof ALL_METADATA_NAME.rolePermissionFlag
  >): FailedFlatEntityValidation<'rolePermissionFlag', 'update'> {
    const existingFlatRolePermissionFlag = findFlatEntityByUniversalIdentifier({
      universalIdentifier,
      flatEntityMaps: optimisticFlatRolePermissionFlagMaps,
    });

    const validationResult = getEmptyFlatEntityValidationError({
      flatEntityMinimalInformation: {
        universalIdentifier,
      },
      metadataName: 'rolePermissionFlag',
      type: 'update',
    });

    if (!isDefined(existingFlatRolePermissionFlag)) {
      validationResult.errors.push({
        code: PermissionsExceptionCode.PERMISSION_NOT_FOUND,
        message: t`Permission flag to update not found`,
        userFriendlyMessage: msg`Permission flag not found`,
      });

      return validationResult;
    }

    const updatedFlatRolePermissionFlag = {
      ...existingFlatRolePermissionFlag,
      ...flatEntityUpdate,
    };

    const referencedRole = findFlatEntityByUniversalIdentifier({
      universalIdentifier:
        updatedFlatRolePermissionFlag.roleUniversalIdentifier,
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

    if (isDefined(flatEntityUpdate.permissionFlagUniversalIdentifier)) {
      const referencedPermissionFlag = findFlatEntityByUniversalIdentifier({
        universalIdentifier:
          flatEntityUpdate.permissionFlagUniversalIdentifier as string,
        flatEntityMaps: flatPermissionFlagMaps,
      });

      if (!isDefined(referencedPermissionFlag)) {
        validationResult.errors.push({
          code: PermissionsExceptionCode.INVALID_SETTING,
          message: t`Permission flag not found`,
          userFriendlyMessage: msg`Invalid permission setting`,
        });
      }
    }

    const duplicateForSameRole = Object.values(
      optimisticFlatRolePermissionFlagMaps.byUniversalIdentifier,
    ).filter(
      (pf) =>
        isDefined(pf) &&
        pf.roleUniversalIdentifier ===
          updatedFlatRolePermissionFlag.roleUniversalIdentifier &&
        pf.permissionFlagUniversalIdentifier ===
          updatedFlatRolePermissionFlag.permissionFlagUniversalIdentifier &&
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

  validateFlatRolePermissionFlagDeletion({
    flatEntityToValidate: { universalIdentifier },
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
      flatRolePermissionFlagMaps: optimisticFlatRolePermissionFlagMaps,
      flatRoleMaps,
    },
  }: UniversalFlatEntityValidationArgs<
    typeof ALL_METADATA_NAME.rolePermissionFlag
  >): FailedFlatEntityValidation<'rolePermissionFlag', 'delete'> {
    const validationResult = getEmptyFlatEntityValidationError({
      flatEntityMinimalInformation: {
        universalIdentifier,
      },
      metadataName: 'rolePermissionFlag',
      type: 'delete',
    });

    const existingFlatRolePermissionFlag = findFlatEntityByUniversalIdentifier({
      universalIdentifier,
      flatEntityMaps: optimisticFlatRolePermissionFlagMaps,
    });

    if (!isDefined(existingFlatRolePermissionFlag)) {
      validationResult.errors.push({
        code: PermissionsExceptionCode.PERMISSION_NOT_FOUND,
        message: t`Permission flag to delete not found`,
        userFriendlyMessage: msg`Permission flag not found`,
      });
    } else {
      const referencedRole = findFlatEntityByUniversalIdentifier({
        universalIdentifier:
          existingFlatRolePermissionFlag.roleUniversalIdentifier,
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
