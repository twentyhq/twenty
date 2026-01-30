import { Injectable } from '@nestjs/common';

import { ALL_METADATA_NAME } from 'twenty-shared/metadata';

import { UpdateViewGroupAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/view-group/types/workspace-migration-view-group-action.type';
import { WorkspaceEntityMigrationBuilderService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/services/workspace-entity-migration-builder.service';
import { FlatEntityUpdateValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/flat-entity-update-validation-args.type';
import { FlatEntityValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/flat-entity-validation-args.type';
import { FlatEntityValidationReturnType } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/flat-entity-validation-result.type';
import { FlatViewGroupValidatorService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/services/flat-view-group-validator.service';

@Injectable()
export class WorkspaceMigrationViewGroupActionsBuilderService extends WorkspaceEntityMigrationBuilderService<
  typeof ALL_METADATA_NAME.viewGroup
> {
  constructor(
    private readonly flatViewGroupValidatorService: FlatViewGroupValidatorService,
  ) {
    super(ALL_METADATA_NAME.viewGroup);
  }

  protected validateFlatEntityCreation(
    args: FlatEntityValidationArgs<typeof ALL_METADATA_NAME.viewGroup>,
  ): FlatEntityValidationReturnType<
    typeof ALL_METADATA_NAME.viewGroup,
    'create'
  > {
    const validationResult =
      this.flatViewGroupValidatorService.validateFlatViewGroupCreation(args);

    if (validationResult.errors.length > 0) {
      return {
        status: 'fail',
        ...validationResult,
      };
    }

    const { flatEntityToValidate: flatViewGroupToValidate } = args;

    return {
      status: 'success',
      action: {
        type: 'create',
        metadataName: 'viewGroup',
        flatEntity: flatViewGroupToValidate,
      },
    };
  }

  protected validateFlatEntityDeletion(
    args: FlatEntityValidationArgs<typeof ALL_METADATA_NAME.viewGroup>,
  ): FlatEntityValidationReturnType<
    typeof ALL_METADATA_NAME.viewGroup,
    'delete'
  > {
    const validationResult =
      this.flatViewGroupValidatorService.validateFlatViewGroupDeletion(args);

    if (validationResult.errors.length > 0) {
      return {
        status: 'fail',
        ...validationResult,
      };
    }

    const { flatEntityToValidate: flatViewGroupToValidate } = args;

    return {
      status: 'success',
      action: {
        type: 'delete',
        metadataName: 'viewGroup',
        universalIdentifier: flatViewGroupToValidate.universalIdentifier,
      },
    };
  }

  protected validateFlatEntityUpdate(
    args: FlatEntityUpdateValidationArgs<typeof ALL_METADATA_NAME.viewGroup>,
  ): FlatEntityValidationReturnType<
    typeof ALL_METADATA_NAME.viewGroup,
    'update'
  > {
    const validationResult =
      this.flatViewGroupValidatorService.validateFlatViewGroupUpdate(args);

    if (validationResult.errors.length > 0) {
      return {
        status: 'fail',
        ...validationResult,
      };
    }

    const { flatEntityId, flatEntityUpdates } = args;

    const updateViewGroupAction: UpdateViewGroupAction = {
      type: 'update',
      metadataName: 'viewGroup',
      entityId: flatEntityId,
      updates: flatEntityUpdates,
    };

    return {
      status: 'success',
      action: updateViewGroupAction,
    };
  }
}
