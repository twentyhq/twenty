import { Injectable } from '@nestjs/common';

import { ALL_METADATA_NAME } from 'twenty-shared/metadata';

import { UpdateViewFilterAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/view-filter/types/workspace-migration-view-filter-action.type';
import { WorkspaceEntityMigrationBuilderService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/services/workspace-entity-migration-builder.service';
import { FlatEntityUpdateValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/flat-entity-update-validation-args.type';
import { FlatEntityValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/flat-entity-validation-args.type';
import { FlatEntityValidationReturnType } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/flat-entity-validation-result.type';
import { FlatViewFilterValidatorService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/services/flat-view-filter-validator.service';

@Injectable()
export class WorkspaceMigrationViewFilterActionsBuilderService extends WorkspaceEntityMigrationBuilderService<
  typeof ALL_METADATA_NAME.viewFilter
> {
  constructor(
    private readonly flatViewFilterValidatorService: FlatViewFilterValidatorService,
  ) {
    super(ALL_METADATA_NAME.viewFilter);
  }

  protected validateFlatEntityCreation(
    args: FlatEntityValidationArgs<typeof ALL_METADATA_NAME.viewFilter>,
  ): FlatEntityValidationReturnType<
    typeof ALL_METADATA_NAME.viewFilter,
    'create'
  > {
    const validationResult =
      this.flatViewFilterValidatorService.validateFlatViewFilterCreation(args);

    if (validationResult.errors.length > 0) {
      return {
        status: 'fail',
        ...validationResult,
      };
    }

    const { flatEntityToValidate: flatViewFilterToValidate } = args;

    return {
      status: 'success',
      action: {
        type: 'create',
        metadataName: 'viewFilter',
        flatEntity: flatViewFilterToValidate,
      },
    };
  }

  protected validateFlatEntityDeletion(
    args: FlatEntityValidationArgs<typeof ALL_METADATA_NAME.viewFilter>,
  ): FlatEntityValidationReturnType<
    typeof ALL_METADATA_NAME.viewFilter,
    'delete'
  > {
    const validationResult =
      this.flatViewFilterValidatorService.validateFlatViewFilterDeletion(args);

    if (validationResult.errors.length > 0) {
      return {
        status: 'fail',
        ...validationResult,
      };
    }

    const { flatEntityToValidate: flatViewFilterToValidate } = args;

    return {
      status: 'success',
      action: {
        type: 'delete',
        metadataName: 'viewFilter',
        universalIdentifier: flatViewFilterToValidate.universalIdentifier,
      },
    };
  }

  protected validateFlatEntityUpdate(
    args: FlatEntityUpdateValidationArgs<typeof ALL_METADATA_NAME.viewFilter>,
  ): FlatEntityValidationReturnType<
    typeof ALL_METADATA_NAME.viewFilter,
    'update'
  > {
    const validationResult =
      this.flatViewFilterValidatorService.validateFlatViewFilterUpdate(args);

    if (validationResult.errors.length > 0) {
      return {
        status: 'fail',
        ...validationResult,
      };
    }

    const { flatEntityId, flatEntityUpdates } = args;

    const updateViewFilterAction: UpdateViewFilterAction = {
      type: 'update',
      metadataName: 'viewFilter',
      entityId: flatEntityId,
      updates: flatEntityUpdates,
    };

    return {
      status: 'success',
      action: updateViewFilterAction,
    };
  }
}
