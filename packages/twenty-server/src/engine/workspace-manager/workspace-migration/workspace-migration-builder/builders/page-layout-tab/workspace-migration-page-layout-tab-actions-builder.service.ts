import { Injectable } from '@nestjs/common';

import { ALL_METADATA_NAME } from 'twenty-shared/metadata';

import { UniversalUpdatePageLayoutTabAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/page-layout-tab/types/workspace-migration-page-layout-tab-action.type';
import { WorkspaceEntityMigrationBuilderService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/services/workspace-entity-migration-builder.service';
import { FlatEntityUpdateValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-update-validation-args.type';
import { UniversalFlatEntityValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-validation-args.type';
import { UniversalFlatEntityValidationReturnType } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-validation-result.type';
import { FlatPageLayoutTabValidatorService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/services/flat-page-layout-tab-validator.service';

@Injectable()
export class WorkspaceMigrationPageLayoutTabActionsBuilderService extends WorkspaceEntityMigrationBuilderService<
  typeof ALL_METADATA_NAME.pageLayoutTab
> {
  constructor(
    private readonly flatPageLayoutTabValidatorService: FlatPageLayoutTabValidatorService,
  ) {
    super(ALL_METADATA_NAME.pageLayoutTab);
  }

  protected validateFlatEntityCreation(
    args: UniversalFlatEntityValidationArgs<
      typeof ALL_METADATA_NAME.pageLayoutTab
    >,
  ): UniversalFlatEntityValidationReturnType<
    typeof ALL_METADATA_NAME.pageLayoutTab,
    'create'
  > {
    const validationResult =
      this.flatPageLayoutTabValidatorService.validateFlatPageLayoutTabCreation(
        args,
      );

    if (validationResult.errors.length > 0) {
      return {
        status: 'fail',
        ...validationResult,
      };
    }

    const { flatEntityToValidate: flatPageLayoutTabToValidate } = args;

    return {
      status: 'success',
      action: {
        type: 'create',
        metadataName: 'pageLayoutTab',
        flatEntity: flatPageLayoutTabToValidate,
      },
    };
  }

  protected validateFlatEntityDeletion(
    args: UniversalFlatEntityValidationArgs<
      typeof ALL_METADATA_NAME.pageLayoutTab
    >,
  ): UniversalFlatEntityValidationReturnType<
    typeof ALL_METADATA_NAME.pageLayoutTab,
    'delete'
  > {
    const validationResult =
      this.flatPageLayoutTabValidatorService.validateFlatPageLayoutTabDeletion(
        args,
      );

    if (validationResult.errors.length > 0) {
      return {
        status: 'fail',
        ...validationResult,
      };
    }

    const { flatEntityToValidate: flatPageLayoutTabToValidate } = args;

    return {
      status: 'success',
      action: {
        type: 'delete',
        metadataName: 'pageLayoutTab',
        universalIdentifier: flatPageLayoutTabToValidate.universalIdentifier,
      },
    };
  }

  protected validateFlatEntityUpdate(
    args: FlatEntityUpdateValidationArgs<
      typeof ALL_METADATA_NAME.pageLayoutTab
    >,
  ): UniversalFlatEntityValidationReturnType<
    typeof ALL_METADATA_NAME.pageLayoutTab,
    'update'
  > {
    const validationResult =
      this.flatPageLayoutTabValidatorService.validateFlatPageLayoutTabUpdate(
        args,
      );

    if (validationResult.errors.length > 0) {
      return {
        status: 'fail',
        ...validationResult,
      };
    }

    const { universalIdentifier, flatEntityUpdate } = args;

    const updatePageLayoutTabAction: UniversalUpdatePageLayoutTabAction = {
      type: 'update',
      metadataName: 'pageLayoutTab',
      universalIdentifier,
      update: flatEntityUpdate,
    };

    return {
      status: 'success',
      action: updatePageLayoutTabAction,
    };
  }
}
