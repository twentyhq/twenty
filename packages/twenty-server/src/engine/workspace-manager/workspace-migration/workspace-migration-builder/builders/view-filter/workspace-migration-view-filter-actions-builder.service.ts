import { Injectable } from '@nestjs/common';

import { ALL_METADATA_NAME } from 'twenty-shared/metadata';

import { UniversalUpdateViewFilterAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/view-filter/types/workspace-migration-view-filter-action.type';
import { WorkspaceEntityMigrationBuilderService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/services/workspace-entity-migration-builder.service';
import { FlatEntityUpdateValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-update-validation-args.type';
import { UniversalFlatEntityValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-validation-args.type';
import { UniversalFlatEntityValidationReturnType } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-validation-result.type';
import { validateFlatViewFilterCreation } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/utils/validate-flat-view-filter-creation.util';
import { validateFlatViewFilterDeletion } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/utils/validate-flat-view-filter-deletion.util';
import { validateFlatViewFilterUpdate } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/utils/validate-flat-view-filter-update.util';

@Injectable()
export class WorkspaceMigrationViewFilterActionsBuilderService extends WorkspaceEntityMigrationBuilderService<
  typeof ALL_METADATA_NAME.viewFilter
> {
  constructor() {
    super(ALL_METADATA_NAME.viewFilter);
  }

  protected validateFlatEntityCreation(
    args: UniversalFlatEntityValidationArgs<
      typeof ALL_METADATA_NAME.viewFilter
    >,
  ): UniversalFlatEntityValidationReturnType<
    typeof ALL_METADATA_NAME.viewFilter,
    'create'
  > {
    const validationResult = validateFlatViewFilterCreation(args);

    if (validationResult.errors.length > 0) {
      return {
        status: 'fail',
        ...validationResult,
      };
    }

    const { flatEntityToValidate: flatViewFilterToValidate } = args;

    return {
      status: 'success',
      action: {
        type: 'create',
        metadataName: 'viewFilter',
        flatEntity: flatViewFilterToValidate,
      },
    };
  }

  protected validateFlatEntityDeletion(
    args: UniversalFlatEntityValidationArgs<
      typeof ALL_METADATA_NAME.viewFilter
    >,
  ): UniversalFlatEntityValidationReturnType<
    typeof ALL_METADATA_NAME.viewFilter,
    'delete'
  > {
    const validationResult = validateFlatViewFilterDeletion(args);

    if (validationResult.errors.length > 0) {
      return {
        status: 'fail',
        ...validationResult,
      };
    }

    const { flatEntityToValidate: flatViewFilterToValidate } = args;

    return {
      status: 'success',
      action: {
        type: 'delete',
        metadataName: 'viewFilter',
        universalIdentifier: flatViewFilterToValidate.universalIdentifier,
      },
    };
  }

  protected validateFlatEntityUpdate(
    args: FlatEntityUpdateValidationArgs<typeof ALL_METADATA_NAME.viewFilter>,
  ): UniversalFlatEntityValidationReturnType<
    typeof ALL_METADATA_NAME.viewFilter,
    'update'
  > {
    const validationResult = validateFlatViewFilterUpdate(args);

    if (validationResult.errors.length > 0) {
      return {
        status: 'fail',
        ...validationResult,
      };
    }

    const { universalIdentifier, flatEntityUpdate } = args;

    const updateViewFilterAction: UniversalUpdateViewFilterAction = {
      type: 'update',
      metadataName: 'viewFilter',
      universalIdentifier,
      update: flatEntityUpdate,
    };

    return {
      status: 'success',
      action: updateViewFilterAction,
    };
  }
}
