import { Injectable } from '@nestjs/common';

import { ALL_METADATA_NAME } from 'twenty-shared/metadata';

import { type UpdateViewFilterGroupAction } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/view-filter-group/types/workspace-migration-view-filter-group-action-v2.type';
import { WorkspaceEntityMigrationBuilderV2Service } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/services/workspace-entity-migration-builder-v2.service';
import { type FlatEntityUpdateValidationArgs } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/flat-entity-update-validation-args.type';
import { type FlatEntityValidationArgs } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/flat-entity-validation-args.type';
import { type FlatEntityValidationReturnType } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/flat-entity-validation-result.type';
import { FlatViewFilterGroupValidatorService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/validators/services/flat-view-filter-group-validator.service';

@Injectable()
export class WorkspaceMigrationV2ViewFilterGroupActionsBuilderService extends WorkspaceEntityMigrationBuilderV2Service<
  typeof ALL_METADATA_NAME.viewFilterGroup
> {
  constructor(
    private readonly flatViewFilterGroupValidatorService: FlatViewFilterGroupValidatorService,
  ) {
    super(ALL_METADATA_NAME.viewFilterGroup);
  }

  protected validateFlatEntityCreation(
    args: FlatEntityValidationArgs<typeof ALL_METADATA_NAME.viewFilterGroup>,
  ): FlatEntityValidationReturnType<
    typeof ALL_METADATA_NAME.viewFilterGroup,
    'create'
  > {
    const validationResult =
      this.flatViewFilterGroupValidatorService.validateFlatViewFilterGroupCreation(
        args,
      );

    if (validationResult.errors.length > 0) {
      return {
        status: 'fail',
        ...validationResult,
      };
    }

    const { flatEntityToValidate: flatViewFilterGroupToValidate } = args;

    return {
      status: 'success',
      action: {
        type: 'create',
        metadataName: 'viewFilterGroup',
        flatEntity: flatViewFilterGroupToValidate,
      },
    };
  }

  protected validateFlatEntityDeletion(
    args: FlatEntityValidationArgs<typeof ALL_METADATA_NAME.viewFilterGroup>,
  ): FlatEntityValidationReturnType<
    typeof ALL_METADATA_NAME.viewFilterGroup,
    'delete'
  > {
    const validationResult =
      this.flatViewFilterGroupValidatorService.validateFlatViewFilterGroupDeletion(
        args,
      );

    if (validationResult.errors.length > 0) {
      return {
        status: 'fail',
        ...validationResult,
      };
    }

    const { flatEntityToValidate: flatViewFilterGroupToValidate } = args;

    return {
      status: 'success',
      action: {
        type: 'delete',
        metadataName: 'viewFilterGroup',
        entityId: flatViewFilterGroupToValidate.id,
      },
    };
  }

  protected validateFlatEntityUpdate(
    args: FlatEntityUpdateValidationArgs<
      typeof ALL_METADATA_NAME.viewFilterGroup
    >,
  ): FlatEntityValidationReturnType<
    typeof ALL_METADATA_NAME.viewFilterGroup,
    'update'
  > {
    const validationResult =
      this.flatViewFilterGroupValidatorService.validateFlatViewFilterGroupUpdate(
        args,
      );

    if (validationResult.errors.length > 0) {
      return {
        status: 'fail',
        ...validationResult,
      };
    }

    const { flatEntityId, flatEntityUpdates } = args;

    const updateViewFilterGroupAction: UpdateViewFilterGroupAction = {
      type: 'update',
      metadataName: 'viewFilterGroup',
      entityId: flatEntityId,
      updates: flatEntityUpdates,
    };

    return {
      status: 'success',
      action: updateViewFilterGroupAction,
    };
  }
}
