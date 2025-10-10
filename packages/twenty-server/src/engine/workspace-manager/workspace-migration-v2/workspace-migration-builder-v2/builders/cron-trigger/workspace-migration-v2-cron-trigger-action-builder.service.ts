import { Injectable } from '@nestjs/common';

import { AllMetadataName } from 'src/engine/metadata-modules/flat-entity/types/all-metadata-name.type';
import { compareTwoFlatCronTrigger } from 'src/engine/metadata-modules/cron-trigger/utils/compare-two-flat-cron-trigger.util';
import { UpdateCronTriggerAction } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/cron-trigger/types/workspace-migration-cron-trigger-action-v2.type';
import { WorkspaceEntityMigrationBuilderV2Service } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/services/workspace-entity-migration-builder-v2.service';
import { FlatEntityUpdateValidationArgs } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/flat-entity-update-validation-args.type';
import { FlatEntityValidationArgs } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/flat-entity-validation-args.type';
import { FlatEntityValidationReturnType } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/flat-entity-validation-result.type';
import { FlatCronTriggerValidatorService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/validators/services/flat-cron-trigger-validator.service';

const CRON_TRIGGER_METADATA_NAME = 'cronTrigger' as const satisfies AllMetadataName;
@Injectable()
export class WorkspaceMigrationV2CronTriggerActionsBuilderService extends WorkspaceEntityMigrationBuilderV2Service<
  typeof CRON_TRIGGER_METADATA_NAME
> {
  constructor(
    private readonly flatCronTriggerValidatorService: FlatCronTriggerValidatorService,
  ) {
    super(CRON_TRIGGER_METADATA_NAME);
  }

  protected async validateFlatEntityCreation({
    flatEntityToValidate: flatCronTriggerToValidate,
    optimisticFlatEntityMaps: optimisticFlatCronTriggerMaps,
    dependencyOptimisticFlatEntityMaps,
  }: FlatEntityValidationArgs<typeof CRON_TRIGGER_METADATA_NAME>): Promise<
    FlatEntityValidationReturnType<typeof CRON_TRIGGER_METADATA_NAME, 'created'>
  > {
    const validationResult =
      await this.flatCronTriggerValidatorService.validateFlatCronTriggerCreation(
        {
          flatCronTriggerToValidate,
          optimisticFlatCronTriggerMaps,
          dependencyOptimisticFlatEntityMaps,
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
  }: FlatEntityValidationArgs<typeof CRON_TRIGGER_METADATA_NAME>): Promise<
    FlatEntityValidationReturnType<typeof CRON_TRIGGER_METADATA_NAME, 'deleted'>
  > {
    const validationResult =
      this.flatCronTriggerValidatorService.validateFlatCronTriggerDeletion({
        flatCronTriggerToValidate,
        optimisticFlatCronTriggerMaps,
        dependencyOptimisticFlatEntityMaps,
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
  }: FlatEntityUpdateValidationArgs<typeof CRON_TRIGGER_METADATA_NAME>): Promise<
    | FlatEntityValidationReturnType<typeof CRON_TRIGGER_METADATA_NAME, 'updated'>
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
        dependencyOptimisticFlatEntityMaps,
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
