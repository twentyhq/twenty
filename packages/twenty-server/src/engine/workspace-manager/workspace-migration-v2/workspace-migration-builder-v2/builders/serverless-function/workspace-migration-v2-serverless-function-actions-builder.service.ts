import { Injectable } from '@nestjs/common';

import { ALL_METADATA_NAME } from 'src/engine/metadata-modules/flat-entity/constant/all-metadata-name.constant';
import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { UpdateServerlessFunctionAction } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/serverless-function/types/workspace-migration-serverless-function-action-v2.type';
import { WorkspaceEntityMigrationBuilderV2Service } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/services/workspace-entity-migration-builder-v2.service';
import { FlatEntityUpdateValidationArgs } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/flat-entity-update-validation-args.type';
import { FlatEntityValidationArgs } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/flat-entity-validation-args.type';
import { FlatEntityValidationReturnType } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/flat-entity-validation-result.type';
import { FlatServerlessFunctionValidatorService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/validators/services/flat-serverless-function-validator.service';
import { fromFlatEntityPropertiesUpdatesToPartialFlatEntity } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/utils/from-flat-entity-properties-updates-to-partial-flat-entity';

@Injectable()
export class WorkspaceMigrationV2ServerlessFunctionActionsBuilderService extends WorkspaceEntityMigrationBuilderV2Service<
  typeof ALL_METADATA_NAME.serverlessFunction
> {
  constructor(
    private readonly flatServerlessFunctionValidatorService: FlatServerlessFunctionValidatorService,
  ) {
    super(ALL_METADATA_NAME.serverlessFunction);
  }

  protected async validateFlatEntityCreation(
    args: FlatEntityValidationArgs<typeof ALL_METADATA_NAME.serverlessFunction>,
  ): Promise<
    FlatEntityValidationReturnType<
      typeof ALL_METADATA_NAME.serverlessFunction,
      'created'
    >
  > {
    const validationResult =
      await this.flatServerlessFunctionValidatorService.validateFlatServerlessFunctionCreation(
        args,
      );

    if (validationResult.errors.length > 0) {
      return {
        status: 'fail',
        ...validationResult,
      };
    }

    const {
      flatEntityToValidate: flatServerlessFunctionToValidate,
      dependencyOptimisticFlatEntityMaps,
    } = args;

    return {
      status: 'success',
      action: {
        type: 'create_serverless_function',
        serverlessFunction: flatServerlessFunctionToValidate,
      },
      dependencyOptimisticFlatEntityMaps,
    };
  }

  protected async validateFlatEntityDeletion(
    args: FlatEntityValidationArgs<typeof ALL_METADATA_NAME.serverlessFunction>,
  ): Promise<
    FlatEntityValidationReturnType<
      typeof ALL_METADATA_NAME.serverlessFunction,
      'deleted'
    >
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

    const {
      flatEntityToValidate: flatServerlessFunctionToValidate,
      dependencyOptimisticFlatEntityMaps,
    } = args;

    return {
      status: 'success',
      action: {
        type: 'delete_serverless_function',
        serverlessFunctionId: flatServerlessFunctionToValidate.id,
      },
      dependencyOptimisticFlatEntityMaps,
    };
  }

  protected async validateFlatEntityUpdate(
    args: FlatEntityUpdateValidationArgs<
      typeof ALL_METADATA_NAME.serverlessFunction
    >,
  ): Promise<
    FlatEntityValidationReturnType<
      typeof ALL_METADATA_NAME.serverlessFunction,
      'updated'
    >
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

    const {
      dependencyOptimisticFlatEntityMaps,
      flatEntityId,
      flatEntityUpdates,
      optimisticFlatEntityMaps,
    } = args;

    const existingEntity = findFlatEntityByIdInFlatEntityMapsOrThrow({
      flatEntityId,
      flatEntityMaps: optimisticFlatEntityMaps,
    });
    const updatedEntity = {
      ...existingEntity,
      ...fromFlatEntityPropertiesUpdatesToPartialFlatEntity({
        updates: flatEntityUpdates,
      }),
    };

    const updateServerlessFunctionAction: UpdateServerlessFunctionAction = {
      type: 'update_serverless_function',
      serverlessFunctionId: flatEntityId,
      updates: flatEntityUpdates,
      code: updatedEntity.code,
    };

    return {
      status: 'success',
      action: updateServerlessFunctionAction,
      dependencyOptimisticFlatEntityMaps,
    };
  }
}
