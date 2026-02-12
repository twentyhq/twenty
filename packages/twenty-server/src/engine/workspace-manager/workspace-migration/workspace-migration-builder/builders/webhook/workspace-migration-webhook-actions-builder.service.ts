import { Injectable } from '@nestjs/common';

import { ALL_METADATA_NAME } from 'twenty-shared/metadata';

import { UniversalUpdateWebhookAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/webhook/types/workspace-migration-webhook-action.type';
import { WorkspaceEntityMigrationBuilderService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/services/workspace-entity-migration-builder.service';
import { FlatEntityUpdateValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-update-validation-args.type';
import { UniversalFlatEntityValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-validation-args.type';
import { UniversalFlatEntityValidationReturnType } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-validation-result.type';
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
    args: UniversalFlatEntityValidationArgs<typeof ALL_METADATA_NAME.webhook>,
  ): UniversalFlatEntityValidationReturnType<
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
    args: UniversalFlatEntityValidationArgs<typeof ALL_METADATA_NAME.webhook>,
  ): UniversalFlatEntityValidationReturnType<
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
  ): UniversalFlatEntityValidationReturnType<
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

    const { universalIdentifier, flatEntityUpdate } = args;

    const updateWebhookAction: UniversalUpdateWebhookAction = {
      type: 'update',
      metadataName: 'webhook',
      universalIdentifier,
      update: flatEntityUpdate,
    };

    return {
      status: 'success',
      action: updateWebhookAction,
    };
  }
}
