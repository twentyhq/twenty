import { Injectable } from '@nestjs/common';

import { msg, t } from '@lingui/core/macro';
import { ALL_METADATA_NAME } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { RoleTargetExceptionCode } from 'src/engine/metadata-modules/role/exceptions/role-target.exception';
import { FailedFlatEntityValidation } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/types/failed-flat-entity-validation.type';
import { getEmptyFlatEntityValidationError } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/utils/get-flat-entity-validation-error.util';
import { FlatEntityUpdateValidationArgs } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/flat-entity-update-validation-args.type';
import { FlatEntityValidationArgs } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/flat-entity-validation-args.type';
import { validateFlatRoleTargetAssignationAvailability } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/validators/utils/validate-flat-role-target-assignation-availability.util';
import { validateFlatRoleTargetTargetsOnlyOneEntity } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/validators/utils/validate-flat-role-target-targets-only-one-entity.util';
import { fromFlatEntityPropertiesUpdatesToPartialFlatEntity } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/utils/from-flat-entity-properties-updates-to-partial-flat-entity';

@Injectable()
export class FlatRoleTargetValidatorService {
  validateFlatRoleTargetCreation({
    flatEntityToValidate: flatRoleTargetToValidate,
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
      flatRoleTargetMaps: optimisticFlatRoleTargetMaps,
      flatRoleMaps,
    },
  }: FlatEntityValidationArgs<
    typeof ALL_METADATA_NAME.roleTarget
  >): FailedFlatEntityValidation<'roleTarget', 'create'> {
    const validationResult = getEmptyFlatEntityValidationError({
      flatEntityMinimalInformation: {
        id: flatRoleTargetToValidate.id,
        universalIdentifier: flatRoleTargetToValidate.universalIdentifier,
      },
      metadataName: 'roleTarget',
      type: 'create',
    });

    const existingRoleTarget = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: flatRoleTargetToValidate.id,
      flatEntityMaps: optimisticFlatRoleTargetMaps,
    });

    if (isDefined(existingRoleTarget)) {
      validationResult.errors.push({
        code: RoleTargetExceptionCode.INVALID_ROLE_TARGET_DATA,
        message: t`Role target with this id already exists`,
        userFriendlyMessage: msg`Role target with this id already exists`,
      });
    }

    validationResult.errors.push(
      ...validateFlatRoleTargetTargetsOnlyOneEntity({
        flatRoleTarget: flatRoleTargetToValidate,
      }),
    );

    const referencedRole = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: flatRoleTargetToValidate.roleId,
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
  }: FlatEntityValidationArgs<
    typeof ALL_METADATA_NAME.roleTarget
  >): FailedFlatEntityValidation<'roleTarget', 'delete'> {
    const validationResult = getEmptyFlatEntityValidationError({
      flatEntityMinimalInformation: {
        id: flatRoleTargetToValidate.id,
        universalIdentifier: flatRoleTargetToValidate.universalIdentifier,
      },
      metadataName: 'roleTarget',
      type: 'delete',
    });

    const existingRoleTarget = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: flatRoleTargetToValidate.id,
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
    flatEntityId,
    flatEntityUpdates,
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
      flatRoleTargetMaps: optimisticFlatRoleTargetMaps,
      flatRoleMaps,
    },
  }: FlatEntityUpdateValidationArgs<
    typeof ALL_METADATA_NAME.roleTarget
  >): FailedFlatEntityValidation<'roleTarget', 'update'> {
    const existingRoleTarget = optimisticFlatRoleTargetMaps.byId[flatEntityId];

    const validationResult = getEmptyFlatEntityValidationError({
      flatEntityMinimalInformation: {
        id: flatEntityId,
        universalIdentifier: existingRoleTarget?.universalIdentifier,
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
      ...fromFlatEntityPropertiesUpdatesToPartialFlatEntity({
        updates: flatEntityUpdates,
      }),
    };

    validationResult.errors.push(
      ...validateFlatRoleTargetTargetsOnlyOneEntity({
        flatRoleTarget: updatedFlatRoleTarget,
      }),
    );

    const referencedRole = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: updatedFlatRoleTarget.roleId,
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
