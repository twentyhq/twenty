import { Injectable } from '@nestjs/common';

import { ALL_METADATA_NAME } from 'twenty-shared/metadata';

import { UniversalUpdateFieldMetadataOptionAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/field-metadata-option/types/workspace-migration-field-metadata-option-action.type';
import { WorkspaceEntityMigrationBuilderService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/services/workspace-entity-migration-builder.service';
import { FlatEntityCreationValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-creation-validation-args.type';
import { FlatEntityUpdateValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-update-validation-args.type';
import { UniversalFlatEntityValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-validation-args.type';
import { UniversalFlatEntityValidationReturnType } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-validation-result.type';
import { FlatFieldMetadataOptionValidatorService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/services/flat-field-metadata-option-validator.service';

@Injectable()
export class WorkspaceMigrationFieldMetadataOptionActionsBuilderService extends WorkspaceEntityMigrationBuilderService<
  typeof ALL_METADATA_NAME.fieldMetadataOption
> {
  constructor(
    private readonly flatFieldMetadataOptionValidatorService: FlatFieldMetadataOptionValidatorService,
  ) {
    super(ALL_METADATA_NAME.fieldMetadataOption);
  }

  protected validateFlatEntityCreation(
    args: FlatEntityCreationValidationArgs<
      typeof ALL_METADATA_NAME.fieldMetadataOption
    >,
  ): UniversalFlatEntityValidationReturnType<
    typeof ALL_METADATA_NAME.fieldMetadataOption,
    'create'
  > {
    const validationResult =
      this.flatFieldMetadataOptionValidatorService.validateFlatFieldMetadataOptionCreation(
        args,
      );

    if (validationResult.errors.length > 0) {
      return {
        status: 'fail',
        ...validationResult,
      };
    }

    const { flatEntityToValidate: flatFieldMetadataOptionToValidate } = args;

    return {
      status: 'success',
      action: {
        type: 'create',
        metadataName: 'fieldMetadataOption',
        flatEntity: flatFieldMetadataOptionToValidate,
      },
    };
  }

  protected validateFlatEntityDeletion(
    args: UniversalFlatEntityValidationArgs<
      typeof ALL_METADATA_NAME.fieldMetadataOption
    >,
  ): UniversalFlatEntityValidationReturnType<
    typeof ALL_METADATA_NAME.fieldMetadataOption,
    'delete'
  > {
    const validationResult =
      this.flatFieldMetadataOptionValidatorService.validateFlatFieldMetadataOptionDeletion(
        args,
      );

    if (validationResult.errors.length > 0) {
      return {
        status: 'fail',
        ...validationResult,
      };
    }

    const { flatEntityToValidate: flatFieldMetadataOptionToValidate } = args;

    return {
      status: 'success',
      action: {
        type: 'delete',
        metadataName: 'fieldMetadataOption',
        universalIdentifier:
          flatFieldMetadataOptionToValidate.universalIdentifier,
      },
    };
  }

  protected validateFlatEntityUpdate(
    args: FlatEntityUpdateValidationArgs<
      typeof ALL_METADATA_NAME.fieldMetadataOption
    >,
  ): UniversalFlatEntityValidationReturnType<
    typeof ALL_METADATA_NAME.fieldMetadataOption,
    'update'
  > {
    const validationResult =
      this.flatFieldMetadataOptionValidatorService.validateFlatFieldMetadataOptionUpdate(
        args,
      );

    if (validationResult.errors.length > 0) {
      return {
        status: 'fail',
        ...validationResult,
      };
    }

    const { universalIdentifier, flatEntityUpdate } = args;

    const updateFieldMetadataOptionAction: UniversalUpdateFieldMetadataOptionAction =
      {
        type: 'update',
        metadataName: 'fieldMetadataOption',
        universalIdentifier,
        update: flatEntityUpdate,
      };

    return {
      status: 'success',
      action: updateFieldMetadataOptionAction,
    };
  }
}
