import { Injectable } from '@nestjs/common';

import { ALL_METADATA_NAME } from 'twenty-shared/metadata';

import { UniversalUpdateWorkflowVersionAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/workflow-version/types/workspace-migration-workflow-version-action.type';
import { WorkspaceEntityMigrationBuilderService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/services/workspace-entity-migration-builder.service';
import { FlatEntityUpdateValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-update-validation-args.type';
import { UniversalFlatEntityValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-validation-args.type';
import { UniversalFlatEntityValidationReturnType } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-validation-result.type';
import { FlatWorkflowVersionValidatorService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/services/flat-workflow-version-validator.service';

@Injectable()
export class WorkspaceMigrationWorkflowVersionActionsBuilderService extends WorkspaceEntityMigrationBuilderService<
  typeof ALL_METADATA_NAME.workflowVersion
> {
  constructor(
    private readonly flatWorkflowVersionValidatorService: FlatWorkflowVersionValidatorService,
  ) {
    super(ALL_METADATA_NAME.workflowVersion);
  }

  protected validateFlatEntityCreation(
    args: UniversalFlatEntityValidationArgs<
      typeof ALL_METADATA_NAME.workflowVersion
    >,
  ): UniversalFlatEntityValidationReturnType<
    typeof ALL_METADATA_NAME.workflowVersion,
    'create'
  > {
    const validationResult =
      this.flatWorkflowVersionValidatorService.validateFlatWorkflowVersionCreation(
        args,
      );

    if (validationResult.errors.length > 0) {
      return {
        status: 'fail',
        ...validationResult,
      };
    }

    const { flatEntityToValidate: flatWorkflowVersionToValidate } = args;

    return {
      status: 'success',
      action: {
        type: 'create',
        metadataName: 'workflowVersion',
        flatEntity: flatWorkflowVersionToValidate,
      },
    };
  }

  protected validateFlatEntityDeletion(
    args: UniversalFlatEntityValidationArgs<
      typeof ALL_METADATA_NAME.workflowVersion
    >,
  ): UniversalFlatEntityValidationReturnType<
    typeof ALL_METADATA_NAME.workflowVersion,
    'delete'
  > {
    const validationResult =
      this.flatWorkflowVersionValidatorService.validateFlatWorkflowVersionDeletion(
        args,
      );

    if (validationResult.errors.length > 0) {
      return {
        status: 'fail',
        ...validationResult,
      };
    }

    const { flatEntityToValidate: flatWorkflowVersionToValidate } = args;

    return {
      status: 'success',
      action: {
        type: 'delete',
        metadataName: 'workflowVersion',
        universalIdentifier: flatWorkflowVersionToValidate.universalIdentifier,
      },
    };
  }

  protected validateFlatEntityUpdate(
    args: FlatEntityUpdateValidationArgs<
      typeof ALL_METADATA_NAME.workflowVersion
    >,
  ): UniversalFlatEntityValidationReturnType<
    typeof ALL_METADATA_NAME.workflowVersion,
    'update'
  > {
    const validationResult =
      this.flatWorkflowVersionValidatorService.validateFlatWorkflowVersionUpdate(
        args,
      );

    if (validationResult.errors.length > 0) {
      return {
        status: 'fail',
        ...validationResult,
      };
    }

    const { universalIdentifier, flatEntityUpdate } = args;

    const updateWorkflowVersionAction: UniversalUpdateWorkflowVersionAction = {
      type: 'update',
      metadataName: 'workflowVersion',
      universalIdentifier,
      update: flatEntityUpdate,
    };

    return {
      status: 'success',
      action: updateWorkflowVersionAction,
    };
  }
}
