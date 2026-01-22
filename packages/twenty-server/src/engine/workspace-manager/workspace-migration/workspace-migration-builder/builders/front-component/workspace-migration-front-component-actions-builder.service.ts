import { Injectable } from '@nestjs/common';

import { ALL_METADATA_NAME } from 'twenty-shared/metadata';

import { UpdateFrontComponentAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/front-component/types/workspace-migration-front-component-action.type';
import { WorkspaceEntityMigrationBuilderService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/services/workspace-entity-migration-builder.service';
import { FlatEntityUpdateValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/flat-entity-update-validation-args.type';
import { FlatEntityValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/flat-entity-validation-args.type';
import { FlatEntityValidationReturnType } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/flat-entity-validation-result.type';
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
    args: FlatEntityValidationArgs<typeof ALL_METADATA_NAME.frontComponent>,
  ): FlatEntityValidationReturnType<
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
    args: FlatEntityValidationArgs<typeof ALL_METADATA_NAME.frontComponent>,
  ): FlatEntityValidationReturnType<
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
  ): FlatEntityValidationReturnType<
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

    const { flatEntityId, flatEntityUpdates } = args;

    const updateFrontComponentAction: UpdateFrontComponentAction = {
      type: 'update',
      metadataName: 'frontComponent',
      entityId: flatEntityId,
      updates: flatEntityUpdates,
    };

    return {
      status: 'success',
      action: updateFrontComponentAction,
    };
  }
}
