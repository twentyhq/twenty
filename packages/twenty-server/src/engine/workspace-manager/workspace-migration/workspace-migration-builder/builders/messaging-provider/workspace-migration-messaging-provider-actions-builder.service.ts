import { Injectable } from '@nestjs/common';

import { ALL_METADATA_NAME } from 'twenty-shared/metadata';

import { UniversalUpdateMessagingProviderAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/messaging-provider/types/workspace-migration-messaging-provider-action.type';
import { WorkspaceEntityMigrationBuilderService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/services/workspace-entity-migration-builder.service';
import { FlatEntityUpdateValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-update-validation-args.type';
import { UniversalFlatEntityValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-validation-args.type';
import { UniversalFlatEntityValidationReturnType } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-validation-result.type';
import { FlatMessagingProviderValidatorService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/services/flat-messaging-provider-validator.service';

@Injectable()
export class WorkspaceMigrationMessagingProviderActionsBuilderService extends WorkspaceEntityMigrationBuilderService<
  typeof ALL_METADATA_NAME.messagingProvider
> {
  constructor(
    private readonly flatMessagingProviderValidatorService: FlatMessagingProviderValidatorService,
  ) {
    super(ALL_METADATA_NAME.messagingProvider);
  }

  protected validateFlatEntityCreation(
    args: UniversalFlatEntityValidationArgs<
      typeof ALL_METADATA_NAME.messagingProvider
    >,
  ): UniversalFlatEntityValidationReturnType<
    typeof ALL_METADATA_NAME.messagingProvider,
    'create'
  > {
    const validationResult =
      this.flatMessagingProviderValidatorService.validateFlatMessagingProviderCreation(
        args,
      );

    if (validationResult.errors.length > 0) {
      return {
        status: 'fail',
        ...validationResult,
      };
    }

    const { flatEntityToValidate: flatMessagingProviderToValidate } = args;

    return {
      status: 'success',
      action: {
        type: 'create',
        metadataName: 'messagingProvider',
        flatEntity: flatMessagingProviderToValidate,
      },
    };
  }

  protected validateFlatEntityDeletion(
    args: UniversalFlatEntityValidationArgs<
      typeof ALL_METADATA_NAME.messagingProvider
    >,
  ): UniversalFlatEntityValidationReturnType<
    typeof ALL_METADATA_NAME.messagingProvider,
    'delete'
  > {
    const validationResult =
      this.flatMessagingProviderValidatorService.validateFlatMessagingProviderDeletion(
        args,
      );

    if (validationResult.errors.length > 0) {
      return {
        status: 'fail',
        ...validationResult,
      };
    }

    const { flatEntityToValidate: flatMessagingProviderToValidate } = args;

    return {
      status: 'success',
      action: {
        type: 'delete',
        metadataName: 'messagingProvider',
        universalIdentifier:
          flatMessagingProviderToValidate.universalIdentifier,
      },
    };
  }

  protected validateFlatEntityUpdate(
    args: FlatEntityUpdateValidationArgs<
      typeof ALL_METADATA_NAME.messagingProvider
    >,
  ): UniversalFlatEntityValidationReturnType<
    typeof ALL_METADATA_NAME.messagingProvider,
    'update'
  > {
    const validationResult =
      this.flatMessagingProviderValidatorService.validateFlatMessagingProviderUpdate(
        args,
      );

    if (validationResult.errors.length > 0) {
      return {
        status: 'fail',
        ...validationResult,
      };
    }

    const { universalIdentifier, flatEntityUpdate } = args;

    const updateMessagingProviderAction: UniversalUpdateMessagingProviderAction =
      {
        type: 'update',
        metadataName: 'messagingProvider',
        universalIdentifier,
        update: flatEntityUpdate,
      };

    return {
      status: 'success',
      action: updateMessagingProviderAction,
    };
  }
}
