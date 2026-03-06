import { Injectable } from '@nestjs/common';

import { ALL_METADATA_NAME } from 'twenty-shared/metadata';

import { UniversalUpdateFrontComponentAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/front-component/types/workspace-migration-front-component-action.type';
import { WorkspaceEntityMigrationBuilderService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/services/workspace-entity-migration-builder.service';
import { FlatEntityUpdateValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-update-validation-args.type';
import { UniversalFlatEntityValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-validation-args.type';
import { UniversalFlatEntityValidationReturnType } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-validation-result.type';
import { FlatFrontComponentValidatorService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/services/flat-front-component-validator.service';

@Injectable()
export class WorkspaceMigrationFrontComponentActionsBuilderService extends WorkspaceEntityMigrationBuilderService<
  typeof ALL_METADATA_NAME.frontComponent
> {
  constructor(
    private readonly flatFrontComponentValidatorService: FlatFrontComponentValidatorService,
  ) {
    super(ALL_METADATA_NAME.frontComponent);
  }

  protected validateFlatEntityCreation(
    args: UniversalFlatEntityValidationArgs<
      typeof ALL_METADATA_NAME.frontComponent
    >,
  ): UniversalFlatEntityValidationReturnType<
    typeof ALL_METADATA_NAME.frontComponent,
    'create'
  > {
    const validationResult =
      this.flatFrontComponentValidatorService.validateFlatFrontComponentCreation(
        args,
      );

    if (validationResult.errors.length > 0) {
      return {
        status: 'fail',
        ...validationResult,
      };
    }

    const { flatEntityToValidate: flatFrontComponentToValidate } = args;

    return {
      status: 'success',
      action: {
        type: 'create',
        metadataName: 'frontComponent',
        flatEntity: flatFrontComponentToValidate,
      },
    };
  }

  protected validateFlatEntityDeletion(
    args: UniversalFlatEntityValidationArgs<
      typeof ALL_METADATA_NAME.frontComponent
    >,
  ): UniversalFlatEntityValidationReturnType<
    typeof ALL_METADATA_NAME.frontComponent,
    'delete'
  > {
    const validationResult =
      this.flatFrontComponentValidatorService.validateFlatFrontComponentDeletion(
        args,
      );

    if (validationResult.errors.length > 0) {
      return {
        status: 'fail',
        ...validationResult,
      };
    }

    const { flatEntityToValidate: flatFrontComponentToValidate } = args;

    return {
      status: 'success',
      action: {
        type: 'delete',
        metadataName: 'frontComponent',
        universalIdentifier: flatFrontComponentToValidate.universalIdentifier,
      },
    };
  }

  protected validateFlatEntityUpdate(
    args: FlatEntityUpdateValidationArgs<
      typeof ALL_METADATA_NAME.frontComponent
    >,
  ): UniversalFlatEntityValidationReturnType<
    typeof ALL_METADATA_NAME.frontComponent,
    'update'
  > {
    const validationResult =
      this.flatFrontComponentValidatorService.validateFlatFrontComponentUpdate(
        args,
      );

    if (validationResult.errors.length > 0) {
      return {
        status: 'fail',
        ...validationResult,
      };
    }

    const { universalIdentifier, flatEntityUpdate } = args;

    const updateFrontComponentAction: UniversalUpdateFrontComponentAction = {
      type: 'update',
      metadataName: 'frontComponent',
      universalIdentifier,
      update: flatEntityUpdate,
    };

    return {
      status: 'success',
      action: updateFrontComponentAction,
    };
  }
}
