import { Injectable } from '@nestjs/common';

import { ALL_METADATA_NAME } from 'twenty-shared/metadata';

import { WorkspaceEntityMigrationBuilderService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/services/workspace-entity-migration-builder.service';
import { UniversalUpdateViewSortAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/view-sort/types/workspace-migration-view-sort-action.type';
import { FlatViewSortValidatorService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/services/flat-view-sort-validator.service';
import { UniversalFlatEntityValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-validation-args.type';
import { UniversalFlatEntityValidationReturnType } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-validation-result.type';
import { FlatEntityUpdateValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-update-validation-args.type';

@Injectable()
export class WorkspaceMigrationViewSortActionsBuilderService extends WorkspaceEntityMigrationBuilderService<
  typeof ALL_METADATA_NAME.viewSort
> {
  constructor(
    private readonly flatViewSortValidatorService: FlatViewSortValidatorService,
  ) {
    super(ALL_METADATA_NAME.viewSort);
  }

  protected validateFlatEntityCreation(
    args: UniversalFlatEntityValidationArgs<typeof ALL_METADATA_NAME.viewSort>,
  ): UniversalFlatEntityValidationReturnType<
    typeof ALL_METADATA_NAME.viewSort,
    'create'
  > {
    const validationResult =
      this.flatViewSortValidatorService.validateFlatViewSortCreation(args);

    if (validationResult.errors.length > 0) {
      return {
        status: 'fail',
        ...validationResult,
      };
    }

    const { flatEntityToValidate: flatViewSortToValidate } = args;

    return {
      status: 'success',
      action: {
        type: 'create',
        metadataName: 'viewSort',
        flatEntity: flatViewSortToValidate,
      },
    };
  }

  protected validateFlatEntityDeletion(
    args: UniversalFlatEntityValidationArgs<typeof ALL_METADATA_NAME.viewSort>,
  ): UniversalFlatEntityValidationReturnType<
    typeof ALL_METADATA_NAME.viewSort,
    'delete'
  > {
    const validationResult =
      this.flatViewSortValidatorService.validateFlatViewSortDeletion(args);

    if (validationResult.errors.length > 0) {
      return {
        status: 'fail',
        ...validationResult,
      };
    }

    const { flatEntityToValidate: flatViewSortToValidate } = args;

    return {
      status: 'success',
      action: {
        type: 'delete',
        metadataName: 'viewSort',
        universalIdentifier: flatViewSortToValidate.universalIdentifier,
      },
    };
  }

  protected validateFlatEntityUpdate(
    args: FlatEntityUpdateValidationArgs<typeof ALL_METADATA_NAME.viewSort>,
  ): UniversalFlatEntityValidationReturnType<
    typeof ALL_METADATA_NAME.viewSort,
    'update'
  > {
    const validationResult =
      this.flatViewSortValidatorService.validateFlatViewSortUpdate(args);

    if (validationResult.errors.length > 0) {
      return {
        status: 'fail',
        ...validationResult,
      };
    }

    const { universalIdentifier, flatEntityUpdate } = args;

    const updateViewSortAction: UniversalUpdateViewSortAction = {
      type: 'update',
      metadataName: 'viewSort',
      universalIdentifier,
      update: flatEntityUpdate,
    };

    return {
      status: 'success',
      action: updateViewSortAction,
    };
  }
}
