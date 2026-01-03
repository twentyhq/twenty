import { Injectable } from '@nestjs/common';

import { ALL_METADATA_NAME } from 'twenty-shared/metadata';

import { UpdatePageLayoutAction } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/page-layout/types/workspace-migration-page-layout-action-v2.type';
import { WorkspaceEntityMigrationBuilderV2Service } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/services/workspace-entity-migration-builder-v2.service';
import { FlatEntityUpdateValidationArgs } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/flat-entity-update-validation-args.type';
import { FlatEntityValidationArgs } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/flat-entity-validation-args.type';
import { FlatEntityValidationReturnType } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/flat-entity-validation-result.type';
import { FlatPageLayoutValidatorService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/validators/services/flat-page-layout-validator.service';

@Injectable()
export class WorkspaceMigrationV2PageLayoutActionsBuilderService extends WorkspaceEntityMigrationBuilderV2Service<
  typeof ALL_METADATA_NAME.pageLayout
> {
  constructor(
    private readonly flatPageLayoutValidatorService: FlatPageLayoutValidatorService,
  ) {
    super(ALL_METADATA_NAME.pageLayout);
  }

  protected async validateFlatEntityCreation(
    args: FlatEntityValidationArgs<typeof ALL_METADATA_NAME.pageLayout>,
  ): Promise<
    FlatEntityValidationReturnType<
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
    args: FlatEntityValidationArgs<typeof ALL_METADATA_NAME.pageLayout>,
  ): FlatEntityValidationReturnType<
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
        entityId: flatPageLayoutToValidate.id,
      },
    };
  }

  protected async validateFlatEntityUpdate(
    args: FlatEntityUpdateValidationArgs<typeof ALL_METADATA_NAME.pageLayout>,
  ): Promise<
    FlatEntityValidationReturnType<
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

    const { flatEntityId, flatEntityUpdates } = args;

    const updatePageLayoutAction: UpdatePageLayoutAction = {
      type: 'update',
      metadataName: 'pageLayout',
      entityId: flatEntityId,
      updates: flatEntityUpdates,
    };

    return {
      status: 'success',
      action: updatePageLayoutAction,
    };
  }
}
