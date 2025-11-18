import { Injectable } from '@nestjs/common';

import { msg, t } from '@lingui/core/macro';
import { type ALL_METADATA_NAME } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { type FlatRole } from 'src/engine/metadata-modules/flat-role/types/flat-role.type';
import {
  PermissionsException,
  PermissionsExceptionCode,
  PermissionsExceptionMessage,
} from 'src/engine/metadata-modules/permissions/permissions.exception';
import { isArgDefinedIfProvidedOrThrow } from 'src/engine/metadata-modules/utils/is-arg-defined-if-provided-or-throw.util';
import { type FailedFlatEntityValidation } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/types/failed-flat-entity-validation.type';
import { type FlatEntityUpdateValidationArgs } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/flat-entity-update-validation-args.type';
import { type FlatEntityValidationArgs } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/flat-entity-validation-args.type';
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
  >): FailedFlatEntityValidation<FlatRole> {
    const validationResult: FailedFlatEntityValidation<FlatRole> = {
      type: 'create_role',
      errors: [],
      flatEntityMinimalInformation: {
        id: flatEntityToValidate.id,
        label: flatEntityToValidate.label,
      },
    };

    const existingRoles = Object.values(optimisticFlatRoleMaps.byId).filter(
      isDefined,
    );

    try {
      this.validateRoleInput({
        input: flatEntityToValidate,
        existingRoles,
      });
    } catch (error) {
      validationResult.errors.push({
        code: PermissionsExceptionCode.INVALID_ARG,
        message: error.message,
        userFriendlyMessage:
          error.userFriendlyMessage || msg`Invalid role input`,
      });
    }

    return validationResult;
  }

  public validateFlatRoleDeletion({
    flatEntityToValidate,
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
      flatRoleMaps: optimisticFlatRoleMaps,
    },
  }: FlatEntityValidationArgs<
    typeof ALL_METADATA_NAME.role
  >): FailedFlatEntityValidation<FlatRole> {
    const validationResult: FailedFlatEntityValidation<FlatRole> = {
      type: 'delete_role',
      errors: [],
      flatEntityMinimalInformation: {
        id: flatEntityToValidate.id,
        label: flatEntityToValidate.label,
      },
    };

    const existingRole = optimisticFlatRoleMaps.byId[flatEntityToValidate.id];

    if (!isDefined(existingRole)) {
      validationResult.errors.push({
        code: PermissionsExceptionCode.ROLE_NOT_FOUND,
        message: t`Role not found`,
        userFriendlyMessage: msg`Role not found`,
      });

      return validationResult;
    }

    try {
      this.validateRoleIsEditable(existingRole);
    } catch (error) {
      validationResult.errors.push({
        code: error.code || PermissionsExceptionCode.ROLE_NOT_EDITABLE,
        message: error.message,
        userFriendlyMessage:
          error.userFriendlyMessage || msg`Role cannot be deleted`,
      });
    }

    return validationResult;
  }

  public validateFlatRoleUpdate({
    flatEntityId,
    flatEntityUpdates,
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
      flatRoleMaps: optimisticFlatRoleMaps,
    },
  }: FlatEntityUpdateValidationArgs<
    typeof ALL_METADATA_NAME.role
  >): FailedFlatEntityValidation<FlatRole> {
    const validationResult: FailedFlatEntityValidation<FlatRole> = {
      type: 'update_role',
      errors: [],
      flatEntityMinimalInformation: {
        id: flatEntityId,
      },
    };

    const existingRole = optimisticFlatRoleMaps.byId[flatEntityId];

    if (!isDefined(existingRole)) {
      validationResult.errors.push({
        code: PermissionsExceptionCode.ROLE_NOT_FOUND,
        message: t`Role not found`,
        userFriendlyMessage: msg`Role not found`,
      });

      return validationResult;
    }

    try {
      this.validateRoleIsEditable(existingRole);
    } catch (error) {
      validationResult.errors.push({
        code: error.code || PermissionsExceptionCode.ROLE_NOT_EDITABLE,
        message: error.message,
        userFriendlyMessage:
          error.userFriendlyMessage || msg`Role cannot be updated`,
      });
    }

    const existingRoles = Object.values(optimisticFlatRoleMaps.byId).filter(
      isDefined,
    );

    const partialRoleUpdate =
      fromFlatEntityPropertiesUpdatesToPartialFlatEntity({
        updates: flatEntityUpdates,
      });

    try {
      this.validateRoleInput({
        input: partialRoleUpdate,
        existingRoles,
        existingRole,
        roleId: flatEntityId,
      });
    } catch (error) {
      validationResult.errors.push({
        code: error.code || PermissionsExceptionCode.INVALID_ARG,
        message: error.message,
        userFriendlyMessage:
          error.userFriendlyMessage || msg`Invalid role update`,
      });
    }

    return validationResult;
  }

  private validateRoleInput({
    input,
    existingRoles,
    existingRole,
    roleId,
  }: {
    input: Partial<FlatRole>;
    existingRoles: FlatRole[];
    existingRole?: FlatRole;
    roleId?: string;
  }): void {
    const keysToValidate = [
      'label',
      'canUpdateAllSettings',
      'canAccessAllTools',
      'canReadAllObjectRecords',
      'canUpdateAllObjectRecords',
      'canSoftDeleteAllObjectRecords',
      'canDestroyAllObjectRecords',
    ];

    for (const key of keysToValidate) {
      try {
        isArgDefinedIfProvidedOrThrow({
          input,
          key,
          value: input[key as keyof Partial<FlatRole>],
        });
      } catch (error) {
        throw new PermissionsException(
          error.message,
          PermissionsExceptionCode.INVALID_ARG,
          {
            userFriendlyMessage: msg`Some of the information provided is invalid. Please check your input and try again.`,
          },
        );
      }
    }

    // Validate label uniqueness
    if (isDefined(input.label)) {
      let rolesForLabelComparison = existingRoles;

      if (isDefined(roleId)) {
        rolesForLabelComparison = existingRoles.filter(
          (role) => role.id !== roleId,
        );
      }

      if (rolesForLabelComparison.some((role) => role.label === input.label)) {
        throw new PermissionsException(
          PermissionsExceptionMessage.ROLE_LABEL_ALREADY_EXISTS,
          PermissionsExceptionCode.ROLE_LABEL_ALREADY_EXISTS,
          { userFriendlyMessage: msg`A role with this label already exists.` },
        );
      }
    }

    // Validate read/write permission consistency
    this.validateRoleReadAndWritePermissionsConsistency({
      input,
      existingRole,
    });
  }

  private validateRoleIsEditable(role: FlatRole | null): void {
    if (!role?.isEditable) {
      throw new PermissionsException(
        PermissionsExceptionMessage.ROLE_NOT_EDITABLE,
        PermissionsExceptionCode.ROLE_NOT_EDITABLE,
        {
          userFriendlyMessage: msg`This role cannot be modified because it is a system role. Only custom roles can be edited.`,
        },
      );
    }
  }

  private validateRoleReadAndWritePermissionsConsistency({
    input,
    existingRole,
  }: {
    input: Partial<FlatRole>;
    existingRole?: FlatRole;
  }): void {
    const hasReadingPermissionsAfterUpdate =
      input.canReadAllObjectRecords ?? existingRole?.canReadAllObjectRecords;

    const hasUpdatePermissionsAfterUpdate =
      input.canUpdateAllObjectRecords ??
      existingRole?.canUpdateAllObjectRecords;

    const hasSoftDeletePermissionsAfterUpdate =
      input.canSoftDeleteAllObjectRecords ??
      existingRole?.canSoftDeleteAllObjectRecords;

    const hasDestroyPermissionsAfterUpdate =
      input.canDestroyAllObjectRecords ??
      existingRole?.canDestroyAllObjectRecords;

    if (
      hasReadingPermissionsAfterUpdate === false &&
      (hasUpdatePermissionsAfterUpdate ||
        hasSoftDeletePermissionsAfterUpdate ||
        hasDestroyPermissionsAfterUpdate)
    ) {
      throw new PermissionsException(
        PermissionsExceptionMessage.CANNOT_GIVE_WRITING_PERMISSION_WITHOUT_READING_PERMISSION,
        PermissionsExceptionCode.CANNOT_GIVE_WRITING_PERMISSION_WITHOUT_READING_PERMISSION,
        {
          userFriendlyMessage: msg`You cannot grant edit permissions without also granting read permissions. Please enable read access first.`,
        },
      );
    }
  }
}
