import { Injectable } from '@nestjs/common';

import { ALL_METADATA_NAME } from 'twenty-shared/metadata';

import { WorkspaceEntityMigrationBuilderService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/services/workspace-entity-migration-builder.service';
import { UniversalUpdateTimelineActivityRuleAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/timeline-activity-rule/types/workspace-migration-timeline-activity-rule-action.type';
import { FlatEntityUpdateValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-update-validation-args.type';
import { UniversalFlatEntityValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-validation-args.type';
import { UniversalFlatEntityValidationReturnType } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-validation-result.type';
import { FlatTimelineActivityRuleValidatorService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/services/flat-timeline-activity-rule-validator.service';

@Injectable()
export class WorkspaceMigrationTimelineActivityRuleActionsBuilderService extends WorkspaceEntityMigrationBuilderService<
  typeof ALL_METADATA_NAME.timelineActivityRule
> {
  constructor(
    private readonly flatTimelineActivityRuleValidatorService: FlatTimelineActivityRuleValidatorService,
  ) {
    super(ALL_METADATA_NAME.timelineActivityRule);
  }

  protected validateFlatEntityCreation(
    args: UniversalFlatEntityValidationArgs<
      typeof ALL_METADATA_NAME.timelineActivityRule
    >,
  ): UniversalFlatEntityValidationReturnType<
    typeof ALL_METADATA_NAME.timelineActivityRule,
    'create'
  > {
    const validationResult =
      this.flatTimelineActivityRuleValidatorService.validateFlatTimelineActivityRuleCreation(
        args,
      );

    if (validationResult.errors.length > 0) {
      return {
        status: 'fail',
        ...validationResult,
      };
    }

    const { flatEntityToValidate: flatTimelineActivityRuleToValidate } = args;

    return {
      status: 'success',
      action: {
        type: 'create',
        metadataName: 'timelineActivityRule',
        flatEntity: flatTimelineActivityRuleToValidate,
      },
    };
  }

  protected validateFlatEntityDeletion(
    args: UniversalFlatEntityValidationArgs<
      typeof ALL_METADATA_NAME.timelineActivityRule
    >,
  ): UniversalFlatEntityValidationReturnType<
    typeof ALL_METADATA_NAME.timelineActivityRule,
    'delete'
  > {
    const validationResult =
      this.flatTimelineActivityRuleValidatorService.validateFlatTimelineActivityRuleDeletion(
        args,
      );

    if (validationResult.errors.length > 0) {
      return {
        status: 'fail',
        ...validationResult,
      };
    }

    const { flatEntityToValidate: flatTimelineActivityRuleToValidate } = args;

    return {
      status: 'success',
      action: {
        type: 'delete',
        metadataName: 'timelineActivityRule',
        universalIdentifier:
          flatTimelineActivityRuleToValidate.universalIdentifier,
      },
    };
  }

  protected validateFlatEntityUpdate(
    args: FlatEntityUpdateValidationArgs<
      typeof ALL_METADATA_NAME.timelineActivityRule
    >,
  ): UniversalFlatEntityValidationReturnType<
    typeof ALL_METADATA_NAME.timelineActivityRule,
    'update'
  > {
    const validationResult =
      this.flatTimelineActivityRuleValidatorService.validateFlatTimelineActivityRuleUpdate(
        args,
      );

    if (validationResult.errors.length > 0) {
      return {
        status: 'fail',
        ...validationResult,
      };
    }

    const { universalIdentifier, flatEntityUpdate } = args;

    const updateTimelineActivityRuleAction: UniversalUpdateTimelineActivityRuleAction =
      {
        type: 'update',
        metadataName: 'timelineActivityRule',
        universalIdentifier,
        update: flatEntityUpdate,
      };

    return {
      status: 'success',
      action: updateTimelineActivityRuleAction,
    };
  }
}
