import { Injectable } from '@nestjs/common';

import { ALL_METADATA_NAME } from 'twenty-shared/metadata';

import { UniversalUpdateLogicFunctionAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/logic-function/types/workspace-migration-logic-function-action.type';
import {
  ValidateAndBuildArgs,
  ValidateAndBuildReturnType,
  WorkspaceEntityMigrationBuilderService,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/services/workspace-entity-migration-builder.service';
import { FlatEntityUpdateValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-update-validation-args.type';
import { UniversalFlatEntityValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-validation-args.type';
import { UniversalFlatEntityValidationReturnType } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-validation-result.type';
import { FlatLogicFunctionValidatorService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/services/flat-logic-function-validator.service';

@Injectable()
export class WorkspaceMigrationLogicFunctionActionsBuilderService extends WorkspaceEntityMigrationBuilderService<
  typeof ALL_METADATA_NAME.logicFunction
> {
  constructor(
    private readonly flatLogicFunctionValidatorService: FlatLogicFunctionValidatorService,
  ) {
    super(ALL_METADATA_NAME.logicFunction);
  }

  public async validateAndBuild(
    args: ValidateAndBuildArgs<typeof ALL_METADATA_NAME.logicFunction>,
  ): ValidateAndBuildReturnType<typeof ALL_METADATA_NAME.logicFunction> {
    const baseResult = await super.validateAndBuild(args);

    if (baseResult.status === 'fail') {
      return baseResult;
    }

    const updatedActions = baseResult.actions.update.map((action) => {
      return action;
    });

    return {
      ...baseResult,
      actions: {
        ...baseResult.actions,
        update: updatedActions,
      },
    };
  }

  protected validateFlatEntityCreation(
    args: UniversalFlatEntityValidationArgs<
      typeof ALL_METADATA_NAME.logicFunction
    >,
  ): UniversalFlatEntityValidationReturnType<
    typeof ALL_METADATA_NAME.logicFunction,
    'create'
  > {
    const validationResult =
      this.flatLogicFunctionValidatorService.validateFlatLogicFunctionCreation(
        args,
      );

    if (validationResult.errors.length > 0) {
      return {
        status: 'fail',
        ...validationResult,
      };
    }

    const { flatEntityToValidate: flatLogicFunctionToValidate } = args;

    return {
      status: 'success',
      action: {
        type: 'create',
        metadataName: 'logicFunction',
        flatEntity: flatLogicFunctionToValidate,
      },
    };
  }

  protected validateFlatEntityDeletion(
    args: UniversalFlatEntityValidationArgs<
      typeof ALL_METADATA_NAME.logicFunction
    >,
  ): UniversalFlatEntityValidationReturnType<
    typeof ALL_METADATA_NAME.logicFunction,
    'delete'
  > {
    const validationResult =
      this.flatLogicFunctionValidatorService.validateFlatLogicFunctionDeletion(
        args,
      );

    if (validationResult.errors.length > 0) {
      return {
        status: 'fail',
        ...validationResult,
      };
    }

    const { flatEntityToValidate: flatLogicFunctionToValidate } = args;

    return {
      status: 'success',
      action: {
        type: 'delete',
        metadataName: 'logicFunction',
        universalIdentifier: flatLogicFunctionToValidate.universalIdentifier,
      },
    };
  }

  protected validateFlatEntityUpdate(
    args: FlatEntityUpdateValidationArgs<
      typeof ALL_METADATA_NAME.logicFunction
    >,
  ): UniversalFlatEntityValidationReturnType<
    typeof ALL_METADATA_NAME.logicFunction,
    'update'
  > {
    const validationResult =
      this.flatLogicFunctionValidatorService.validateFlatLogicFunctionUpdate(
        args,
      );

    if (validationResult.errors.length > 0) {
      return {
        status: 'fail',
        ...validationResult,
      };
    }

    const { universalIdentifier, flatEntityUpdate } = args;

    const updateLogicFunctionAction: UniversalUpdateLogicFunctionAction = {
      type: 'update',
      metadataName: 'logicFunction',
      universalIdentifier,
      update: flatEntityUpdate,
    };

    return {
      status: 'success',
      action: updateLogicFunctionAction,
    };
  }
}
