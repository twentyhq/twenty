import { Injectable } from '@nestjs/common';

import { msg, t } from '@lingui/core/macro';
import { ALL_METADATA_NAME } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { PermissionsExceptionCode } from 'src/engine/metadata-modules/permissions/permissions.exception';
import { type FailedFlatEntityValidation } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/types/failed-flat-entity-validation.type';
import { getEmptyFlatEntityValidationError } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/utils/get-flat-entity-validation-error.util';
import { type FlatEntityUpdateValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-update-validation-args.type';
import { type UniversalFlatEntityValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-validation-args.type';
import { validateRoleIsEditable } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/utils/validate-role-is-editable.util';
import { validateRoleLabelUniqueness } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/utils/validate-role-label-uniqueness.util';
import { validateRoleReadWritePermissionsConsistency } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/utils/validate-role-read-write-permissions-consistency.util';
import { validateRoleRequiredPropertiesAreDefined } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/utils/validate-role-required-properties-are-defined.util';

@Injectable()
export class FlatRoleValidatorService {
  public validateFlatRoleCreation({
    flatEntityToValidate,
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
      flatRoleMaps: optimisticFlatRoleMaps,
    },
  }: UniversalFlatEntityValidationArgs<
    typeof ALL_METADATA_NAME.role
  >): FailedFlatEntityValidation<'role', 'create'> {
    const validationResult = getEmptyFlatEntityValidationError({
      flatEntityMinimalInformation: {
        universalIdentifier: flatEntityToValidate.universalIdentifier,
        label: flatEntityToValidate.label,
      },
      metadataName: 'role',
      type: 'create',
    });

    const existingRoles = Object.values(
      optimisticFlatRoleMaps.byUniversalIdentifier,
    ).filter(isDefined);

    validationResult.errors.push(
      ...validateRoleRequiredPropertiesAreDefined({
        flatRole: flatEntityToValidate,
      }),
    );

    validationResult.errors.push(
      ...validateRoleLabelUniqueness({
        label: flatEntityToValidate.label,
        existingFlatRoles: existingRoles,
      }),
    );

    validationResult.errors.push(
      ...validateRoleReadWritePermissionsConsistency({
        flatRole: flatEntityToValidate,
      }),
    );

    return validationResult;
  }

  public validateFlatRoleDeletion({
    flatEntityToValidate,
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
      flatRoleMaps: optimisticFlatRoleMaps,
    },
    buildOptions,
  }: UniversalFlatEntityValidationArgs<
    typeof ALL_METADATA_NAME.role
  >): FailedFlatEntityValidation<'role', 'delete'> {
    const validationResult = getEmptyFlatEntityValidationError({
      flatEntityMinimalInformation: {
        universalIdentifier: flatEntityToValidate.universalIdentifier,
        label: flatEntityToValidate.label,
      },
      metadataName: 'role',
      type: 'delete',
    });

    const existingRole = findFlatEntityByUniversalIdentifier({
      universalIdentifier: flatEntityToValidate.universalIdentifier,
      flatEntityMaps: optimisticFlatRoleMaps,
    });

    if (!isDefined(existingRole)) {
      validationResult.errors.push({
        code: PermissionsExceptionCode.ROLE_NOT_FOUND,
        message: t`Role not found`,
        userFriendlyMessage: msg`Role not found`,
      });

      return validationResult;
    }

    validationResult.errors.push(
      ...validateRoleIsEditable({
        flatRole: existingRole,
        buildOptions,
      }),
    );

    return validationResult;
  }

  public validateFlatRoleUpdate({
    universalIdentifier,
    flatEntityUpdate,
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
      flatRoleMaps: optimisticFlatRoleMaps,
    },
    buildOptions,
  }: FlatEntityUpdateValidationArgs<
    typeof ALL_METADATA_NAME.role
  >): FailedFlatEntityValidation<'role', 'update'> {
    const fromFlatRole = findFlatEntityByUniversalIdentifier({
      universalIdentifier,
      flatEntityMaps: optimisticFlatRoleMaps,
    });

    const validationResult = getEmptyFlatEntityValidationError({
      flatEntityMinimalInformation: {
        universalIdentifier,
      },
      metadataName: 'role',
      type: 'update',
    });

    if (!isDefined(fromFlatRole)) {
      validationResult.errors.push({
        code: PermissionsExceptionCode.ROLE_NOT_FOUND,
        message: t`Role not found`,
        userFriendlyMessage: msg`Role not found`,
      });

      return validationResult;
    }

    validationResult.errors.push(
      ...validateRoleIsEditable({
        flatRole: fromFlatRole,
        buildOptions,
      }),
    );

    const toFlatRole = {
      ...fromFlatRole,
      ...flatEntityUpdate,
    };

    validationResult.errors.push(
      ...validateRoleRequiredPropertiesAreDefined({
        flatRole: toFlatRole,
      }),
    );

    const flatRoleLabelUpdate = flatEntityUpdate.label;

    if (isDefined(flatRoleLabelUpdate)) {
      const existingRoles = Object.values(
        optimisticFlatRoleMaps.byUniversalIdentifier,
      ).filter(isDefined);

      validationResult.errors.push(
        ...validateRoleLabelUniqueness({
          label: flatRoleLabelUpdate,
          existingFlatRoles: existingRoles,
        }),
      );
    }

    validationResult.errors.push(
      ...validateRoleReadWritePermissionsConsistency({
        flatRole: toFlatRole,
      }),
    );

    return validationResult;
  }
}
