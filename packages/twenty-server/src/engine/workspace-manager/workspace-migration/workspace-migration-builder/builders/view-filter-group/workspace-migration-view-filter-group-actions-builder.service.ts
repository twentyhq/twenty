import { Injectable } from '@nestjs/common';

import { ALL_METADATA_NAME } from 'twenty-shared/metadata';

import { type UniversalUpdateViewFilterGroupAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/view-filter-group/types/workspace-migration-view-filter-group-action.type';
import { WorkspaceEntityMigrationBuilderService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/services/workspace-entity-migration-builder.service';
import { type FlatEntityUpdateValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-update-validation-args.type';
import { type UniversalFlatEntityValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-validation-args.type';
import { type UniversalFlatEntityValidationReturnType } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-validation-result.type';
import { FlatViewFilterGroupValidatorService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/services/flat-view-filter-group-validator.service';

@Injectable()
export class WorkspaceMigrationViewFilterGroupActionsBuilderService extends WorkspaceEntityMigrationBuilderService<
  typeof ALL_METADATA_NAME.viewFilterGroup
> {
  constructor(
    private readonly flatViewFilterGroupValidatorService: FlatViewFilterGroupValidatorService,
  ) {
    super(ALL_METADATA_NAME.viewFilterGroup);
  }

  protected validateFlatEntityCreation(
    args: UniversalFlatEntityValidationArgs<
      typeof ALL_METADATA_NAME.viewFilterGroup
    >,
  ): UniversalFlatEntityValidationReturnType<
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
    args: UniversalFlatEntityValidationArgs<
      typeof ALL_METADATA_NAME.viewFilterGroup
    >,
  ): UniversalFlatEntityValidationReturnType<
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
        universalIdentifier: flatViewFilterGroupToValidate.universalIdentifier,
      },
    };
  }

  protected validateFlatEntityUpdate(
    args: FlatEntityUpdateValidationArgs<
      typeof ALL_METADATA_NAME.viewFilterGroup
    >,
  ): UniversalFlatEntityValidationReturnType<
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

    const { universalIdentifier, flatEntityUpdate } = args;

    const updateViewFilterGroupAction: UniversalUpdateViewFilterGroupAction = {
      type: 'update',
      metadataName: 'viewFilterGroup',
      universalIdentifier,
      update: flatEntityUpdate,
    };

    return {
      status: 'success',
      action: updateViewFilterGroupAction,
    };
  }
}
