import { Injectable } from '@nestjs/common';

import { msg, t } from '@lingui/core/macro';
import { ALL_METADATA_NAME } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { PermissionsExceptionCode } from 'src/engine/metadata-modules/permissions/permissions.exception';
import { findFlatEntityPropertyUpdate } from 'src/engine/workspace-manager/workspace-migration-v2/utils/find-flat-entity-property-update.util';
import { type FailedFlatEntityValidation } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/types/failed-flat-entity-validation.type';
import { getEmptyFlatEntityValidationError } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/utils/get-flat-entity-validation-error.util';
import { type FlatEntityUpdateValidationArgs } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/flat-entity-update-validation-args.type';
import { type FlatEntityValidationArgs } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/flat-entity-validation-args.type';
import { validateRoleIsEditable } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/validators/utils/validate-role-is-editable.util';
import { validateRoleLabelUniqueness } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/validators/utils/validate-role-label-uniqueness.util';
import { validateRoleReadWritePermissionsConsistency } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/validators/utils/validate-role-read-write-permissions-consistency.util';
import { validateRoleRequiredPropertiesAreDefined } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/validators/utils/validate-role-required-properties-are-defined.util';
import { fromFlatEntityPropertiesUpdatesToPartialFlatEntity } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/utils/from-flat-entity-properties-updates-to-partial-flat-entity';

@Injectable()
export class FlatRoleValidatorService {
  public validateFlatRoleCreation({
    flatEntityToValidate,
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
      flatRoleMaps: optimisticFlatRoleMaps,
    },
  }: FlatEntityValidationArgs<
    typeof ALL_METADATA_NAME.role
  >): FailedFlatEntityValidation<'role', 'create'> {
    const validationResult = getEmptyFlatEntityValidationError({
      flatEntityMinimalInformation: {
        id: flatEntityToValidate.id,
        universalIdentifier: flatEntityToValidate.universalIdentifier,
        label: flatEntityToValidate.label,
      },
      metadataName: 'role',
      type: 'create',
    });

    const existingRoles = Object.values(optimisticFlatRoleMaps.byId).filter(
      isDefined,
    );

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
  }: FlatEntityValidationArgs<
    typeof ALL_METADATA_NAME.role
  >): FailedFlatEntityValidation<'role', 'delete'> {
    const validationResult = getEmptyFlatEntityValidationError({
      flatEntityMinimalInformation: {
        id: flatEntityToValidate.id,
        universalIdentifier: flatEntityToValidate.universalIdentifier,
        label: flatEntityToValidate.label,
      },
      metadataName: 'role',
      type: 'delete',
    });

    const existingRole = optimisticFlatRoleMaps.byId[flatEntityToValidate.id];

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
    flatEntityId,
    flatEntityUpdates,
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
      flatRoleMaps: optimisticFlatRoleMaps,
    },
    buildOptions,
  }: FlatEntityUpdateValidationArgs<
    typeof ALL_METADATA_NAME.role
  >): FailedFlatEntityValidation<'role', 'update'> {
    const fromFlatRole = optimisticFlatRoleMaps.byId[flatEntityId];

    const validationResult = getEmptyFlatEntityValidationError({
      flatEntityMinimalInformation: {
        id: flatEntityId,
        universalIdentifier: fromFlatRole?.universalIdentifier,
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
      ...fromFlatEntityPropertiesUpdatesToPartialFlatEntity({
        updates: flatEntityUpdates,
      }),
    };

    validationResult.errors.push(
      ...validateRoleRequiredPropertiesAreDefined({
        flatRole: toFlatRole,
      }),
    );

    const flatRoleLabelUpdate = findFlatEntityPropertyUpdate({
      flatEntityUpdates,
      property: 'label',
    });

    if (isDefined(flatRoleLabelUpdate)) {
      const existingRoles = Object.values(optimisticFlatRoleMaps.byId).filter(
        isDefined,
      );

      validationResult.errors.push(
        ...validateRoleLabelUniqueness({
          label: flatRoleLabelUpdate.to,
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
