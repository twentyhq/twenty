import { Injectable } from '@nestjs/common';

import { ALL_METADATA_NAME } from 'twenty-shared/metadata';

import { UniversalUpdateViewAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/view/types/workspace-migration-view-action.type';
import { WorkspaceEntityMigrationBuilderService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/services/workspace-entity-migration-builder.service';
import { FlatEntityUpdateValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-update-validation-args.type';
import { UniversalFlatEntityValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-validation-args.type';
import { UniversalFlatEntityValidationReturnType } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-validation-result.type';
import { validateFlatViewCreation } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/utils/validate-flat-view-creation.util';
import { validateFlatViewDeletion } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/utils/validate-flat-view-deletion.util';
import { validateFlatViewUpdate } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/utils/validate-flat-view-update.util';

@Injectable()
export class WorkspaceMigrationViewActionsBuilderService extends WorkspaceEntityMigrationBuilderService<
  typeof ALL_METADATA_NAME.view
> {
  constructor() {
    super(ALL_METADATA_NAME.view);
  }

  protected validateFlatEntityCreation(
    args: UniversalFlatEntityValidationArgs<typeof ALL_METADATA_NAME.view>,
  ): UniversalFlatEntityValidationReturnType<
    typeof ALL_METADATA_NAME.view,
    'create'
  > {
    const validationResult = validateFlatViewCreation(args);

    if (validationResult.errors.length > 0) {
      return {
        status: 'fail',
        ...validationResult,
      };
    }

    const { flatEntityToValidate: flatViewToValidate } = args;

    return {
      status: 'success',
      action: {
        type: 'create',
        metadataName: 'view',
        flatEntity: flatViewToValidate,
      },
    };
  }

  protected validateFlatEntityDeletion(
    args: UniversalFlatEntityValidationArgs<typeof ALL_METADATA_NAME.view>,
  ): UniversalFlatEntityValidationReturnType<
    typeof ALL_METADATA_NAME.view,
    'delete'
  > {
    const validationResult = validateFlatViewDeletion(args);

    if (validationResult.errors.length > 0) {
      return {
        status: 'fail',
        ...validationResult,
      };
    }

    const { flatEntityToValidate: flatViewToValidate } = args;

    return {
      status: 'success',
      action: {
        type: 'delete',
        metadataName: 'view',
        universalIdentifier: flatViewToValidate.universalIdentifier,
      },
    };
  }

  protected validateFlatEntityUpdate(
    args: FlatEntityUpdateValidationArgs<typeof ALL_METADATA_NAME.view>,
  ): UniversalFlatEntityValidationReturnType<
    typeof ALL_METADATA_NAME.view,
    'update'
  > {
    const validationResult = validateFlatViewUpdate(args);

    if (validationResult.errors.length > 0) {
      return {
        status: 'fail',
        ...validationResult,
      };
    }

    const { universalIdentifier, flatEntityUpdate } = args;

    const updateViewAction: UniversalUpdateViewAction = {
      type: 'update',
      metadataName: 'view',
      universalIdentifier,
      update: flatEntityUpdate,
    };

    return {
      status: 'success',
      action: updateViewAction,
    };
  }
}
