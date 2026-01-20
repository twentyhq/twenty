import { Injectable } from '@nestjs/common';

import { ALL_METADATA_NAME } from 'twenty-shared/metadata';

import { UpdatePageLayoutWidgetAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/page-layout-widget/types/workspace-migration-page-layout-widget-action.type';
import { WorkspaceEntityMigrationBuilderService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/services/workspace-entity-migration-builder.service';
import { FlatEntityUpdateValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/flat-entity-update-validation-args.type';
import { FlatEntityValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/flat-entity-validation-args.type';
import { FlatEntityValidationReturnType } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/flat-entity-validation-result.type';
import { FlatPageLayoutWidgetValidatorService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/services/flat-page-layout-widget-validator.service';

@Injectable()
export class WorkspaceMigrationPageLayoutWidgetActionsBuilderService extends WorkspaceEntityMigrationBuilderService<
  typeof ALL_METADATA_NAME.pageLayoutWidget
> {
  constructor(
    private readonly flatPageLayoutWidgetValidatorService: FlatPageLayoutWidgetValidatorService,
  ) {
    super(ALL_METADATA_NAME.pageLayoutWidget);
  }

  protected async validateFlatEntityCreation(
    args: FlatEntityValidationArgs<typeof ALL_METADATA_NAME.pageLayoutWidget>,
  ): Promise<
    FlatEntityValidationReturnType<
      typeof ALL_METADATA_NAME.pageLayoutWidget,
      'create'
    >
  > {
    const validationResult =
      await this.flatPageLayoutWidgetValidatorService.validateFlatPageLayoutWidgetCreation(
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
        universalIdentifier: flatPageLayoutWidgetToValidate.universalIdentifier,
      },
    };
  }

  protected async validateFlatEntityUpdate(
    args: FlatEntityUpdateValidationArgs<
      typeof ALL_METADATA_NAME.pageLayoutWidget
    >,
  ): Promise<
    FlatEntityValidationReturnType<
      typeof ALL_METADATA_NAME.pageLayoutWidget,
      'update'
    >
  > {
    const validationResult =
      await this.flatPageLayoutWidgetValidatorService.validateFlatPageLayoutWidgetUpdate(
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
