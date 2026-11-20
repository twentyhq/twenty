import { Injectable } from '@nestjs/common';

import { ALL_METADATA_NAME } from 'twenty-shared/metadata';

import { UniversalUpdateJobGroupAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/job-group/types/workspace-migration-job-group-action.type';
import { WorkspaceEntityMigrationBuilderService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/services/workspace-entity-migration-builder.service';
import { FlatEntityCreationValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-creation-validation-args.type';
import { FlatEntityUpdateValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-update-validation-args.type';
import { UniversalFlatEntityValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-validation-args.type';
import { UniversalFlatEntityValidationReturnType } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-validation-result.type';
import { FlatJobGroupValidatorService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/services/flat-job-group-validator.service';

@Injectable()
export class WorkspaceMigrationJobGroupActionsBuilderService extends WorkspaceEntityMigrationBuilderService<
  typeof ALL_METADATA_NAME.jobGroup
> {
  constructor(
    private readonly flatJobGroupValidatorService: FlatJobGroupValidatorService,
  ) {
    super(ALL_METADATA_NAME.jobGroup);
  }

  protected validateFlatEntityCreation(
    args: FlatEntityCreationValidationArgs<typeof ALL_METADATA_NAME.jobGroup>,
  ): UniversalFlatEntityValidationReturnType<
    typeof ALL_METADATA_NAME.jobGroup,
    'create'
  > {
    const validationResult =
      this.flatJobGroupValidatorService.validateFlatJobGroupCreation(args);

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
        metadataName: 'jobGroup',
        flatEntity: args.flatEntityToValidate,
      },
    };
  }

  protected validateFlatEntityDeletion(
    args: UniversalFlatEntityValidationArgs<typeof ALL_METADATA_NAME.jobGroup>,
  ): UniversalFlatEntityValidationReturnType<
    typeof ALL_METADATA_NAME.jobGroup,
    'delete'
  > {
    const validationResult =
      this.flatJobGroupValidatorService.validateFlatJobGroupDeletion(args);

    if (validationResult.errors.length > 0) {
      return {
        status: 'fail',
        ...validationResult,
      };
    }

    return {
      status: 'success',
      action: {
        type: 'delete',
        metadataName: 'jobGroup',
        universalIdentifier: args.flatEntityToValidate.universalIdentifier,
      },
    };
  }

  protected validateFlatEntityUpdate(
    args: FlatEntityUpdateValidationArgs<typeof ALL_METADATA_NAME.jobGroup>,
  ): UniversalFlatEntityValidationReturnType<
    typeof ALL_METADATA_NAME.jobGroup,
    'update'
  > {
    const validationResult =
      this.flatJobGroupValidatorService.validateFlatJobGroupUpdate(args);

    if (validationResult.errors.length > 0) {
      return {
        status: 'fail',
        ...validationResult,
      };
    }

    const { universalIdentifier, flatEntityUpdate } = args;

    const updateJobGroupAction: UniversalUpdateJobGroupAction = {
      type: 'update',
      metadataName: 'jobGroup',
      universalIdentifier,
      update: flatEntityUpdate,
    };

    return {
      status: 'success',
      action: updateJobGroupAction,
    };
  }
}
