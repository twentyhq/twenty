import { Injectable } from '@nestjs/common';

import { ALL_METADATA_NAME } from 'twenty-shared/metadata';

import { UniversalUpdateConnectionProviderAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/connection-provider/types/workspace-migration-connection-provider-action.type';
import { WorkspaceEntityMigrationBuilderService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/services/workspace-entity-migration-builder.service';
import { FlatEntityUpdateValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-update-validation-args.type';
import { UniversalFlatEntityValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-validation-args.type';
import { UniversalFlatEntityValidationReturnType } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-validation-result.type';
import { FlatConnectionProviderValidatorService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/services/flat-connection-provider-validator.service';

@Injectable()
export class WorkspaceMigrationConnectionProviderActionsBuilderService extends WorkspaceEntityMigrationBuilderService<
  typeof ALL_METADATA_NAME.connectionProvider
> {
  constructor(
    private readonly flatConnectionProviderValidatorService: FlatConnectionProviderValidatorService,
  ) {
    super(ALL_METADATA_NAME.connectionProvider);
  }

  protected validateFlatEntityCreation(
    args: UniversalFlatEntityValidationArgs<
      typeof ALL_METADATA_NAME.connectionProvider
    >,
  ): UniversalFlatEntityValidationReturnType<
    typeof ALL_METADATA_NAME.connectionProvider,
    'create'
  > {
    const validationResult =
      this.flatConnectionProviderValidatorService.validateFlatConnectionProviderCreation(
        args,
      );

    if (validationResult.errors.length > 0) {
      return {
        status: 'fail',
        ...validationResult,
      };
    }

    const { flatEntityToValidate: flatConnectionProviderToValidate } = args;

    return {
      status: 'success',
      action: {
        type: 'create',
        metadataName: 'connectionProvider',
        flatEntity: flatConnectionProviderToValidate,
      },
    };
  }

  protected validateFlatEntityDeletion(
    args: UniversalFlatEntityValidationArgs<
      typeof ALL_METADATA_NAME.connectionProvider
    >,
  ): UniversalFlatEntityValidationReturnType<
    typeof ALL_METADATA_NAME.connectionProvider,
    'delete'
  > {
    const validationResult =
      this.flatConnectionProviderValidatorService.validateFlatConnectionProviderDeletion(
        args,
      );

    if (validationResult.errors.length > 0) {
      return {
        status: 'fail',
        ...validationResult,
      };
    }

    const { flatEntityToValidate: flatConnectionProviderToValidate } = args;

    return {
      status: 'success',
      action: {
        type: 'delete',
        metadataName: 'connectionProvider',
        universalIdentifier:
          flatConnectionProviderToValidate.universalIdentifier,
      },
    };
  }

  protected validateFlatEntityUpdate(
    args: FlatEntityUpdateValidationArgs<
      typeof ALL_METADATA_NAME.connectionProvider
    >,
  ): UniversalFlatEntityValidationReturnType<
    typeof ALL_METADATA_NAME.connectionProvider,
    'update'
  > {
    const validationResult =
      this.flatConnectionProviderValidatorService.validateFlatConnectionProviderUpdate(
        args,
      );

    if (validationResult.errors.length > 0) {
      return {
        status: 'fail',
        ...validationResult,
      };
    }

    const { universalIdentifier, flatEntityUpdate } = args;

    const updateConnectionProviderAction: UniversalUpdateConnectionProviderAction =
      {
        type: 'update',
        metadataName: 'connectionProvider',
        universalIdentifier,
        update: flatEntityUpdate,
      };

    return {
      status: 'success',
      action: updateConnectionProviderAction,
    };
  }
}
