import { Injectable } from '@nestjs/common';

import { ALL_METADATA_NAME } from 'twenty-shared/metadata';

import { UniversalUpdateSettingPageAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/setting-page/types/workspace-migration-setting-page-action.type';
import { WorkspaceEntityMigrationBuilderService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/services/workspace-entity-migration-builder.service';
import { FlatEntityUpdateValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-update-validation-args.type';
import { UniversalFlatEntityValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-validation-args.type';
import { UniversalFlatEntityValidationReturnType } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-validation-result.type';
import { FlatSettingPageValidatorService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/services/flat-setting-page-validator.service';

@Injectable()
export class WorkspaceMigrationSettingPageActionsBuilderService extends WorkspaceEntityMigrationBuilderService<
  typeof ALL_METADATA_NAME.settingPage
> {
  constructor(
    private readonly flatSettingPageValidatorService: FlatSettingPageValidatorService,
  ) {
    super(ALL_METADATA_NAME.settingPage);
  }

  protected validateFlatEntityCreation(
    args: UniversalFlatEntityValidationArgs<
      typeof ALL_METADATA_NAME.settingPage
    >,
  ): UniversalFlatEntityValidationReturnType<
    typeof ALL_METADATA_NAME.settingPage,
    'create'
  > {
    const validationResult =
      this.flatSettingPageValidatorService.validateFlatSettingPageCreation(
        args,
      );

    if (validationResult.errors.length > 0) {
      return {
        status: 'fail',
        ...validationResult,
      };
    }

    return {
      status: 'success',
      action: {
        type: 'create',
        metadataName: 'settingPage',
        flatEntity: args.flatEntityToValidate,
      },
    };
  }

  protected validateFlatEntityDeletion(
    args: UniversalFlatEntityValidationArgs<
      typeof ALL_METADATA_NAME.settingPage
    >,
  ): UniversalFlatEntityValidationReturnType<
    typeof ALL_METADATA_NAME.settingPage,
    'delete'
  > {
    const validationResult =
      this.flatSettingPageValidatorService.validateFlatSettingPageDeletion(
        args,
      );

    if (validationResult.errors.length > 0) {
      return {
        status: 'fail',
        ...validationResult,
      };
    }

    return {
      status: 'success',
      action: {
        type: 'delete',
        metadataName: 'settingPage',
        universalIdentifier: args.flatEntityToValidate.universalIdentifier,
      },
    };
  }

  protected validateFlatEntityUpdate(
    args: FlatEntityUpdateValidationArgs<typeof ALL_METADATA_NAME.settingPage>,
  ): UniversalFlatEntityValidationReturnType<
    typeof ALL_METADATA_NAME.settingPage,
    'update'
  > {
    const validationResult =
      this.flatSettingPageValidatorService.validateFlatSettingPageUpdate(args);

    if (validationResult.errors.length > 0) {
      return {
        status: 'fail',
        ...validationResult,
      };
    }

    const { universalIdentifier, flatEntityUpdate } = args;

    const updateSettingPageAction: UniversalUpdateSettingPageAction = {
      type: 'update',
      metadataName: 'settingPage',
      universalIdentifier,
      update: flatEntityUpdate,
    };

    return {
      status: 'success',
      action: updateSettingPageAction,
    };
  }
}
