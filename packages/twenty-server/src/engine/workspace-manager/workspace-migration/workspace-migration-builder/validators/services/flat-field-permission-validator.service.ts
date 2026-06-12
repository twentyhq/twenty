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
export class FlatFieldPermissionValidatorService {
  validateFlatFieldPermissionCreation({
    flatEntityToValidate: flatFieldPermissionToValidate,
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
      flatFieldPermissionMaps: optimisticFlatFieldPermissionMaps,
      flatRoleMaps,
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
    },
    buildOptions,
  }: UniversalFlatEntityValidationArgs<
    typeof ALL_METADATA_NAME.fieldPermission
  >): FailedFlatEntityValidation<'fieldPermission', 'create'> {
    const validationResult = getEmptyFlatEntityValidationError({
      flatEntityMinimalInformation: {
        universalIdentifier: flatFieldPermissionToValidate.universalIdentifier,
        roleUniversalIdentifier:
          flatFieldPermissionToValidate.roleUniversalIdentifier,
        objectMetadataUniversalIdentifier:
          flatFieldPermissionToValidate.objectMetadataUniversalIdentifier,
        fieldMetadataUniversalIdentifier:
          flatFieldPermissionToValidate.fieldMetadataUniversalIdentifier,
      },
      metadataName: 'fieldPermission',
      type: 'create',
    });

    const existingByUniversalId = findFlatEntityByUniversalIdentifier({
      universalIdentifier: flatFieldPermissionToValidate.universalIdentifier,
      flatEntityMaps: optimisticFlatFieldPermissionMaps,
    });

    if (isDefined(existingByUniversalId)) {
      validationResult.errors.push({
        code: PermissionsExceptionCode.INVALID_SETTING,
        message: t`Field permission with universal identifier ${flatFieldPermissionToValidate.universalIdentifier} already exists`,
        userFriendlyMessage: msg`Field permission already exists`,
      });
    }

    const referencedRole = findFlatEntityByUniversalIdentifier({
      universalIdentifier:
        flatFieldPermissionToValidate.roleUniversalIdentifier,
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
        flatFieldPermissionToValidate.objectMetadataUniversalIdentifier,
      flatEntityMaps: flatObjectMetadataMaps,
    });

    if (!isDefined(referencedObjectMetadata)) {
      validationResult.errors.push({
        code: PermissionsExceptionCode.OBJECT_METADATA_NOT_FOUND,
        message: t`Object metadata not found`,
        userFriendlyMessage: msg`Object metadata not found`,
      });
    }

    const referencedFieldMetadata = findFlatEntityByUniversalIdentifier({
      universalIdentifier:
        flatFieldPermissionToValidate.fieldMetadataUniversalIdentifier,
      flatEntityMaps: flatFieldMetadataMaps,
    });

    if (!isDefined(referencedFieldMetadata)) {
      validationResult.errors.push({
        code: PermissionsExceptionCode.FIELD_METADATA_NOT_FOUND,
        message: t`Field metadata not found`,
        userFriendlyMessage: msg`Field metadata not found`,
      });
    }

    const duplicateForSameRoleObjectField = Object.values(
      optimisticFlatFieldPermissionMaps.byUniversalIdentifier,
    ).filter(
      (fp) =>
        isDefined(fp) &&
        fp.roleUniversalIdentifier ===
          flatFieldPermissionToValidate.roleUniversalIdentifier &&
        fp.objectMetadataUniversalIdentifier ===
          flatFieldPermissionToValidate.objectMetadataUniversalIdentifier &&
        fp.fieldMetadataUniversalIdentifier ===
          flatFieldPermissionToValidate.fieldMetadataUniversalIdentifier &&
        fp.universalIdentifier !==
          flatFieldPermissionToValidate.universalIdentifier,
    );

    if (duplicateForSameRoleObjectField.length > 0) {
      validationResult.errors.push({
        code: PermissionsExceptionCode.INVALID_SETTING,
        message: t`Field permission for this role, object and field already exists`,
        userFriendlyMessage: msg`This field permission is already set for the role`,
      });
    }

    return validationResult;
  }

  validateFlatFieldPermissionUpdate({
    universalIdentifier,
    flatEntityUpdate,
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
      flatFieldPermissionMaps: optimisticFlatFieldPermissionMaps,
      flatRoleMaps,
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
    },
    buildOptions,
  }: FlatEntityUpdateValidationArgs<
    typeof ALL_METADATA_NAME.fieldPermission
  >): FailedFlatEntityValidation<'fieldPermission', 'update'> {
    const existingFlatFieldPermission = findFlatEntityByUniversalIdentifier({
      universalIdentifier,
      flatEntityMaps: optimisticFlatFieldPermissionMaps,
    });

    const validationResult = getEmptyFlatEntityValidationError({
      flatEntityMinimalInformation: {
        universalIdentifier,
      },
      metadataName: 'fieldPermission',
      type: 'update',
    });

    if (!isDefined(existingFlatFieldPermission)) {
      validationResult.errors.push({
        code: PermissionsExceptionCode.FIELD_PERMISSION_NOT_FOUND,
        message: t`Field permission to update not found`,
        userFriendlyMessage: msg`Field permission not found`,
      });

      return validationResult;
    }

    const updatedFlatFieldPermission = {
      ...existingFlatFieldPermission,
      ...flatEntityUpdate,
    };

    const referencedRole = findFlatEntityByUniversalIdentifier({
      universalIdentifier: updatedFlatFieldPermission.roleUniversalIdentifier,
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
          updatedFlatFieldPermission.objectMetadataUniversalIdentifier,
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

    if (isDefined(flatEntityUpdate.fieldMetadataUniversalIdentifier)) {
      const referencedFieldMetadata = findFlatEntityByUniversalIdentifier({
        universalIdentifier:
          updatedFlatFieldPermission.fieldMetadataUniversalIdentifier,
        flatEntityMaps: flatFieldMetadataMaps,
      });

      if (!isDefined(referencedFieldMetadata)) {
        validationResult.errors.push({
          code: PermissionsExceptionCode.FIELD_METADATA_NOT_FOUND,
          message: t`Field metadata not found`,
          userFriendlyMessage: msg`Field metadata not found`,
        });
      }
    }

    const duplicateForSameRoleObjectField = Object.values(
      optimisticFlatFieldPermissionMaps.byUniversalIdentifier,
    ).filter(
      (fp) =>
        isDefined(fp) &&
        fp.roleUniversalIdentifier ===
          updatedFlatFieldPermission.roleUniversalIdentifier &&
        fp.objectMetadataUniversalIdentifier ===
          updatedFlatFieldPermission.objectMetadataUniversalIdentifier &&
        fp.fieldMetadataUniversalIdentifier ===
          updatedFlatFieldPermission.fieldMetadataUniversalIdentifier &&
        fp.universalIdentifier !== universalIdentifier,
    );

    if (duplicateForSameRoleObjectField.length > 0) {
      validationResult.errors.push({
        code: PermissionsExceptionCode.INVALID_SETTING,
        message: t`Field permission for this role, object and field already exists`,
        userFriendlyMessage: msg`This field permission is already set for the role`,
      });
    }

    return validationResult;
  }

  validateFlatFieldPermissionDeletion({
    flatEntityToValidate: { universalIdentifier },
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
      flatFieldPermissionMaps: optimisticFlatFieldPermissionMaps,
      flatRoleMaps,
    },
  }: UniversalFlatEntityValidationArgs<
    typeof ALL_METADATA_NAME.fieldPermission
  >): FailedFlatEntityValidation<'fieldPermission', 'delete'> {
    const validationResult = getEmptyFlatEntityValidationError({
      flatEntityMinimalInformation: {
        universalIdentifier,
      },
      metadataName: 'fieldPermission',
      type: 'delete',
    });

    const existingFlatFieldPermission = findFlatEntityByUniversalIdentifier({
      universalIdentifier,
      flatEntityMaps: optimisticFlatFieldPermissionMaps,
    });

    if (!isDefined(existingFlatFieldPermission)) {
      validationResult.errors.push({
        code: PermissionsExceptionCode.FIELD_PERMISSION_NOT_FOUND,
        message: t`Field permission to delete not found`,
        userFriendlyMessage: msg`Field permission not found`,
      });
    } else {
      const referencedRole = findFlatEntityByUniversalIdentifier({
        universalIdentifier:
          existingFlatFieldPermission.roleUniversalIdentifier,
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
