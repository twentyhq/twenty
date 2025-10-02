import { Injectable } from '@nestjs/common';

import { FlatCronTrigger } from 'src/engine/metadata-modules/cron-trigger/types/flat-cron-trigger.type';
import { compareTwoFlatCronTrigger } from 'src/engine/metadata-modules/cron-trigger/utils/compare-two-flat-cron-trigger.util';
import {
  FlatEntityUpdateValidationArgs,
  FlatEntityValidationArgs,
  FlatEntityValidationReturnType,
  WorkspaceEntityMigrationBuilderV2Service,
} from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/services/workspace-entity-migration-builder-v2.service';
import {
  UpdateCronTriggerAction,
  WorkspaceMigrationCronTriggerActionV2,
} from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/workspace-migration-cron-trigger-action-v2.type';
import { FlatCronTriggerValidatorService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/validators/services/flat-cron-trigger-validator.service';

@Injectable()
export class WorkspaceMigrationV2CronTriggerActionsBuilderService extends WorkspaceEntityMigrationBuilderV2Service<
  FlatCronTrigger,
  WorkspaceMigrationCronTriggerActionV2
> {
  constructor(
    private readonly flatCronTriggerValidatorService: FlatCronTriggerValidatorService,
  ) {
    super();
  }

  protected async validateFlatEntityCreation({
    flatEntityToValidate: flatCronTriggerToValidate,
    optimisticFlatEntityMaps: optimisticFlatCronTriggerMaps,
    dependencyOptimisticFlatEntityMaps,
  }: FlatEntityValidationArgs<FlatCronTrigger>): Promise<
    FlatEntityValidationReturnType<
      WorkspaceMigrationCronTriggerActionV2,
      FlatCronTrigger
    >
  > {
    const validationResult =
      await this.flatCronTriggerValidatorService.validateFlatCronTriggerCreation(
        {
          flatCronTriggerToValidate,
          optimisticFlatCronTriggerMaps,
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
        type: 'create_cron_trigger',
        cronTrigger: flatCronTriggerToValidate,
      },
      dependencyOptimisticFlatEntityMaps,
    };
  }

  protected async validateFlatEntityDeletion({
    flatEntityToValidate: flatCronTriggerToValidate,
    optimisticFlatEntityMaps: optimisticFlatCronTriggerMaps,
    dependencyOptimisticFlatEntityMaps,
  }: FlatEntityValidationArgs<FlatCronTrigger>): Promise<
    FlatEntityValidationReturnType<
      WorkspaceMigrationCronTriggerActionV2,
      FlatCronTrigger
    >
  > {
    const validationResult =
      this.flatCronTriggerValidatorService.validateFlatCronTriggerDeletion({
        flatCronTriggerToValidate,
        optimisticFlatCronTriggerMaps,
      });

    if (validationResult.errors.length > 0) {
      return {
        status: 'fail',
        ...validationResult,
      };
    }

    return {
      status: 'success',
      action: {
        type: 'delete_cron_trigger',
        cronTriggerId: flatCronTriggerToValidate.id,
      },
      dependencyOptimisticFlatEntityMaps,
    };
  }

  protected async validateFlatEntityUpdate({
    flatEntityUpdate: { from: fromFlatCronTrigger, to: toFlatCronTrigger },
    optimisticFlatEntityMaps: optimisticFlatCronTriggerMaps,
    dependencyOptimisticFlatEntityMaps,
  }: FlatEntityUpdateValidationArgs<FlatCronTrigger>): Promise<
    | FlatEntityValidationReturnType<
        WorkspaceMigrationCronTriggerActionV2,
        FlatCronTrigger
      >
    | undefined
  > {
    const cronTriggerUpdatedProperties = compareTwoFlatCronTrigger({
      fromFlatCronTrigger,
      toFlatCronTrigger,
    });

    if (cronTriggerUpdatedProperties.length === 0) {
      return undefined;
    }

    const validationResult =
      this.flatCronTriggerValidatorService.validateFlatCronTriggerUpdate({
        flatCronTriggerToValidate: toFlatCronTrigger,
        optimisticFlatCronTriggerMaps,
      });

    if (validationResult.errors.length > 0) {
      return {
        status: 'fail',
        ...validationResult,
      };
    }

    const updateCronTriggerAction: UpdateCronTriggerAction = {
      type: 'update_cron_trigger',
      cronTriggerId: toFlatCronTrigger.id,
      updates: cronTriggerUpdatedProperties,
    };

    return {
      status: 'success',
      action: updateCronTriggerAction,
      dependencyOptimisticFlatEntityMaps,
    };
  }
}
