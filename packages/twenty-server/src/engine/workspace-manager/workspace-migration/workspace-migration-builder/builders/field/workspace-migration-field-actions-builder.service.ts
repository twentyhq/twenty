import { Injectable } from '@nestjs/common';

import { ALL_METADATA_NAME } from 'twenty-shared/metadata';

import { UniversalUpdateFieldAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/field/types/workspace-migration-field-action';
import { WorkspaceEntityMigrationBuilderService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/services/workspace-entity-migration-builder.service';
import { FlatEntityUpdateValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/flat-entity-update-validation-args.type';
import { FlatEntityValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/flat-entity-validation-args.type';
import { FlatEntityValidationReturnType } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/flat-entity-validation-result.type';
import { FlatFieldMetadataValidatorService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/services/flat-field-metadata-validator.service';

@Injectable()
export class WorkspaceMigrationFieldActionsBuilderService extends WorkspaceEntityMigrationBuilderService<
  typeof ALL_METADATA_NAME.fieldMetadata
> {
  constructor(
    private readonly flatFieldValidatorService: FlatFieldMetadataValidatorService,
  ) {
    super(ALL_METADATA_NAME.fieldMetadata);
  }

  protected validateFlatEntityCreation(
    args: FlatEntityValidationArgs<typeof ALL_METADATA_NAME.fieldMetadata>,
  ): FlatEntityValidationReturnType<
    typeof ALL_METADATA_NAME.fieldMetadata,
    'create'
  > {
    const validationResult =
      this.flatFieldValidatorService.validateFlatFieldMetadataCreation(args);

    if (validationResult.errors.length > 0) {
      return {
        status: 'fail',
        ...validationResult,
      };
    }

    const { flatEntityToValidate: flatFieldMetadataToValidate } = args;

    const fieldIdByUniversalIdentifier = flatFieldMetadataToValidate.id
      ? {
          [flatFieldMetadataToValidate.universalIdentifier]:
            flatFieldMetadataToValidate.id,
        }
      : undefined;

    return {
      status: 'success',
      action: {
        type: 'create',
        metadataName: 'fieldMetadata',
        universalFlatFieldMetadatas: [flatFieldMetadataToValidate],
        fieldIdByUniversalIdentifier,
      },
    };
  }

  protected validateFlatEntityDeletion(
    args: FlatEntityValidationArgs<typeof ALL_METADATA_NAME.fieldMetadata>,
  ): FlatEntityValidationReturnType<
    typeof ALL_METADATA_NAME.fieldMetadata,
    'delete'
  > {
    const validationResult =
      this.flatFieldValidatorService.validateFlatFieldMetadataDeletion(args);

    if (validationResult.errors.length > 0) {
      return {
        status: 'fail',
        ...validationResult,
      };
    }

    const { flatEntityToValidate: flatFieldMetadataToValidate } = args;

    return {
      status: 'success',
      action: {
        type: 'delete',
        metadataName: 'fieldMetadata',
        universalIdentifier: flatFieldMetadataToValidate.universalIdentifier,
      },
    };
  }

  protected validateFlatEntityUpdate(
    args: FlatEntityUpdateValidationArgs<
      typeof ALL_METADATA_NAME.fieldMetadata
    >,
  ): FlatEntityValidationReturnType<
    typeof ALL_METADATA_NAME.fieldMetadata,
    'update'
  > {
    const validationResult =
      this.flatFieldValidatorService.validateFlatFieldMetadataUpdate(args);

    if (validationResult.errors.length > 0) {
      return {
        status: 'fail',
        ...validationResult,
      };
    }

    const { universalIdentifier, flatEntityUpdate } = args;

    const updateFieldAction: UniversalUpdateFieldAction = {
      type: 'update',
      metadataName: 'fieldMetadata',
      universalIdentifier,
      update: flatEntityUpdate,
    };

    return {
      status: 'success',
      action: updateFieldAction,
    };
  }
}
