import { Injectable } from '@nestjs/common';

import { AllMetadataName } from 'src/engine/metadata-modules/flat-entity/types/all-metadata-name.type';
import { compareTwoFlatServerlessFunction } from 'src/engine/metadata-modules/serverless-function/utils/compare-two-flat-serverless-function.util';
import { UpdateServerlessFunctionAction } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/serverless-function/types/workspace-migration-serverless-function-action-v2.type';
import { WorkspaceEntityMigrationBuilderV2Service } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/services/workspace-entity-migration-builder-v2.service';
import { FlatEntityUpdateValidationArgs } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/flat-entity-update-validation-args.type';
import { FlatEntityValidationArgs } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/flat-entity-validation-args.type';
import { FlatEntityValidationReturnType } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/flat-entity-validation-result.type';
import { FlatServerlessFunctionValidatorService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/validators/services/flat-serverless-function-validator.service';

const SERVERLESS_FUNCTION_METADATA_NAME =
  'serverlessFunction' as const satisfies AllMetadataName;

@Injectable()
export class WorkspaceMigrationV2ServerlessFunctionActionsBuilderService extends WorkspaceEntityMigrationBuilderV2Service<
  typeof SERVERLESS_FUNCTION_METADATA_NAME
> {
  constructor(
    private readonly flatServerlessFunctionValidatorService: FlatServerlessFunctionValidatorService,
  ) {
    super(SERVERLESS_FUNCTION_METADATA_NAME);
  }

  protected async validateFlatEntityCreation({
    flatEntityToValidate: flatServerlessFunctionToValidate,
    optimisticFlatEntityMaps: optimisticFlatServerlessFunctionMaps,
    dependencyOptimisticFlatEntityMaps,
  }: FlatEntityValidationArgs<
    typeof SERVERLESS_FUNCTION_METADATA_NAME
  >): Promise<
    FlatEntityValidationReturnType<
      typeof SERVERLESS_FUNCTION_METADATA_NAME,
      'created'
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
  }: FlatEntityValidationArgs<
    typeof SERVERLESS_FUNCTION_METADATA_NAME
  >): Promise<
    FlatEntityValidationReturnType<
      typeof SERVERLESS_FUNCTION_METADATA_NAME,
      'deleted'
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
  }: FlatEntityUpdateValidationArgs<
    typeof SERVERLESS_FUNCTION_METADATA_NAME
  >): Promise<
    | FlatEntityValidationReturnType<
        typeof SERVERLESS_FUNCTION_METADATA_NAME,
        'updated'
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
