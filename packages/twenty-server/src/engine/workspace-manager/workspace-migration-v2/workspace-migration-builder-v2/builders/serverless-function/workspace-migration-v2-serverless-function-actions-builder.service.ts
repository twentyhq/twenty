import { Injectable } from '@nestjs/common';

import { ALL_METADATA_NAME } from 'twenty-shared/metadata';

import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { UpdateServerlessFunctionAction } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/serverless-function/types/workspace-migration-serverless-function-action-v2.type';
import {
  ValidateAndBuildArgs,
  ValidateAndBuildReturnType,
  WorkspaceEntityMigrationBuilderV2Service,
} from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/services/workspace-entity-migration-builder-v2.service';
import { FlatEntityUpdateValidationArgs } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/flat-entity-update-validation-args.type';
import { FlatEntityValidationArgs } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/flat-entity-validation-args.type';
import { FlatEntityValidationReturnType } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/flat-entity-validation-result.type';
import { FlatServerlessFunctionValidatorService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/validators/services/flat-serverless-function-validator.service';

@Injectable()
export class WorkspaceMigrationV2ServerlessFunctionActionsBuilderService extends WorkspaceEntityMigrationBuilderV2Service<
  typeof ALL_METADATA_NAME.serverlessFunction
> {
  constructor(
    private readonly flatServerlessFunctionValidatorService: FlatServerlessFunctionValidatorService,
  ) {
    super(ALL_METADATA_NAME.serverlessFunction);
  }

  public async validateAndBuild(
    args: ValidateAndBuildArgs<typeof ALL_METADATA_NAME.serverlessFunction>,
  ): ValidateAndBuildReturnType<typeof ALL_METADATA_NAME.serverlessFunction> {
    const { to: toFlatEntityMaps } = args;
    const baseResult = await super.validateAndBuild(args);

    if (baseResult.status === 'fail') {
      return baseResult;
    }

    const updatedActions = baseResult.actions.update.map((action) => {
      if (action.type !== 'update') {
        return action;
      }

      const toServerlessFunction = findFlatEntityByIdInFlatEntityMaps({
        flatEntityId: action.entityId,
        flatEntityMaps: toFlatEntityMaps,
      });

      return {
        ...action,
        code: toServerlessFunction?.code,
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
    args: FlatEntityValidationArgs<typeof ALL_METADATA_NAME.serverlessFunction>,
  ): FlatEntityValidationReturnType<
    typeof ALL_METADATA_NAME.serverlessFunction,
    'create'
  > {
    const validationResult =
      this.flatServerlessFunctionValidatorService.validateFlatServerlessFunctionCreation(
        args,
      );

    if (validationResult.errors.length > 0) {
      return {
        status: 'fail',
        ...validationResult,
      };
    }

    const { flatEntityToValidate: flatServerlessFunctionToValidate } = args;

    return {
      status: 'success',
      action: {
        type: 'create',
        metadataName: 'serverlessFunction',
        flatEntity: flatServerlessFunctionToValidate,
      },
    };
  }

  protected validateFlatEntityDeletion(
    args: FlatEntityValidationArgs<typeof ALL_METADATA_NAME.serverlessFunction>,
  ): FlatEntityValidationReturnType<
    typeof ALL_METADATA_NAME.serverlessFunction,
    'delete'
  > {
    const validationResult =
      this.flatServerlessFunctionValidatorService.validateFlatServerlessFunctionDeletion(
        args,
      );

    if (validationResult.errors.length > 0) {
      return {
        status: 'fail',
        ...validationResult,
      };
    }

    const { flatEntityToValidate: flatServerlessFunctionToValidate } = args;

    return {
      status: 'success',
      action: {
        type: 'delete',
        metadataName: 'serverlessFunction',
        entityId: flatServerlessFunctionToValidate.id,
      },
    };
  }

  protected validateFlatEntityUpdate(
    args: FlatEntityUpdateValidationArgs<
      typeof ALL_METADATA_NAME.serverlessFunction
    >,
  ): FlatEntityValidationReturnType<
    typeof ALL_METADATA_NAME.serverlessFunction,
    'update'
  > {
    const validationResult =
      this.flatServerlessFunctionValidatorService.validateFlatServerlessFunctionUpdate(
        args,
      );

    if (validationResult.errors.length > 0) {
      return {
        status: 'fail',
        ...validationResult,
      };
    }

    const { flatEntityId, flatEntityUpdates } = args;

    const updateServerlessFunctionAction: UpdateServerlessFunctionAction = {
      type: 'update',
      metadataName: 'serverlessFunction',
      entityId: flatEntityId,
      updates: flatEntityUpdates,
    };

    return {
      status: 'success',
      action: updateServerlessFunctionAction,
    };
  }
}
