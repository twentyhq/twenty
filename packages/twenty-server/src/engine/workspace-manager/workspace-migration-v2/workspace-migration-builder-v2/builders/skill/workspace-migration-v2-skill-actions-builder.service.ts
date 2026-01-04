import { Injectable } from '@nestjs/common';

import { ALL_METADATA_NAME } from 'twenty-shared/metadata';

import { UpdateSkillAction } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/skill/types/workspace-migration-v2-skill-action.type';
import { WorkspaceEntityMigrationBuilderV2Service } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/services/workspace-entity-migration-builder-v2.service';
import { FlatEntityUpdateValidationArgs } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/flat-entity-update-validation-args.type';
import { FlatEntityValidationArgs } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/flat-entity-validation-args.type';
import { FlatEntityValidationReturnType } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/flat-entity-validation-result.type';
import { FlatSkillValidatorService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/validators/services/flat-skill-validator.service';

@Injectable()
export class WorkspaceMigrationV2SkillActionsBuilderService extends WorkspaceEntityMigrationBuilderV2Service<
  typeof ALL_METADATA_NAME.skill
> {
  constructor(
    private readonly flatSkillValidatorService: FlatSkillValidatorService,
  ) {
    super(ALL_METADATA_NAME.skill);
  }

  protected validateFlatEntityCreation(
    args: FlatEntityValidationArgs<typeof ALL_METADATA_NAME.skill>,
  ): FlatEntityValidationReturnType<typeof ALL_METADATA_NAME.skill, 'create'> {
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
    args: FlatEntityValidationArgs<typeof ALL_METADATA_NAME.skill>,
  ): FlatEntityValidationReturnType<typeof ALL_METADATA_NAME.skill, 'delete'> {
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
        entityId: flatSkillToValidate.id,
      },
    };
  }

  protected validateFlatEntityUpdate(
    args: FlatEntityUpdateValidationArgs<typeof ALL_METADATA_NAME.skill>,
  ): FlatEntityValidationReturnType<typeof ALL_METADATA_NAME.skill, 'update'> {
    const validationResult =
      this.flatSkillValidatorService.validateFlatSkillUpdate(args);

    if (validationResult.errors.length > 0) {
      return {
        status: 'fail',
        ...validationResult,
      };
    }

    const { flatEntityId, flatEntityUpdates } = args;

    const updateSkillAction: UpdateSkillAction = {
      type: 'update',
      metadataName: 'skill',
      entityId: flatEntityId,
      updates: flatEntityUpdates,
    };

    return {
      status: 'success',
      action: updateSkillAction,
    };
  }
}
