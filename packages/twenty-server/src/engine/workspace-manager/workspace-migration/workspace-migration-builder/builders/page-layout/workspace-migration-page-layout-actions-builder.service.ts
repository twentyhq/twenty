import { Injectable } from '@nestjs/common';

import { ALL_METADATA_NAME } from 'twenty-shared/metadata';

import { UniversalUpdatePageLayoutAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/page-layout/types/workspace-migration-page-layout-action.type';
import { WorkspaceEntityMigrationBuilderService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/services/workspace-entity-migration-builder.service';
import { FlatEntityUpdateValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-update-validation-args.type';
import { UniversalFlatEntityValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-validation-args.type';
import { UniversalFlatEntityValidationReturnType } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-validation-result.type';
import { FlatPageLayoutValidatorService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/services/flat-page-layout-validator.service';

@Injectable()
export class WorkspaceMigrationPageLayoutActionsBuilderService extends WorkspaceEntityMigrationBuilderService<
  typeof ALL_METADATA_NAME.pageLayout
> {
  constructor(
    private readonly flatPageLayoutValidatorService: FlatPageLayoutValidatorService,
  ) {
    super(ALL_METADATA_NAME.pageLayout);
  }

  protected async validateFlatEntityCreation(
    args: UniversalFlatEntityValidationArgs<
      typeof ALL_METADATA_NAME.pageLayout
    >,
  ): Promise<
    UniversalFlatEntityValidationReturnType<
      typeof ALL_METADATA_NAME.pageLayout,
      'create'
    >
  > {
    const validationResult =
      this.flatPageLayoutValidatorService.validateFlatPageLayoutCreation(args);

    if (validationResult.errors.length > 0) {
      return {
        status: 'fail',
        ...validationResult,
      };
    }

    const { flatEntityToValidate: flatPageLayoutToValidate } = args;

    return {
      status: 'success',
      action: {
        type: 'create',
        metadataName: 'pageLayout',
        flatEntity: flatPageLayoutToValidate,
      },
    };
  }

  protected validateFlatEntityDeletion(
    args: UniversalFlatEntityValidationArgs<
      typeof ALL_METADATA_NAME.pageLayout
    >,
  ): UniversalFlatEntityValidationReturnType<
    typeof ALL_METADATA_NAME.pageLayout,
    'delete'
  > {
    const validationResult =
      this.flatPageLayoutValidatorService.validateFlatPageLayoutDeletion(args);

    if (validationResult.errors.length > 0) {
      return {
        status: 'fail',
        ...validationResult,
      };
    }

    const { flatEntityToValidate: flatPageLayoutToValidate } = args;

    return {
      status: 'success',
      action: {
        type: 'delete',
        metadataName: 'pageLayout',
        universalIdentifier: flatPageLayoutToValidate.universalIdentifier,
      },
    };
  }

  protected async validateFlatEntityUpdate(
    args: FlatEntityUpdateValidationArgs<typeof ALL_METADATA_NAME.pageLayout>,
  ): Promise<
    UniversalFlatEntityValidationReturnType<
      typeof ALL_METADATA_NAME.pageLayout,
      'update'
    >
  > {
    const validationResult =
      this.flatPageLayoutValidatorService.validateFlatPageLayoutUpdate(args);

    if (validationResult.errors.length > 0) {
      return {
        status: 'fail',
        ...validationResult,
      };
    }

    const { universalIdentifier, flatEntityUpdate } = args;

    const updatePageLayoutAction: UniversalUpdatePageLayoutAction = {
      type: 'update',
      metadataName: 'pageLayout',
      universalIdentifier,
      update: flatEntityUpdate,
    };

    return {
      status: 'success',
      action: updatePageLayoutAction,
    };
  }
}
