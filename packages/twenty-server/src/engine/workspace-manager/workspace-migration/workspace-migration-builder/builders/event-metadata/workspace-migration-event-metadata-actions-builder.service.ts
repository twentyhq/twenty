import { Injectable } from '@nestjs/common';

import { ALL_METADATA_NAME } from 'twenty-shared/metadata';

import { UniversalUpdateEventMetadataAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/event-metadata/types/workspace-migration-event-metadata-action.type';
import { WorkspaceEntityMigrationBuilderService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/services/workspace-entity-migration-builder.service';
import { FlatEntityUpdateValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-update-validation-args.type';
import { UniversalFlatEntityValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-validation-args.type';
import { UniversalFlatEntityValidationReturnType } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-validation-result.type';
import { FlatEventMetadataValidatorService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/services/flat-event-metadata-validator.service';

@Injectable()
export class WorkspaceMigrationEventMetadataActionsBuilderService extends WorkspaceEntityMigrationBuilderService<
  typeof ALL_METADATA_NAME.eventMetadata
> {
  constructor(
    private readonly flatEventMetadataValidatorService: FlatEventMetadataValidatorService,
  ) {
    super(ALL_METADATA_NAME.eventMetadata);
  }

  protected validateFlatEntityCreation(
    args: UniversalFlatEntityValidationArgs<
      typeof ALL_METADATA_NAME.eventMetadata
    >,
  ): UniversalFlatEntityValidationReturnType<
    typeof ALL_METADATA_NAME.eventMetadata,
    'create'
  > {
    const validationResult =
      this.flatEventMetadataValidatorService.validateFlatEventMetadataCreation(
        args,
      );

    if (validationResult.errors.length > 0) {
      return {
        status: 'fail',
        ...validationResult,
      };
    }

    const { flatEntityToValidate: flatEventMetadataToValidate } = args;

    return {
      status: 'success',
      action: {
        type: 'create',
        metadataName: 'eventMetadata',
        flatEntity: flatEventMetadataToValidate,
      },
    };
  }

  protected validateFlatEntityDeletion(
    args: UniversalFlatEntityValidationArgs<
      typeof ALL_METADATA_NAME.eventMetadata
    >,
  ): UniversalFlatEntityValidationReturnType<
    typeof ALL_METADATA_NAME.eventMetadata,
    'delete'
  > {
    const validationResult =
      this.flatEventMetadataValidatorService.validateFlatEventMetadataDeletion(
        args,
      );

    if (validationResult.errors.length > 0) {
      return {
        status: 'fail',
        ...validationResult,
      };
    }

    const { flatEntityToValidate: flatEventMetadataToValidate } = args;

    return {
      status: 'success',
      action: {
        type: 'delete',
        metadataName: 'eventMetadata',
        universalIdentifier: flatEventMetadataToValidate.universalIdentifier,
      },
    };
  }

  protected validateFlatEntityUpdate(
    args: FlatEntityUpdateValidationArgs<
      typeof ALL_METADATA_NAME.eventMetadata
    >,
  ): UniversalFlatEntityValidationReturnType<
    typeof ALL_METADATA_NAME.eventMetadata,
    'update'
  > {
    const validationResult =
      this.flatEventMetadataValidatorService.validateFlatEventMetadataUpdate(
        args,
      );

    if (validationResult.errors.length > 0) {
      return {
        status: 'fail',
        ...validationResult,
      };
    }

    const { universalIdentifier, flatEntityUpdate } = args;

    const updateEventMetadataAction: UniversalUpdateEventMetadataAction = {
      type: 'update',
      metadataName: 'eventMetadata',
      universalIdentifier,
      update: flatEntityUpdate,
    };

    return {
      status: 'success',
      action: updateEventMetadataAction,
    };
  }
}
