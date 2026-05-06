import { Injectable } from '@nestjs/common';

import { ALL_METADATA_NAME } from 'twenty-shared/metadata';

import { UniversalUpdateApplicationVariableAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/application-variable/types/workspace-migration-application-variable-action.type';
import { WorkspaceEntityMigrationBuilderService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/services/workspace-entity-migration-builder.service';
import { FlatEntityUpdateValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-update-validation-args.type';
import { UniversalFlatEntityValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-validation-args.type';
import { UniversalFlatEntityValidationReturnType } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-validation-result.type';
import { FlatApplicationVariableValidatorService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/services/flat-application-variable-validator.service';

@Injectable()
export class WorkspaceMigrationApplicationVariableActionsBuilderService extends WorkspaceEntityMigrationBuilderService<
  typeof ALL_METADATA_NAME.applicationVariable
> {
  constructor(
    private readonly flatApplicationVariableValidatorService: FlatApplicationVariableValidatorService,
  ) {
    super(ALL_METADATA_NAME.applicationVariable);
  }

  protected validateFlatEntityCreation(
    args: UniversalFlatEntityValidationArgs<
      typeof ALL_METADATA_NAME.applicationVariable
    >,
  ): UniversalFlatEntityValidationReturnType<
    typeof ALL_METADATA_NAME.applicationVariable,
    'create'
  > {
    const validationResult =
      this.flatApplicationVariableValidatorService.validateFlatApplicationVariableCreation(
        args,
      );

    if (validationResult.errors.length > 0) {
      return {
        status: 'fail',
        ...validationResult,
      };
    }

    const { flatEntityToValidate: flatApplicationVariableToValidate } = args;

    return {
      status: 'success',
      action: {
        type: 'create',
        metadataName: 'applicationVariable',
        flatEntity: flatApplicationVariableToValidate,
      },
    };
  }

  protected validateFlatEntityDeletion(
    args: UniversalFlatEntityValidationArgs<
      typeof ALL_METADATA_NAME.applicationVariable
    >,
  ): UniversalFlatEntityValidationReturnType<
    typeof ALL_METADATA_NAME.applicationVariable,
    'delete'
  > {
    const validationResult =
      this.flatApplicationVariableValidatorService.validateFlatApplicationVariableDeletion(
        args,
      );

    if (validationResult.errors.length > 0) {
      return {
        status: 'fail',
        ...validationResult,
      };
    }

    const { flatEntityToValidate: flatApplicationVariableToValidate } = args;

    return {
      status: 'success',
      action: {
        type: 'delete',
        metadataName: 'applicationVariable',
        universalIdentifier:
          flatApplicationVariableToValidate.universalIdentifier,
      },
    };
  }

  protected validateFlatEntityUpdate(
    args: FlatEntityUpdateValidationArgs<
      typeof ALL_METADATA_NAME.applicationVariable
    >,
  ): UniversalFlatEntityValidationReturnType<
    typeof ALL_METADATA_NAME.applicationVariable,
    'update'
  > {
    const validationResult =
      this.flatApplicationVariableValidatorService.validateFlatApplicationVariableUpdate(
        args,
      );

    if (validationResult.errors.length > 0) {
      return {
        status: 'fail',
        ...validationResult,
      };
    }

    const { universalIdentifier, flatEntityUpdate } = args;

    const updateAction: UniversalUpdateApplicationVariableAction = {
      type: 'update',
      metadataName: 'applicationVariable',
      universalIdentifier,
      update: flatEntityUpdate,
    };

    return {
      status: 'success',
      action: updateAction,
    };
  }
}
