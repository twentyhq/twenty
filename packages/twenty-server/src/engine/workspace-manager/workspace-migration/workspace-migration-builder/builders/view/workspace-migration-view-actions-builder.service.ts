import { Injectable } from '@nestjs/common';

import { ALL_METADATA_NAME } from 'twenty-shared/metadata';

import { UpdateViewAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/view/types/workspace-migration-view-action.type';
import { WorkspaceEntityMigrationBuilderService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/services/workspace-entity-migration-builder.service';
import { FlatEntityUpdateValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/flat-entity-update-validation-args.type';
import { FlatEntityValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/flat-entity-validation-args.type';
import { FlatEntityValidationReturnType } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/flat-entity-validation-result.type';
import { FlatViewValidatorService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/services/flat-view-validator.service';

@Injectable()
export class WorkspaceMigrationViewActionsBuilderService extends WorkspaceEntityMigrationBuilderService<
  typeof ALL_METADATA_NAME.view
> {
  constructor(
    private readonly flatViewValidatorService: FlatViewValidatorService,
  ) {
    super(ALL_METADATA_NAME.view);
  }

  protected validateFlatEntityCreation(
    args: FlatEntityValidationArgs<typeof ALL_METADATA_NAME.view>,
  ): FlatEntityValidationReturnType<typeof ALL_METADATA_NAME.view, 'create'> {
    const validationResult =
      this.flatViewValidatorService.validateFlatViewCreation(args);

    if (validationResult.errors.length > 0) {
      return {
        status: 'fail',
        ...validationResult,
      };
    }

    const { flatEntityToValidate: flatViewToValidate } = args;

    return {
      status: 'success',
      action: {
        type: 'create',
        metadataName: 'view',
        flatEntity: flatViewToValidate,
      },
    };
  }

  protected validateFlatEntityDeletion(
    args: FlatEntityValidationArgs<typeof ALL_METADATA_NAME.view>,
  ): FlatEntityValidationReturnType<typeof ALL_METADATA_NAME.view, 'delete'> {
    const validationResult =
      this.flatViewValidatorService.validateFlatViewDeletion(args);

    if (validationResult.errors.length > 0) {
      return {
        status: 'fail',
        ...validationResult,
      };
    }

    const { flatEntityToValidate: flatViewToValidate } = args;

    return {
      status: 'success',
      action: {
        type: 'delete',
        metadataName: 'view',
        universalIdentifier: flatViewToValidate.universalIdentifier,
      },
    };
  }

  protected validateFlatEntityUpdate(
    args: FlatEntityUpdateValidationArgs<typeof ALL_METADATA_NAME.view>,
  ): FlatEntityValidationReturnType<typeof ALL_METADATA_NAME.view, 'update'> {
    const validationResult =
      this.flatViewValidatorService.validateFlatViewUpdate(args);

    if (validationResult.errors.length > 0) {
      return {
        status: 'fail',
        ...validationResult,
      };
    }

    const { flatEntityId, flatEntityUpdates } = args;

    const updateViewAction: UpdateViewAction = {
      type: 'update',
      metadataName: 'view',
      entityId: flatEntityId,
      updates: flatEntityUpdates,
    };

    return {
      status: 'success',
      action: updateViewAction,
    };
  }
}
