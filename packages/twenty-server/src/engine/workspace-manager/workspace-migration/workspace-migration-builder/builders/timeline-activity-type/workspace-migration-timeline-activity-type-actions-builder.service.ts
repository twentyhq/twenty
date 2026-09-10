import { Injectable } from '@nestjs/common';

import { ALL_METADATA_NAME } from 'twenty-shared/metadata';

import { UniversalUpdateTimelineActivityTypeAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/timeline-activity-type/types/workspace-migration-timeline-activity-type-action.type';
import { WorkspaceEntityMigrationBuilderService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/services/workspace-entity-migration-builder.service';
import { FlatEntityUpdateValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-update-validation-args.type';
import { UniversalFlatEntityValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-validation-args.type';
import { UniversalFlatEntityValidationReturnType } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-validation-result.type';
import { FlatTimelineActivityTypeValidatorService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/services/flat-timeline-activity-type-validator.service';

@Injectable()
export class WorkspaceMigrationTimelineActivityTypeActionsBuilderService extends WorkspaceEntityMigrationBuilderService<
  typeof ALL_METADATA_NAME.timelineActivityType
> {
  constructor(
    private readonly flatTimelineActivityTypeValidatorService: FlatTimelineActivityTypeValidatorService,
  ) {
    super(ALL_METADATA_NAME.timelineActivityType);
  }

  protected validateFlatEntityCreation(
    args: UniversalFlatEntityValidationArgs<
      typeof ALL_METADATA_NAME.timelineActivityType
    >,
  ): UniversalFlatEntityValidationReturnType<
    typeof ALL_METADATA_NAME.timelineActivityType,
    'create'
  > {
    const validationResult =
      this.flatTimelineActivityTypeValidatorService.validateFlatTimelineActivityTypeCreation(
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
        metadataName: 'timelineActivityType',
        flatEntity: args.flatEntityToValidate,
      },
    };
  }

  protected validateFlatEntityDeletion(
    args: UniversalFlatEntityValidationArgs<
      typeof ALL_METADATA_NAME.timelineActivityType
    >,
  ): UniversalFlatEntityValidationReturnType<
    typeof ALL_METADATA_NAME.timelineActivityType,
    'delete'
  > {
    const validationResult =
      this.flatTimelineActivityTypeValidatorService.validateFlatTimelineActivityTypeDeletion(
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
        type: 'delete',
        metadataName: 'timelineActivityType',
        universalIdentifier: args.flatEntityToValidate.universalIdentifier,
      },
    };
  }

  protected validateFlatEntityUpdate(
    args: FlatEntityUpdateValidationArgs<
      typeof ALL_METADATA_NAME.timelineActivityType
    >,
  ): UniversalFlatEntityValidationReturnType<
    typeof ALL_METADATA_NAME.timelineActivityType,
    'update'
  > {
    const validationResult =
      this.flatTimelineActivityTypeValidatorService.validateFlatTimelineActivityTypeUpdate(
        args,
      );

    if (validationResult.errors.length > 0) {
      return {
        status: 'fail',
        ...validationResult,
      };
    }

    const { universalIdentifier, flatEntityUpdate } = args;

    const updateTimelineActivityTypeAction: UniversalUpdateTimelineActivityTypeAction =
      {
        type: 'update',
        metadataName: 'timelineActivityType',
        universalIdentifier,
        update: flatEntityUpdate,
      };

    return {
      status: 'success',
      action: updateTimelineActivityTypeAction,
    };
  }
}
