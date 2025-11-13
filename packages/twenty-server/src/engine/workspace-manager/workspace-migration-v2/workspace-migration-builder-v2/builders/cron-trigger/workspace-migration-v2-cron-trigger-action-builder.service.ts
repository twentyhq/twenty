import { Injectable } from '@nestjs/common';

import { ALL_METADATA_NAME } from 'twenty-shared/metadata';

import { UpdateCronTriggerAction } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/cron-trigger/types/workspace-migration-cron-trigger-action-v2.type';
import { WorkspaceEntityMigrationBuilderV2Service } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/services/workspace-entity-migration-builder-v2.service';
import { FlatEntityUpdateValidationArgs } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/flat-entity-update-validation-args.type';
import { FlatEntityValidationArgs } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/flat-entity-validation-args.type';
import { FlatEntityValidationReturnType } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/flat-entity-validation-result.type';
import { FlatCronTriggerValidatorService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/validators/services/flat-cron-trigger-validator.service';

@Injectable()
export class WorkspaceMigrationV2CronTriggerActionsBuilderService extends WorkspaceEntityMigrationBuilderV2Service<
  typeof ALL_METADATA_NAME.cronTrigger
> {
  constructor(
    private readonly flatCronTriggerValidatorService: FlatCronTriggerValidatorService,
  ) {
    super(ALL_METADATA_NAME.cronTrigger);
  }

  protected async validateFlatEntityCreation(
    args: FlatEntityValidationArgs<typeof ALL_METADATA_NAME.cronTrigger>,
  ): Promise<
    FlatEntityValidationReturnType<
      typeof ALL_METADATA_NAME.cronTrigger,
      'created'
    >
  > {
    const validationResult =
      await this.flatCronTriggerValidatorService.validateFlatCronTriggerCreation(
        args,
      );

    if (validationResult.errors.length > 0) {
      return {
        status: 'fail',
        ...validationResult,
      };
    }

    const { flatEntityToValidate: flatCronTriggerToValidate } = args;

    return {
      status: 'success',
      action: {
        type: 'create_cron_trigger',
        cronTrigger: flatCronTriggerToValidate,
      },
    };
  }

  protected async validateFlatEntityDeletion(
    args: FlatEntityValidationArgs<typeof ALL_METADATA_NAME.cronTrigger>,
  ): Promise<
    FlatEntityValidationReturnType<
      typeof ALL_METADATA_NAME.cronTrigger,
      'deleted'
    >
  > {
    const validationResult =
      this.flatCronTriggerValidatorService.validateFlatCronTriggerDeletion(
        args,
      );

    if (validationResult.errors.length > 0) {
      return {
        status: 'fail',
        ...validationResult,
      };
    }

    const { flatEntityToValidate: flatCronTriggerToValidate } = args;

    return {
      status: 'success',
      action: {
        type: 'delete_cron_trigger',
        cronTriggerId: flatCronTriggerToValidate.id,
      },
    };
  }

  protected async validateFlatEntityUpdate(
    args: FlatEntityUpdateValidationArgs<typeof ALL_METADATA_NAME.cronTrigger>,
  ): Promise<
    FlatEntityValidationReturnType<
      typeof ALL_METADATA_NAME.cronTrigger,
      'updated'
    >
  > {
    const validationResult =
      this.flatCronTriggerValidatorService.validateFlatCronTriggerUpdate(args);

    if (validationResult.errors.length > 0) {
      return {
        status: 'fail',
        ...validationResult,
      };
    }
    const { flatEntityId, flatEntityUpdates } = args;

    const updateCronTriggerAction: UpdateCronTriggerAction = {
      type: 'update_cron_trigger',
      cronTriggerId: flatEntityId,
      updates: flatEntityUpdates,
    };

    return {
      status: 'success',
      action: updateCronTriggerAction,
    };
  }
}
