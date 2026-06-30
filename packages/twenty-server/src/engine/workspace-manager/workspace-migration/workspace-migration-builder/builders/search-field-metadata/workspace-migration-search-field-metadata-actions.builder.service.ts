import { Injectable } from '@nestjs/common';

import { ALL_METADATA_NAME } from 'twenty-shared/metadata';

import { UniversalUpdateSearchFieldMetadataAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/search-field-metadata/types/workspace-migration-search-field-metadata-action.type';
import { FlatEntityUpdateValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-update-validation-args.type';
import { UniversalFlatEntityValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-validation-args.type';
import { UniversalFlatEntityValidationReturnType } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-validation-result.type';
import { WorkspaceEntityMigrationBuilderService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/services/workspace-entity-migration-builder.service';
import { FlatSearchFieldMetadataValidatorService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/services/flat-search-field-metadata-validator.service';

@Injectable()
export class WorkspaceMigrationSearchFieldMetadataActionsBuilderService extends WorkspaceEntityMigrationBuilderService<
  typeof ALL_METADATA_NAME.searchFieldMetadata
> {
  constructor(
    private readonly flatSearchFieldMetadataValidatorService: FlatSearchFieldMetadataValidatorService,
  ) {
    super(ALL_METADATA_NAME.searchFieldMetadata);
  }

  protected validateFlatEntityCreation(
    args: UniversalFlatEntityValidationArgs<
      typeof ALL_METADATA_NAME.searchFieldMetadata
    >,
  ): UniversalFlatEntityValidationReturnType<
    typeof ALL_METADATA_NAME.searchFieldMetadata,
    'create'
  > {
    const validationResult =
      this.flatSearchFieldMetadataValidatorService.validateFlatSearchFieldMetadataCreation(
        args,
      );

    if (validationResult.errors.length > 0) {
      return {
        status: 'fail',
        ...validationResult,
      };
    }

    const { flatEntityToValidate: flatSearchFieldMetadataToValidate } = args;

    return {
      status: 'success',
      action: {
        type: 'create',
        metadataName: 'searchFieldMetadata',
        flatEntity: flatSearchFieldMetadataToValidate,
      },
    };
  }

  protected validateFlatEntityDeletion(
    args: UniversalFlatEntityValidationArgs<
      typeof ALL_METADATA_NAME.searchFieldMetadata
    >,
  ): UniversalFlatEntityValidationReturnType<
    typeof ALL_METADATA_NAME.searchFieldMetadata,
    'delete'
  > {
    const validationResult =
      this.flatSearchFieldMetadataValidatorService.validateFlatSearchFieldMetadataDeletion(
        args,
      );

    if (validationResult.errors.length > 0) {
      return {
        status: 'fail',
        ...validationResult,
      };
    }

    const { flatEntityToValidate: flatSearchFieldMetadataToValidate } = args;

    return {
      status: 'success',
      action: {
        type: 'delete',
        metadataName: 'searchFieldMetadata',
        universalIdentifier:
          flatSearchFieldMetadataToValidate.universalIdentifier,
      },
    };
  }

  protected validateFlatEntityUpdate(
    args: FlatEntityUpdateValidationArgs<
      typeof ALL_METADATA_NAME.searchFieldMetadata
    >,
  ): UniversalFlatEntityValidationReturnType<
    typeof ALL_METADATA_NAME.searchFieldMetadata,
    'update'
  > {
    const validationResult =
      this.flatSearchFieldMetadataValidatorService.validateFlatSearchFieldMetadataUpdate(
        args,
      );

    if (validationResult.errors.length > 0) {
      return {
        status: 'fail',
        ...validationResult,
      };
    }

    const { universalIdentifier, flatEntityUpdate } = args;

    const updateSearchFieldMetadataAction: UniversalUpdateSearchFieldMetadataAction =
      {
        type: 'update',
        metadataName: 'searchFieldMetadata',
        universalIdentifier,
        update: flatEntityUpdate,
      };

    return {
      status: 'success',
      action: updateSearchFieldMetadataAction,
    };
  }
}
