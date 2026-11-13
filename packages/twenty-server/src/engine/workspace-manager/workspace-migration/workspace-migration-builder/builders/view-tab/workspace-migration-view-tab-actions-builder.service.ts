import { Injectable } from '@nestjs/common';

import { ALL_METADATA_NAME } from 'twenty-shared/metadata';

import { UniversalUpdateViewTabAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/view-tab/types/workspace-migration-view-tab-action.type';
import { WorkspaceEntityMigrationBuilderService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/services/workspace-entity-migration-builder.service';
import { FlatEntityUpdateValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-update-validation-args.type';
import { UniversalFlatEntityValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-validation-args.type';
import { UniversalFlatEntityValidationReturnType } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-validation-result.type';
import { FlatViewTabValidatorService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/services/flat-view-tab-validator.service';

@Injectable()
export class WorkspaceMigrationViewTabActionsBuilderService extends WorkspaceEntityMigrationBuilderService<
  typeof ALL_METADATA_NAME.viewTab
> {
  constructor(
    private readonly flatViewTabValidatorService: FlatViewTabValidatorService,
  ) {
    super(ALL_METADATA_NAME.viewTab);
  }

  protected validateFlatEntityCreation(
    args: UniversalFlatEntityValidationArgs<typeof ALL_METADATA_NAME.viewTab>,
  ): UniversalFlatEntityValidationReturnType<
    typeof ALL_METADATA_NAME.viewTab,
    'create'
  > {
    const validationResult =
      this.flatViewTabValidatorService.validateFlatViewTabCreation(args);

    if (validationResult.errors.length > 0) {
      return {
        status: 'fail',
        ...validationResult,
      };
    }

    const { flatEntityToValidate: flatViewTabToValidate } = args;

    return {
      status: 'success',
      action: {
        type: 'create',
        metadataName: 'viewTab',
        flatEntity: flatViewTabToValidate,
      },
    };
  }

  protected validateFlatEntityDeletion(
    args: UniversalFlatEntityValidationArgs<typeof ALL_METADATA_NAME.viewTab>,
  ): UniversalFlatEntityValidationReturnType<
    typeof ALL_METADATA_NAME.viewTab,
    'delete'
  > {
    const validationResult =
      this.flatViewTabValidatorService.validateFlatViewTabDeletion(args);

    if (validationResult.errors.length > 0) {
      return {
        status: 'fail',
        ...validationResult,
      };
    }

    const { flatEntityToValidate: flatViewTabToValidate } = args;

    return {
      status: 'success',
      action: {
        type: 'delete',
        metadataName: 'viewTab',
        universalIdentifier: flatViewTabToValidate.universalIdentifier,
      },
    };
  }

  protected validateFlatEntityUpdate(
    args: FlatEntityUpdateValidationArgs<typeof ALL_METADATA_NAME.viewTab>,
  ): UniversalFlatEntityValidationReturnType<
    typeof ALL_METADATA_NAME.viewTab,
    'update'
  > {
    const validationResult =
      this.flatViewTabValidatorService.validateFlatViewTabUpdate(args);

    if (validationResult.errors.length > 0) {
      return {
        status: 'fail',
        ...validationResult,
      };
    }

    const { universalIdentifier, flatEntityUpdate } = args;

    const updateViewTabAction: UniversalUpdateViewTabAction = {
      type: 'update',
      metadataName: 'viewTab',
      universalIdentifier,
      update: flatEntityUpdate,
    };

    return {
      status: 'success',
      action: updateViewTabAction,
    };
  }
}
