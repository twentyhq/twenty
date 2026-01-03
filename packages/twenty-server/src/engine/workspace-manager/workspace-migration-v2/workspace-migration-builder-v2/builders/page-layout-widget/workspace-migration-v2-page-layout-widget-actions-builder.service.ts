import { Injectable } from '@nestjs/common';

import { ALL_METADATA_NAME } from 'twenty-shared/metadata';

import { UpdatePageLayoutWidgetAction } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/page-layout-widget/types/workspace-migration-page-layout-widget-action-v2.type';
import { WorkspaceEntityMigrationBuilderV2Service } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/services/workspace-entity-migration-builder-v2.service';
import { FlatEntityUpdateValidationArgs } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/flat-entity-update-validation-args.type';
import { FlatEntityValidationArgs } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/flat-entity-validation-args.type';
import { FlatEntityValidationReturnType } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/flat-entity-validation-result.type';
import { FlatPageLayoutWidgetValidatorService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/validators/services/flat-page-layout-widget-validator.service';

@Injectable()
export class WorkspaceMigrationV2PageLayoutWidgetActionsBuilderService extends WorkspaceEntityMigrationBuilderV2Service<
  typeof ALL_METADATA_NAME.pageLayoutWidget
> {
  constructor(
    private readonly flatPageLayoutWidgetValidatorService: FlatPageLayoutWidgetValidatorService,
  ) {
    super(ALL_METADATA_NAME.pageLayoutWidget);
  }

  protected validateFlatEntityCreation(
    args: FlatEntityValidationArgs<typeof ALL_METADATA_NAME.pageLayoutWidget>,
  ): FlatEntityValidationReturnType<
    typeof ALL_METADATA_NAME.pageLayoutWidget,
    'create'
  > {
    const validationResult =
      this.flatPageLayoutWidgetValidatorService.validateFlatPageLayoutWidgetCreation(
        args,
      );

    if (validationResult.errors.length > 0) {
      return {
        status: 'fail',
        ...validationResult,
      };
    }

    return {
      status: 'success',
      action: {
        type: 'create',
        metadataName: 'pageLayoutWidget',
        flatEntity: args.flatEntityToValidate,
      },
    };
  }

  protected validateFlatEntityDeletion(
    args: FlatEntityValidationArgs<typeof ALL_METADATA_NAME.pageLayoutWidget>,
  ): FlatEntityValidationReturnType<
    typeof ALL_METADATA_NAME.pageLayoutWidget,
    'delete'
  > {
    const validationResult =
      this.flatPageLayoutWidgetValidatorService.validateFlatPageLayoutWidgetDeletion(
        args,
      );

    if (validationResult.errors.length > 0) {
      return {
        status: 'fail',
        ...validationResult,
      };
    }

    const { flatEntityToValidate: flatPageLayoutWidgetToValidate } = args;

    return {
      status: 'success',
      action: {
        type: 'delete',
        metadataName: 'pageLayoutWidget',
        entityId: flatPageLayoutWidgetToValidate.id,
      },
    };
  }

  protected validateFlatEntityUpdate(
    args: FlatEntityUpdateValidationArgs<
      typeof ALL_METADATA_NAME.pageLayoutWidget
    >,
  ): FlatEntityValidationReturnType<
    typeof ALL_METADATA_NAME.pageLayoutWidget,
    'update'
  > {
    const validationResult =
      this.flatPageLayoutWidgetValidatorService.validateFlatPageLayoutWidgetUpdate(
        args,
      );

    if (validationResult.errors.length > 0) {
      return {
        status: 'fail',
        ...validationResult,
      };
    }

    const { flatEntityId, flatEntityUpdates } = args;

    const updatePageLayoutWidgetAction: UpdatePageLayoutWidgetAction = {
      type: 'update',
      metadataName: 'pageLayoutWidget',
      entityId: flatEntityId,
      updates: flatEntityUpdates,
    };

    return {
      status: 'success',
      action: updatePageLayoutWidgetAction,
    };
  }
}
