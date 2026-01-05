import { Injectable } from '@nestjs/common';

import { ALL_METADATA_NAME } from 'twenty-shared/metadata';

import { UpdatePageLayoutTabAction } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/page-layout-tab/types/workspace-migration-page-layout-tab-action-v2.type';
import { WorkspaceEntityMigrationBuilderV2Service } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/services/workspace-entity-migration-builder-v2.service';
import { FlatEntityUpdateValidationArgs } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/flat-entity-update-validation-args.type';
import { FlatEntityValidationArgs } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/flat-entity-validation-args.type';
import { FlatEntityValidationReturnType } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/flat-entity-validation-result.type';
import { FlatPageLayoutTabValidatorService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/validators/services/flat-page-layout-tab-validator.service';

@Injectable()
export class WorkspaceMigrationV2PageLayoutTabActionsBuilderService extends WorkspaceEntityMigrationBuilderV2Service<
  typeof ALL_METADATA_NAME.pageLayoutTab
> {
  constructor(
    private readonly flatPageLayoutTabValidatorService: FlatPageLayoutTabValidatorService,
  ) {
    super(ALL_METADATA_NAME.pageLayoutTab);
  }

  protected validateFlatEntityCreation(
    args: FlatEntityValidationArgs<typeof ALL_METADATA_NAME.pageLayoutTab>,
  ): FlatEntityValidationReturnType<
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
    args: FlatEntityValidationArgs<typeof ALL_METADATA_NAME.pageLayoutTab>,
  ): FlatEntityValidationReturnType<
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
        entityId: flatPageLayoutTabToValidate.id,
      },
    };
  }

  protected validateFlatEntityUpdate(
    args: FlatEntityUpdateValidationArgs<
      typeof ALL_METADATA_NAME.pageLayoutTab
    >,
  ): FlatEntityValidationReturnType<
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

    const { flatEntityId, flatEntityUpdates } = args;

    const updatePageLayoutTabAction: UpdatePageLayoutTabAction = {
      type: 'update',
      metadataName: 'pageLayoutTab',
      entityId: flatEntityId,
      updates: flatEntityUpdates,
    };

    return {
      status: 'success',
      action: updatePageLayoutTabAction,
    };
  }
}
