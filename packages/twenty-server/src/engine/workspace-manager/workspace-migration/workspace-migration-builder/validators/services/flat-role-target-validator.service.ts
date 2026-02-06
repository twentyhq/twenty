import { Injectable } from '@nestjs/common';

import { msg, t } from '@lingui/core/macro';
import { ALL_METADATA_NAME } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { RoleTargetExceptionCode } from 'src/engine/metadata-modules/role/exceptions/role-target.exception';
import { FailedFlatEntityValidation } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/types/failed-flat-entity-validation.type';
import { getEmptyFlatEntityValidationError } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/utils/get-flat-entity-validation-error.util';
import { FlatEntityUpdateValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-update-validation-args.type';
import { UniversalFlatEntityValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-validation-args.type';
import { validateFlatRoleTargetAssignationAvailability } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/utils/validate-flat-role-target-assignation-availability.util';
import { validateFlatRoleTargetTargetsOnlyOneEntity } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/utils/validate-flat-role-target-targets-only-one-entity.util';

@Injectable()
export class FlatRoleTargetValidatorService {
  validateFlatRoleTargetCreation({
    flatEntityToValidate: flatRoleTargetToValidate,
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
      flatRoleTargetMaps: optimisticFlatRoleTargetMaps,
      flatRoleMaps,
    },
  }: UniversalFlatEntityValidationArgs<
    typeof ALL_METADATA_NAME.roleTarget
  >): FailedFlatEntityValidation<'roleTarget', 'create'> {
    const validationResult = getEmptyFlatEntityValidationError({
      flatEntityMinimalInformation: {
        universalIdentifier: flatRoleTargetToValidate.universalIdentifier,
      },
      metadataName: 'roleTarget',
      type: 'create',
    });

    const existingRoleTarget = findFlatEntityByUniversalIdentifier({
      universalIdentifier: flatRoleTargetToValidate.universalIdentifier,
      flatEntityMaps: optimisticFlatRoleTargetMaps,
    });

    if (isDefined(existingRoleTarget)) {
      validationResult.errors.push({
        code: RoleTargetExceptionCode.INVALID_ROLE_TARGET_DATA,
        message: t`Role target with this universal identifier already exists`,
        userFriendlyMessage: msg`Role target already exists`,
      });
    }

    validationResult.errors.push(
      ...validateFlatRoleTargetTargetsOnlyOneEntity({
        flatRoleTarget: flatRoleTargetToValidate,
      }),
    );

    const referencedRole = findFlatEntityByUniversalIdentifier({
      universalIdentifier: flatRoleTargetToValidate.roleUniversalIdentifier,
      flatEntityMaps: flatRoleMaps,
    });

    if (!isDefined(referencedRole)) {
      validationResult.errors.push({
        code: RoleTargetExceptionCode.INVALID_ROLE_TARGET_DATA,
        message: t`Role not found`,
        userFriendlyMessage: msg`Role not found`,
      });
    } else {
      validationResult.errors.push(
        ...validateFlatRoleTargetAssignationAvailability({
          flatRole: referencedRole,
          flatRoleTarget: flatRoleTargetToValidate,
        }),
      );
    }

    return validationResult;
  }

  validateFlatRoleTargetDeletion({
    flatEntityToValidate: flatRoleTargetToValidate,
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
      flatRoleTargetMaps: optimisticFlatRoleTargetMaps,
    },
  }: UniversalFlatEntityValidationArgs<
    typeof ALL_METADATA_NAME.roleTarget
  >): FailedFlatEntityValidation<'roleTarget', 'delete'> {
    const validationResult = getEmptyFlatEntityValidationError({
      flatEntityMinimalInformation: {
        universalIdentifier: flatRoleTargetToValidate.universalIdentifier,
      },
      metadataName: 'roleTarget',
      type: 'delete',
    });

    const existingRoleTarget = findFlatEntityByUniversalIdentifier({
      universalIdentifier: flatRoleTargetToValidate.universalIdentifier,
      flatEntityMaps: optimisticFlatRoleTargetMaps,
    });

    if (!isDefined(existingRoleTarget)) {
      validationResult.errors.push({
        code: RoleTargetExceptionCode.ROLE_TARGET_NOT_FOUND,
        message: t`Role target not found`,
        userFriendlyMessage: msg`Role target not found`,
      });

      return validationResult;
    }

    return validationResult;
  }

  validateFlatRoleTargetUpdate({
    universalIdentifier,
    flatEntityUpdate,
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
      flatRoleTargetMaps: optimisticFlatRoleTargetMaps,
      flatRoleMaps,
    },
  }: FlatEntityUpdateValidationArgs<
    typeof ALL_METADATA_NAME.roleTarget
  >): FailedFlatEntityValidation<'roleTarget', 'update'> {
    const existingRoleTarget = findFlatEntityByUniversalIdentifier({
      universalIdentifier,
      flatEntityMaps: optimisticFlatRoleTargetMaps,
    });

    const validationResult = getEmptyFlatEntityValidationError({
      flatEntityMinimalInformation: {
        universalIdentifier,
      },
      metadataName: 'roleTarget',
      type: 'update',
    });

    if (!isDefined(existingRoleTarget)) {
      validationResult.errors.push({
        code: RoleTargetExceptionCode.ROLE_TARGET_NOT_FOUND,
        message: t`Role target not found`,
        userFriendlyMessage: msg`Role target not found`,
      });

      return validationResult;
    }

    const updatedFlatRoleTarget = {
      ...existingRoleTarget,
      ...flatEntityUpdate,
    };

    validationResult.errors.push(
      ...validateFlatRoleTargetTargetsOnlyOneEntity({
        flatRoleTarget: updatedFlatRoleTarget,
      }),
    );

    const referencedRole = findFlatEntityByUniversalIdentifier({
      universalIdentifier: updatedFlatRoleTarget.roleUniversalIdentifier,
      flatEntityMaps: flatRoleMaps,
    });

    if (!isDefined(referencedRole)) {
      validationResult.errors.push({
        code: RoleTargetExceptionCode.INVALID_ROLE_TARGET_DATA,
        message: t`Role not found`,
        userFriendlyMessage: msg`Role not found`,
      });

      return validationResult;
    }

    validationResult.errors.push(
      ...validateFlatRoleTargetAssignationAvailability({
        flatRole: referencedRole,
        flatRoleTarget: updatedFlatRoleTarget,
      }),
    );

    return validationResult;
  }
}
