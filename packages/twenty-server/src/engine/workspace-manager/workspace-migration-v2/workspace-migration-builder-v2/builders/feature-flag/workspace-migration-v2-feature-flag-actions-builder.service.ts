import { Injectable } from '@nestjs/common';

import { ALL_METADATA_NAME } from 'twenty-shared/metadata';

import { UpdateFeatureFlagAction } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/feature-flag/types/workspace-migration-feature-flag-action-v2.type';
import { WorkspaceEntityMigrationBuilderV2Service } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/services/workspace-entity-migration-builder-v2.service';
import { FlatEntityUpdateValidationArgs } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/flat-entity-update-validation-args.type';
import { FlatEntityValidationArgs } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/flat-entity-validation-args.type';
import { FlatEntityValidationReturnType } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/flat-entity-validation-result.type';
import { FlatFeatureFlagValidatorService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/validators/services/flat-feature-flag-validator.service';

@Injectable()
export class WorkspaceMigrationV2FeatureFlagActionsBuilderService extends WorkspaceEntityMigrationBuilderV2Service<
  typeof ALL_METADATA_NAME.featureFlag
> {
  constructor(
    private readonly flatFeatureFlagValidatorService: FlatFeatureFlagValidatorService,
  ) {
    super(ALL_METADATA_NAME.featureFlag);
  }

  protected async validateFlatEntityCreation(
    args: FlatEntityValidationArgs<typeof ALL_METADATA_NAME.featureFlag>,
  ): Promise<
    FlatEntityValidationReturnType<
      typeof ALL_METADATA_NAME.featureFlag,
      'created'
    >
  > {
    const validationResult =
      await this.flatFeatureFlagValidatorService.validateFlatFeatureFlagCreation(
        args,
      );

    if (validationResult.errors.length > 0) {
      return {
        status: 'fail',
        ...validationResult,
      };
    }

    const { flatEntityToValidate: flatFeatureFlagToValidate } = args;

    return {
      status: 'success',
      action: {
        type: 'create_feature_flag',
        featureFlag: flatFeatureFlagToValidate,
      },
    };
  }

  protected async validateFlatEntityDeletion(
    args: FlatEntityValidationArgs<typeof ALL_METADATA_NAME.featureFlag>,
  ): Promise<
    FlatEntityValidationReturnType<
      typeof ALL_METADATA_NAME.featureFlag,
      'deleted'
    >
  > {
    const validationResult =
      this.flatFeatureFlagValidatorService.validateFlatFeatureFlagDeletion(
        args,
      );

    if (validationResult.errors.length > 0) {
      return {
        status: 'fail',
        ...validationResult,
      };
    }

    const { flatEntityToValidate: flatFeatureFlagToValidate } = args;

    return {
      status: 'success',
      action: {
        type: 'delete_feature_flag',
        featureFlagId: flatFeatureFlagToValidate.id,
      },
    };
  }

  protected async validateFlatEntityUpdate(
    args: FlatEntityUpdateValidationArgs<typeof ALL_METADATA_NAME.featureFlag>,
  ): Promise<
    FlatEntityValidationReturnType<
      typeof ALL_METADATA_NAME.featureFlag,
      'updated'
    >
  > {
    const validationResult =
      this.flatFeatureFlagValidatorService.validateFlatFeatureFlagUpdate(args);

    if (validationResult.errors.length > 0) {
      return {
        status: 'fail',
        ...validationResult,
      };
    }

    const { flatEntityId, flatEntityUpdates } = args;

    const updateFeatureFlagAction: UpdateFeatureFlagAction = {
      type: 'update_feature_flag',
      featureFlagId: flatEntityId,
      updates: flatEntityUpdates,
    };

    return {
      status: 'success',
      action: updateFeatureFlagAction,
    };
  }
}
