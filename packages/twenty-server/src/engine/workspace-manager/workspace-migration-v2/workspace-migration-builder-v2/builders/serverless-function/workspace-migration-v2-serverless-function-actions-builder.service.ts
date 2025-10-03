import { Injectable } from '@nestjs/common';

import { FlatServerlessFunction } from 'src/engine/metadata-modules/serverless-function/types/flat-serverless-function.type';
import { compareTwoFlatServerlessFunction } from 'src/engine/metadata-modules/serverless-function/utils/compare-two-flat-serverless-function.util';
import {
  FlatEntityUpdateValidationArgs,
  FlatEntityValidationArgs,
  FlatEntityValidationReturnType,
  WorkspaceEntityMigrationBuilderV2Service,
} from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/services/workspace-entity-migration-builder-v2.service';
import {
  UpdateServerlessFunctionAction,
  WorkspaceMigrationServerlessFunctionActionV2,
} from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/workspace-migration-serverless-function-action-v2.type';
import { FlatServerlessFunctionValidatorService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/validators/services/flat-serverless-function-validator.service';

@Injectable()
export class WorkspaceMigrationV2ServerlessFunctionActionsBuilderService extends WorkspaceEntityMigrationBuilderV2Service<
  'serverlessFunction',
  FlatServerlessFunction,
  WorkspaceMigrationServerlessFunctionActionV2,
  undefined
> {
  constructor(
    private readonly flatServerlessFunctionValidatorService: FlatServerlessFunctionValidatorService,
  ) {
    super('serverlessFunction');
  }

  protected async validateFlatEntityCreation({
    flatEntityToValidate: flatServerlessFunctionToValidate,
    optimisticFlatEntityMaps: optimisticFlatServerlessFunctionMaps,
    dependencyOptimisticFlatEntityMaps,
  }: FlatEntityValidationArgs<FlatServerlessFunction>): Promise<
    FlatEntityValidationReturnType<
      WorkspaceMigrationServerlessFunctionActionV2,
      FlatServerlessFunction
    >
  > {
    const validationResult =
      await this.flatServerlessFunctionValidatorService.validateFlatServerlessFunctionCreation(
        {
          flatServerlessFunctionToValidate,
          optimisticFlatServerlessFunctionMaps,
        },
      );

    if (validationResult.errors.length > 0) {
      return {
        status: 'fail',
        ...validationResult,
      };
    }

    return {
      status: 'success',
      action: {
        type: 'create_serverless_function',
        serverlessFunction: flatServerlessFunctionToValidate,
      },
      dependencyOptimisticFlatEntityMaps,
    };
  }

  protected async validateFlatEntityDeletion({
    flatEntityToValidate: flatServerlessFunctionToValidate,
    optimisticFlatEntityMaps: optimisticFlatServerlessFunctionMaps,
    dependencyOptimisticFlatEntityMaps,
  }: FlatEntityValidationArgs<FlatServerlessFunction>): Promise<
    FlatEntityValidationReturnType<
      WorkspaceMigrationServerlessFunctionActionV2,
      FlatServerlessFunction
    >
  > {
    const validationResult =
      this.flatServerlessFunctionValidatorService.validateFlatServerlessFunctionDeletion(
        {
          flatServerlessFunctionToValidate,
          optimisticFlatServerlessFunctionMaps,
        },
      );

    if (validationResult.errors.length > 0) {
      return {
        status: 'fail',
        ...validationResult,
      };
    }

    return {
      status: 'success',
      action: {
        type: 'delete_serverless_function',
        serverlessFunctionId: flatServerlessFunctionToValidate.id,
      },
      dependencyOptimisticFlatEntityMaps,
    };
  }

  protected async validateFlatEntityUpdate({
    flatEntityUpdate: {
      from: fromFlatServerlessFunction,
      to: toFlatServerlessFunction,
    },
    optimisticFlatEntityMaps: optimisticFlatServerlessFunctionMaps,
    dependencyOptimisticFlatEntityMaps,
  }: FlatEntityUpdateValidationArgs<FlatServerlessFunction>): Promise<
    | FlatEntityValidationReturnType<
        WorkspaceMigrationServerlessFunctionActionV2,
        FlatServerlessFunction
      >
    | undefined
  > {
    const serverlessFunctionUpdatedProperties =
      compareTwoFlatServerlessFunction({
        fromFlatServerlessFunction,
        toFlatServerlessFunction,
      });

    if (serverlessFunctionUpdatedProperties.length === 0) {
      return undefined;
    }

    const validationResult =
      this.flatServerlessFunctionValidatorService.validateFlatServerlessFunctionUpdate(
        {
          flatServerlessFunctionToValidate: toFlatServerlessFunction,
          optimisticFlatServerlessFunctionMaps,
        },
      );

    if (validationResult.errors.length > 0) {
      return {
        status: 'fail',
        ...validationResult,
      };
    }

    const updateServerlessFunctionAction: UpdateServerlessFunctionAction = {
      type: 'update_serverless_function',
      serverlessFunctionId: toFlatServerlessFunction.id,
      updates: serverlessFunctionUpdatedProperties,
      code: toFlatServerlessFunction.code,
    };

    return {
      status: 'success',
      action: updateServerlessFunctionAction,
      dependencyOptimisticFlatEntityMaps,
    };
  }
}
