/* @license Enterprise */

import { Injectable } from '@nestjs/common';

import { ALL_METADATA_NAME } from 'twenty-shared/metadata';

import { UniversalUpdateRelatedRecordPathAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/related-record-path/types/workspace-migration-related-record-path-action.type';
import { WorkspaceEntityMigrationBuilderService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/services/workspace-entity-migration-builder.service';
import { FlatEntityUpdateValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-update-validation-args.type';
import { UniversalFlatEntityValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-validation-args.type';
import { UniversalFlatEntityValidationReturnType } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-validation-result.type';
import { FlatRelatedRecordPathValidatorService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/services/flat-related-record-path-validator.service';

@Injectable()
export class WorkspaceMigrationRelatedRecordPathActionsBuilderService extends WorkspaceEntityMigrationBuilderService<
  typeof ALL_METADATA_NAME.relatedRecordPath
> {
  constructor(
    private readonly flatRelatedRecordPathValidatorService: FlatRelatedRecordPathValidatorService,
  ) {
    super(ALL_METADATA_NAME.relatedRecordPath);
  }

  protected validateFlatEntityCreation(
    args: UniversalFlatEntityValidationArgs<
      typeof ALL_METADATA_NAME.relatedRecordPath
    >,
  ): UniversalFlatEntityValidationReturnType<
    typeof ALL_METADATA_NAME.relatedRecordPath,
    'create'
  > {
    const validationResult =
      this.flatRelatedRecordPathValidatorService.validateFlatRelatedRecordPathCreation(
        args,
      );

    if (validationResult.errors.length > 0) {
      return {
        status: 'fail',
        ...validationResult,
      };
    }

    const { flatEntityToValidate: flatRelatedRecordPathToValidate } = args;

    return {
      status: 'success',
      action: {
        type: 'create',
        metadataName: 'relatedRecordPath',
        flatEntity: flatRelatedRecordPathToValidate,
      },
    };
  }

  protected validateFlatEntityDeletion(
    args: UniversalFlatEntityValidationArgs<
      typeof ALL_METADATA_NAME.relatedRecordPath
    >,
  ): UniversalFlatEntityValidationReturnType<
    typeof ALL_METADATA_NAME.relatedRecordPath,
    'delete'
  > {
    const validationResult =
      this.flatRelatedRecordPathValidatorService.validateFlatRelatedRecordPathDeletion(
        args,
      );

    if (validationResult.errors.length > 0) {
      return {
        status: 'fail',
        ...validationResult,
      };
    }

    const { flatEntityToValidate: flatRelatedRecordPathToValidate } = args;

    return {
      status: 'success',
      action: {
        type: 'delete',
        metadataName: 'relatedRecordPath',
        universalIdentifier:
          flatRelatedRecordPathToValidate.universalIdentifier,
      },
    };
  }

  protected validateFlatEntityUpdate(
    args: FlatEntityUpdateValidationArgs<
      typeof ALL_METADATA_NAME.relatedRecordPath
    >,
  ): UniversalFlatEntityValidationReturnType<
    typeof ALL_METADATA_NAME.relatedRecordPath,
    'update'
  > {
    const validationResult =
      this.flatRelatedRecordPathValidatorService.validateFlatRelatedRecordPathUpdate(
        args,
      );

    if (validationResult.errors.length > 0) {
      return {
        status: 'fail',
        ...validationResult,
      };
    }

    const { universalIdentifier, flatEntityUpdate } = args;

    const updateRelatedRecordPathAction: UniversalUpdateRelatedRecordPathAction =
      {
        type: 'update',
        metadataName: 'relatedRecordPath',
        universalIdentifier,
        update: flatEntityUpdate,
      };

    return {
      status: 'success',
      action: updateRelatedRecordPathAction,
    };
  }
}
