import { Injectable } from '@nestjs/common';

import { ALL_METADATA_NAME } from 'twenty-shared/metadata';

import { UpdateObjectAction } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/object/types/workspace-migration-object-action-v2';
import { WorkspaceEntityMigrationBuilderV2Service } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/services/workspace-entity-migration-builder-v2.service';
import { FlatEntityUpdateValidationArgs } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/flat-entity-update-validation-args.type';
import { FlatEntityValidationArgs } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/flat-entity-validation-args.type';
import { FlatEntityValidationReturnType } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/flat-entity-validation-result.type';
import { FlatObjectMetadataValidatorService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/validators/services/flat-object-metadata-validator.service';

@Injectable()
export class WorkspaceMigrationV2ObjectActionsBuilderService extends WorkspaceEntityMigrationBuilderV2Service<
  typeof ALL_METADATA_NAME.objectMetadata
> {
  constructor(
    private readonly flatObjectValidatorService: FlatObjectMetadataValidatorService,
  ) {
    super(ALL_METADATA_NAME.objectMetadata);
  }

  protected async validateFlatEntityCreation(
    args: FlatEntityValidationArgs<typeof ALL_METADATA_NAME.objectMetadata>,
  ): Promise<
    FlatEntityValidationReturnType<
      typeof ALL_METADATA_NAME.objectMetadata,
      'created'
    >
  > {
    const validationResult =
      await this.flatObjectValidatorService.validateFlatObjectMetadataCreation(
        args,
      );

    if (validationResult.errors.length > 0) {
      return {
        status: 'fail',
        ...validationResult,
      };
    }

    const { flatEntityToValidate: flatObjectMetadataToValidate } = args;

    return {
      status: 'success',
      action: {
        type: 'create_object',
        flatFieldMetadatas: [],
        flatObjectMetadata: flatObjectMetadataToValidate,
      },
    };
  }

  protected async validateFlatEntityDeletion(
    args: FlatEntityValidationArgs<typeof ALL_METADATA_NAME.objectMetadata>,
  ): Promise<
    FlatEntityValidationReturnType<
      typeof ALL_METADATA_NAME.objectMetadata,
      'deleted'
    >
  > {
    const validationResult =
      this.flatObjectValidatorService.validateFlatObjectMetadataDeletion(args);

    if (validationResult.errors.length > 0) {
      return {
        status: 'fail',
        ...validationResult,
      };
    }

    const { flatEntityToValidate: flatObjectMetadataToValidate } = args;

    return {
      status: 'success',
      action: {
        type: 'delete_object',
        objectMetadataId: flatObjectMetadataToValidate.id,
      },
    };
  }

  protected async validateFlatEntityUpdate(
    args: FlatEntityUpdateValidationArgs<
      typeof ALL_METADATA_NAME.objectMetadata
    >,
  ): Promise<
    FlatEntityValidationReturnType<
      typeof ALL_METADATA_NAME.objectMetadata,
      'updated'
    >
  > {
    const validationResult =
      this.flatObjectValidatorService.validateFlatObjectMetadataUpdate(args);

    if (validationResult.errors.length > 0) {
      return {
        status: 'fail',
        ...validationResult,
      };
    }

    const { flatEntityId, flatEntityUpdates } = args;

    const updateObjectAction: UpdateObjectAction = {
      type: 'update_object',
      objectMetadataId: flatEntityId,
      updates: flatEntityUpdates,
    };

    return {
      status: 'success',
      action: updateObjectAction,
    };
  }
}
