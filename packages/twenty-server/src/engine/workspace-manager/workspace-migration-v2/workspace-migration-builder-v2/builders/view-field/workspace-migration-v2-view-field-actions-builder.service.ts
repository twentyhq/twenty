import { Injectable } from '@nestjs/common';

import { ALL_METADATA_NAME } from 'twenty-shared/metadata';

import { UpdateViewFieldAction } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/view-field/types/workspace-migration-view-field-action-v2.type';
import { WorkspaceEntityMigrationBuilderV2Service } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/services/workspace-entity-migration-builder-v2.service';
import { FlatEntityUpdateValidationArgs } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/flat-entity-update-validation-args.type';
import { FlatEntityValidationArgs } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/flat-entity-validation-args.type';
import { FlatEntityValidationReturnType } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/flat-entity-validation-result.type';
import { FlatViewFieldValidatorService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/validators/services/flat-view-field-validator.service';

@Injectable()
export class WorkspaceMigrationV2ViewFieldActionsBuilderService extends WorkspaceEntityMigrationBuilderV2Service<
  typeof ALL_METADATA_NAME.viewField
> {
  constructor(
    private readonly flatViewFieldValidatorService: FlatViewFieldValidatorService,
  ) {
    super(ALL_METADATA_NAME.viewField);
  }

  protected validateFlatEntityCreation(
    args: FlatEntityValidationArgs<typeof ALL_METADATA_NAME.viewField>,
  ): FlatEntityValidationReturnType<
    typeof ALL_METADATA_NAME.viewField,
    'create'
  > {
    const validationResult =
      this.flatViewFieldValidatorService.validateFlatViewFieldCreation(args);

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
        metadataName: 'viewField',
        flatEntity: args.flatEntityToValidate,
      },
    };
  }

  protected validateFlatEntityDeletion(
    args: FlatEntityValidationArgs<typeof ALL_METADATA_NAME.viewField>,
  ): FlatEntityValidationReturnType<
    typeof ALL_METADATA_NAME.viewField,
    'delete'
  > {
    const validationResult =
      this.flatViewFieldValidatorService.validateFlatViewFieldDeletion(args);

    if (validationResult.errors.length > 0) {
      return {
        status: 'fail',
        ...validationResult,
      };
    }

    const { flatEntityToValidate: flatViewFieldToValidate } = args;

    return {
      status: 'success',
      action: {
        type: 'delete',
        metadataName: 'viewField',
        entityId: flatViewFieldToValidate.id,
      },
    };
  }

  protected validateFlatEntityUpdate(
    args: FlatEntityUpdateValidationArgs<typeof ALL_METADATA_NAME.viewField>,
  ): FlatEntityValidationReturnType<
    typeof ALL_METADATA_NAME.viewField,
    'update'
  > {
    const validationResult =
      this.flatViewFieldValidatorService.validateFlatViewFieldUpdate(args);

    if (validationResult.errors.length > 0) {
      return {
        status: 'fail',
        ...validationResult,
      };
    }

    const { flatEntityId, flatEntityUpdates } = args;

    const updateViewFieldAction: UpdateViewFieldAction = {
      type: 'update',
      metadataName: 'viewField',
      entityId: flatEntityId,
      updates: flatEntityUpdates,
    };

    return {
      status: 'success',
      action: updateViewFieldAction,
    };
  }
}
