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

  protected validateFlatEntityCreation(
    args: FlatEntityValidationArgs<typeof ALL_METADATA_NAME.objectMetadata>,
  ): FlatEntityValidationReturnType<
    typeof ALL_METADATA_NAME.objectMetadata,
    'create'
  > {
    const validationResult =
      this.flatObjectValidatorService.validateFlatObjectMetadataCreation(args);

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
        type: 'create',
        metadataName: 'objectMetadata',
        flatFieldMetadatas: [],
        flatEntity: flatObjectMetadataToValidate,
      },
    };
  }

  protected validateFlatEntityDeletion(
    args: FlatEntityValidationArgs<typeof ALL_METADATA_NAME.objectMetadata>,
  ): FlatEntityValidationReturnType<
    typeof ALL_METADATA_NAME.objectMetadata,
    'delete'
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
        type: 'delete',
        metadataName: 'objectMetadata',
        entityId: flatObjectMetadataToValidate.id,
      },
    };
  }

  protected validateFlatEntityUpdate(
    args: FlatEntityUpdateValidationArgs<
      typeof ALL_METADATA_NAME.objectMetadata
    >,
  ): FlatEntityValidationReturnType<
    typeof ALL_METADATA_NAME.objectMetadata,
    'update'
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
      type: 'update',
      metadataName: 'objectMetadata',
      entityId: flatEntityId,
      updates: flatEntityUpdates,
    };

    return {
      status: 'success',
      action: updateObjectAction,
    };
  }
}
