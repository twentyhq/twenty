import { Injectable } from '@nestjs/common';

import { ALL_METADATA_NAME } from 'twenty-shared/metadata';

import { UniversalUpdateWorkflowAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/workflow/types/workspace-migration-workflow-action.type';
import { WorkspaceEntityMigrationBuilderService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/services/workspace-entity-migration-builder.service';
import { FlatEntityUpdateValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-update-validation-args.type';
import { UniversalFlatEntityValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-validation-args.type';
import { UniversalFlatEntityValidationReturnType } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-validation-result.type';
import { FlatWorkflowValidatorService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/services/flat-workflow-validator.service';

@Injectable()
export class WorkspaceMigrationWorkflowActionsBuilderService extends WorkspaceEntityMigrationBuilderService<
  typeof ALL_METADATA_NAME.workflow
> {
  constructor(
    private readonly flatWorkflowValidatorService: FlatWorkflowValidatorService,
  ) {
    super(ALL_METADATA_NAME.workflow);
  }

  protected validateFlatEntityCreation(
    args: UniversalFlatEntityValidationArgs<
      typeof ALL_METADATA_NAME.workflow
    >,
  ): UniversalFlatEntityValidationReturnType<
    typeof ALL_METADATA_NAME.workflow,
    'create'
  > {
    const validationResult =
      this.flatWorkflowValidatorService.validateFlatWorkflowCreation(
        args,
      );

    if (validationResult.errors.length > 0) {
      return {
        status: 'fail',
        ...validationResult,
      };
    }

    const { flatEntityToValidate: flatWorkflowToValidate } = args;

    return {
      status: 'success',
      action: {
        type: 'create',
        metadataName: 'workflow',
        flatEntity: flatWorkflowToValidate,
      },
    };
  }

  protected validateFlatEntityDeletion(
    args: UniversalFlatEntityValidationArgs<
      typeof ALL_METADATA_NAME.workflow
    >,
  ): UniversalFlatEntityValidationReturnType<
    typeof ALL_METADATA_NAME.workflow,
    'delete'
  > {
    const validationResult =
      this.flatWorkflowValidatorService.validateFlatWorkflowDeletion(
        args,
      );

    if (validationResult.errors.length > 0) {
      return {
        status: 'fail',
        ...validationResult,
      };
    }

    const { flatEntityToValidate: flatWorkflowToValidate } = args;

    return {
      status: 'success',
      action: {
        type: 'delete',
        metadataName: 'workflow',
        universalIdentifier:
          flatWorkflowToValidate.universalIdentifier,
      },
    };
  }

  protected validateFlatEntityUpdate(
    args: FlatEntityUpdateValidationArgs<
      typeof ALL_METADATA_NAME.workflow
    >,
  ): UniversalFlatEntityValidationReturnType<
    typeof ALL_METADATA_NAME.workflow,
    'update'
  > {
    const validationResult =
      this.flatWorkflowValidatorService.validateFlatWorkflowUpdate(
        args,
      );

    if (validationResult.errors.length > 0) {
      return {
        status: 'fail',
        ...validationResult,
      };
    }

    const { universalIdentifier, flatEntityUpdate } = args;

    const updateWorkflowAction: UniversalUpdateWorkflowAction =
      {
        type: 'update',
        metadataName: 'workflow',
        universalIdentifier,
        update: flatEntityUpdate,
      };

    return {
      status: 'success',
      action: updateWorkflowAction,
    };
  }
}
