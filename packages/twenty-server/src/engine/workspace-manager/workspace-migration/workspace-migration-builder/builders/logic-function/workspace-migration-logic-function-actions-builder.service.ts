import { Injectable } from '@nestjs/common';

import { ALL_METADATA_NAME } from 'twenty-shared/metadata';

import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { UpdateLogicFunctionAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/logic-function/types/workspace-migration-logic-function-action.type';
import {
  ValidateAndBuildArgs,
  ValidateAndBuildReturnType,
  WorkspaceEntityMigrationBuilderService,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/services/workspace-entity-migration-builder.service';
import { FlatEntityUpdateValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/flat-entity-update-validation-args.type';
import { FlatEntityValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/flat-entity-validation-args.type';
import { FlatEntityValidationReturnType } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/flat-entity-validation-result.type';
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
    const { to: toFlatEntityMaps } = args;
    const baseResult = await super.validateAndBuild(args);

    if (baseResult.status === 'fail') {
      return baseResult;
    }

    const updatedActions = baseResult.actions.update.map((action) => {
      if (action.type !== 'update') {
        return action;
      }

      const toLogicFunction = findFlatEntityByIdInFlatEntityMaps({
        flatEntityId: action.entityId,
        flatEntityMaps: toFlatEntityMaps,
      });

      return {
        ...action,
        code: toLogicFunction?.code,
      };
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
    args: FlatEntityValidationArgs<typeof ALL_METADATA_NAME.logicFunction>,
  ): FlatEntityValidationReturnType<
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
    args: FlatEntityValidationArgs<typeof ALL_METADATA_NAME.logicFunction>,
  ): FlatEntityValidationReturnType<
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
  ): FlatEntityValidationReturnType<
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

    const { flatEntityId, flatEntityUpdates } = args;

    const updateLogicFunctionAction: UpdateLogicFunctionAction = {
      type: 'update',
      metadataName: 'logicFunction',
      entityId: flatEntityId,
      updates: flatEntityUpdates,
    };

    return {
      status: 'success',
      action: updateLogicFunctionAction,
    };
  }
}
