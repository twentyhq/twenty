import { Injectable } from '@nestjs/common';

import { ALL_METADATA_NAME } from 'twenty-shared/metadata';

import { UpdateWebhookAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/webhook/types/workspace-migration-webhook-action.type';
import { WorkspaceEntityMigrationBuilderService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/services/workspace-entity-migration-builder.service';
import { FlatEntityUpdateValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/flat-entity-update-validation-args.type';
import { FlatEntityValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/flat-entity-validation-args.type';
import { FlatEntityValidationReturnType } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/flat-entity-validation-result.type';
import { FlatWebhookValidatorService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/services/flat-webhook-validator.service';

@Injectable()
export class WorkspaceMigrationWebhookActionsBuilderService extends WorkspaceEntityMigrationBuilderService<
  typeof ALL_METADATA_NAME.webhook
> {
  constructor(
    private readonly flatWebhookValidatorService: FlatWebhookValidatorService,
  ) {
    super(ALL_METADATA_NAME.webhook);
  }

  protected validateFlatEntityCreation(
    args: FlatEntityValidationArgs<typeof ALL_METADATA_NAME.webhook>,
  ): FlatEntityValidationReturnType<
    typeof ALL_METADATA_NAME.webhook,
    'create'
  > {
    const validationResult =
      this.flatWebhookValidatorService.validateFlatWebhookCreation(args);

    if (validationResult.errors.length > 0) {
      return {
        status: 'fail',
        ...validationResult,
      };
    }

    const { flatEntityToValidate: flatWebhookToValidate } = args;

    return {
      status: 'success',
      action: {
        type: 'create',
        metadataName: 'webhook',
        flatEntity: flatWebhookToValidate,
      },
    };
  }

  protected validateFlatEntityDeletion(
    args: FlatEntityValidationArgs<typeof ALL_METADATA_NAME.webhook>,
  ): FlatEntityValidationReturnType<
    typeof ALL_METADATA_NAME.webhook,
    'delete'
  > {
    const validationResult =
      this.flatWebhookValidatorService.validateFlatWebhookDeletion(args);

    if (validationResult.errors.length > 0) {
      return {
        status: 'fail',
        ...validationResult,
      };
    }

    const { flatEntityToValidate: flatWebhookToValidate } = args;

    return {
      status: 'success',
      action: {
        type: 'delete',
        metadataName: 'webhook',
        universalIdentifier: flatWebhookToValidate.universalIdentifier,
      },
    };
  }

  protected validateFlatEntityUpdate(
    args: FlatEntityUpdateValidationArgs<typeof ALL_METADATA_NAME.webhook>,
  ): FlatEntityValidationReturnType<
    typeof ALL_METADATA_NAME.webhook,
    'update'
  > {
    const validationResult =
      this.flatWebhookValidatorService.validateFlatWebhookUpdate(args);

    if (validationResult.errors.length > 0) {
      return {
        status: 'fail',
        ...validationResult,
      };
    }

    const { flatEntityId, flatEntityUpdates } = args;

    const updateWebhookAction: UpdateWebhookAction = {
      type: 'update',
      metadataName: 'webhook',
      entityId: flatEntityId,
      updates: flatEntityUpdates,
    };

    return {
      status: 'success',
      action: updateWebhookAction,
    };
  }
}
