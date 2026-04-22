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
export class FlatObjectPermissionValidatorService {
  validateFlatObjectPermissionCreation({
    flatEntityToValidate: flatObjectPermissionToValidate,
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
      flatObjectPermissionMaps: optimisticFlatObjectPermissionMaps,
      flatRoleMaps,
      flatObjectMetadataMaps,
    },
    buildOptions,
  }: UniversalFlatEntityValidationArgs<
    typeof ALL_METADATA_NAME.objectPermission
  >): FailedFlatEntityValidation<'objectPermission', 'create'> {
    const validationResult = getEmptyFlatEntityValidationError({
      flatEntityMinimalInformation: {
        universalIdentifier: flatObjectPermissionToValidate.universalIdentifier,
        roleUniversalIdentifier:
          flatObjectPermissionToValidate.roleUniversalIdentifier,
        objectMetadataUniversalIdentifier:
          flatObjectPermissionToValidate.objectMetadataUniversalIdentifier,
      },
      metadataName: 'objectPermission',
      type: 'create',
    });

    const existingByUniversalId = findFlatEntityByUniversalIdentifier({
      universalIdentifier: flatObjectPermissionToValidate.universalIdentifier,
      flatEntityMaps: optimisticFlatObjectPermissionMaps,
    });

    if (isDefined(existingByUniversalId)) {
      validationResult.errors.push({
        code: PermissionsExceptionCode.INVALID_SETTING,
        message: t`Object permission with universal identifier ${flatObjectPermissionToValidate.universalIdentifier} already exists`,
        userFriendlyMessage: msg`Object permission already exists`,
      });
    }

    const referencedRole = findFlatEntityByUniversalIdentifier({
      universalIdentifier:
        flatObjectPermissionToValidate.roleUniversalIdentifier,
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

    const referencedObjectMetadata = findFlatEntityByUniversalIdentifier({
      universalIdentifier:
        flatObjectPermissionToValidate.objectMetadataUniversalIdentifier,
      flatEntityMaps: flatObjectMetadataMaps,
    });

    if (!isDefined(referencedObjectMetadata)) {
      validationResult.errors.push({
        code: PermissionsExceptionCode.OBJECT_METADATA_NOT_FOUND,
        message: t`Object metadata not found`,
        userFriendlyMessage: msg`Object metadata not found`,
      });
    }

    const duplicateForSameRoleAndObject = Object.values(
      optimisticFlatObjectPermissionMaps.byUniversalIdentifier,
    ).filter(
      (op) =>
        isDefined(op) &&
        op.roleUniversalIdentifier ===
          flatObjectPermissionToValidate.roleUniversalIdentifier &&
        op.objectMetadataUniversalIdentifier ===
          flatObjectPermissionToValidate.objectMetadataUniversalIdentifier &&
        op.universalIdentifier !==
          flatObjectPermissionToValidate.universalIdentifier,
    );

    if (duplicateForSameRoleAndObject.length > 0) {
      validationResult.errors.push({
        code: PermissionsExceptionCode.INVALID_SETTING,
        message: t`Object permission for this role and object already exists`,
        userFriendlyMessage: msg`This object permission is already set for the role`,
      });
    }

    return validationResult;
  }

  validateFlatObjectPermissionUpdate({
    universalIdentifier,
    flatEntityUpdate,
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
      flatObjectPermissionMaps: optimisticFlatObjectPermissionMaps,
      flatRoleMaps,
      flatObjectMetadataMaps,
    },
    buildOptions,
  }: FlatEntityUpdateValidationArgs<
    typeof ALL_METADATA_NAME.objectPermission
  >): FailedFlatEntityValidation<'objectPermission', 'update'> {
    const existingFlatObjectPermission = findFlatEntityByUniversalIdentifier({
      universalIdentifier,
      flatEntityMaps: optimisticFlatObjectPermissionMaps,
    });

    const validationResult = getEmptyFlatEntityValidationError({
      flatEntityMinimalInformation: {
        universalIdentifier,
      },
      metadataName: 'objectPermission',
      type: 'update',
    });

    if (!isDefined(existingFlatObjectPermission)) {
      validationResult.errors.push({
        code: PermissionsExceptionCode.OBJECT_PERMISSION_NOT_FOUND,
        message: t`Object permission to update not found`,
        userFriendlyMessage: msg`Object permission not found`,
      });

      return validationResult;
    }

    const updatedFlatObjectPermission = {
      ...existingFlatObjectPermission,
      ...flatEntityUpdate,
    };

    const referencedRole = findFlatEntityByUniversalIdentifier({
      universalIdentifier: updatedFlatObjectPermission.roleUniversalIdentifier,
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

    if (isDefined(flatEntityUpdate.objectMetadataUniversalIdentifier)) {
      const referencedObjectMetadata = findFlatEntityByUniversalIdentifier({
        universalIdentifier:
          updatedFlatObjectPermission.objectMetadataUniversalIdentifier,
        flatEntityMaps: flatObjectMetadataMaps,
      });

      if (!isDefined(referencedObjectMetadata)) {
        validationResult.errors.push({
          code: PermissionsExceptionCode.OBJECT_METADATA_NOT_FOUND,
          message: t`Object metadata not found`,
          userFriendlyMessage: msg`Object metadata not found`,
        });
      }
    }

    const duplicateForSameRoleAndObject = Object.values(
      optimisticFlatObjectPermissionMaps.byUniversalIdentifier,
    ).filter(
      (op) =>
        isDefined(op) &&
        op.roleUniversalIdentifier ===
          updatedFlatObjectPermission.roleUniversalIdentifier &&
        op.objectMetadataUniversalIdentifier ===
          updatedFlatObjectPermission.objectMetadataUniversalIdentifier &&
        op.universalIdentifier !== universalIdentifier,
    );

    if (duplicateForSameRoleAndObject.length > 0) {
      validationResult.errors.push({
        code: PermissionsExceptionCode.INVALID_SETTING,
        message: t`Object permission for this role and object already exists`,
        userFriendlyMessage: msg`This object permission is already set for the role`,
      });
    }

    return validationResult;
  }

  validateFlatObjectPermissionDeletion({
    flatEntityToValidate: { universalIdentifier },
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
      flatObjectPermissionMaps: optimisticFlatObjectPermissionMaps,
      flatRoleMaps,
    },
  }: UniversalFlatEntityValidationArgs<
    typeof ALL_METADATA_NAME.objectPermission
  >): FailedFlatEntityValidation<'objectPermission', 'delete'> {
    const validationResult = getEmptyFlatEntityValidationError({
      flatEntityMinimalInformation: {
        universalIdentifier,
      },
      metadataName: 'objectPermission',
      type: 'delete',
    });

    const existingFlatObjectPermission = findFlatEntityByUniversalIdentifier({
      universalIdentifier,
      flatEntityMaps: optimisticFlatObjectPermissionMaps,
    });

    if (!isDefined(existingFlatObjectPermission)) {
      validationResult.errors.push({
        code: PermissionsExceptionCode.OBJECT_PERMISSION_NOT_FOUND,
        message: t`Object permission to delete not found`,
        userFriendlyMessage: msg`Object permission not found`,
      });
    } else {
      const referencedRole = findFlatEntityByUniversalIdentifier({
        universalIdentifier:
          existingFlatObjectPermission.roleUniversalIdentifier,
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
