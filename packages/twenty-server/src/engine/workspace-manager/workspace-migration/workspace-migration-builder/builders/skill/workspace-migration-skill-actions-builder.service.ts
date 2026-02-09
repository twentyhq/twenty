import { Injectable } from '@nestjs/common';

import { ALL_METADATA_NAME } from 'twenty-shared/metadata';

import { UniversalUpdateSkillAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/skill/types/workspace-migration-skill-action.type';
import { WorkspaceEntityMigrationBuilderService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/services/workspace-entity-migration-builder.service';
import { FlatEntityUpdateValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-update-validation-args.type';
import { UniversalFlatEntityValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-validation-args.type';
import { UniversalFlatEntityValidationReturnType } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-validation-result.type';
import { FlatSkillValidatorService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/services/flat-skill-validator.service';

@Injectable()
export class WorkspaceMigrationSkillActionsBuilderService extends WorkspaceEntityMigrationBuilderService<
  typeof ALL_METADATA_NAME.skill
> {
  constructor(
    private readonly flatSkillValidatorService: FlatSkillValidatorService,
  ) {
    super(ALL_METADATA_NAME.skill);
  }

  protected validateFlatEntityCreation(
    args: UniversalFlatEntityValidationArgs<typeof ALL_METADATA_NAME.skill>,
  ): UniversalFlatEntityValidationReturnType<
    typeof ALL_METADATA_NAME.skill,
    'create'
  > {
    const validationResult =
      this.flatSkillValidatorService.validateFlatSkillCreation(args);

    if (validationResult.errors.length > 0) {
      return {
        status: 'fail',
        ...validationResult,
      };
    }

    const { flatEntityToValidate: flatSkillToValidate } = args;

    return {
      status: 'success',
      action: {
        type: 'create',
        metadataName: 'skill',
        flatEntity: flatSkillToValidate,
      },
    };
  }

  protected validateFlatEntityDeletion(
    args: UniversalFlatEntityValidationArgs<typeof ALL_METADATA_NAME.skill>,
  ): UniversalFlatEntityValidationReturnType<
    typeof ALL_METADATA_NAME.skill,
    'delete'
  > {
    const validationResult =
      this.flatSkillValidatorService.validateFlatSkillDeletion(args);

    if (validationResult.errors.length > 0) {
      return {
        status: 'fail',
        ...validationResult,
      };
    }

    const { flatEntityToValidate: flatSkillToValidate } = args;

    return {
      status: 'success',
      action: {
        type: 'delete',
        metadataName: 'skill',
        universalIdentifier: flatSkillToValidate.universalIdentifier,
      },
    };
  }

  protected validateFlatEntityUpdate(
    args: FlatEntityUpdateValidationArgs<typeof ALL_METADATA_NAME.skill>,
  ): UniversalFlatEntityValidationReturnType<
    typeof ALL_METADATA_NAME.skill,
    'update'
  > {
    const validationResult =
      this.flatSkillValidatorService.validateFlatSkillUpdate(args);

    if (validationResult.errors.length > 0) {
      return {
        status: 'fail',
        ...validationResult,
      };
    }

    const { universalIdentifier, flatEntityUpdate } = args;

    const updateSkillAction: UniversalUpdateSkillAction = {
      type: 'update',
      metadataName: 'skill',
      universalIdentifier,
      update: flatEntityUpdate,
    };

    return {
      status: 'success',
      action: updateSkillAction,
    };
  }
}
