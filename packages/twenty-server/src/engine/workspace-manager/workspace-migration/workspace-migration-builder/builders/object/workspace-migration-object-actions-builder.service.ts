import { Injectable } from '@nestjs/common';

import { ALL_METADATA_NAME } from 'twenty-shared/metadata';

import { UniversalUpdateObjectAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/object/types/workspace-migration-object-action';
import { WorkspaceEntityMigrationBuilderService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/services/workspace-entity-migration-builder.service';
import { FlatEntityUpdateValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-update-validation-args.type';
import { UniversalFlatEntityValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-validation-args.type';
import { UniversalFlatEntityValidationReturnType } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-validation-result.type';
import { FlatObjectMetadataValidatorService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/services/flat-object-metadata-validator.service';

@Injectable()
export class WorkspaceMigrationObjectActionsBuilderService extends WorkspaceEntityMigrationBuilderService<
  typeof ALL_METADATA_NAME.objectMetadata
> {
  constructor(
    private readonly flatObjectValidatorService: FlatObjectMetadataValidatorService,
  ) {
    super(ALL_METADATA_NAME.objectMetadata);
  }

  protected validateFlatEntityCreation(
    args: UniversalFlatEntityValidationArgs<
      typeof ALL_METADATA_NAME.objectMetadata
    >,
  ): UniversalFlatEntityValidationReturnType<
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
        universalFlatFieldMetadatas: [],
        flatEntity: flatObjectMetadataToValidate,
      },
    };
  }

  protected validateFlatEntityDeletion(
    args: UniversalFlatEntityValidationArgs<
      typeof ALL_METADATA_NAME.objectMetadata
    >,
  ): UniversalFlatEntityValidationReturnType<
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
        universalIdentifier: flatObjectMetadataToValidate.universalIdentifier,
      },
    };
  }

  protected validateFlatEntityUpdate(
    args: FlatEntityUpdateValidationArgs<
      typeof ALL_METADATA_NAME.objectMetadata
    >,
  ): UniversalFlatEntityValidationReturnType<
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

    const { universalIdentifier, flatEntityUpdate } = args;

    const updateObjectAction: UniversalUpdateObjectAction = {
      type: 'update',
      metadataName: 'objectMetadata',
      universalIdentifier,
      update: flatEntityUpdate,
    };

    return {
      status: 'success',
      action: updateObjectAction,
    };
  }
}
