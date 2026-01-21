import { Injectable } from '@nestjs/common';

import { ALL_METADATA_NAME } from 'twenty-shared/metadata';

import { UpdateAgentAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/agent/types/workspace-migration-agent-action-builder.service';
import { WorkspaceEntityMigrationBuilderService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/services/workspace-entity-migration-builder.service';
import { FlatEntityUpdateValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/flat-entity-update-validation-args.type';
import { FlatEntityValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/flat-entity-validation-args.type';
import { FlatEntityValidationReturnType } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/flat-entity-validation-result.type';
import { FlatAgentValidatorService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/services/flat-agent-validator.service';

@Injectable()
export class WorkspaceMigrationAgentActionsBuilderService extends WorkspaceEntityMigrationBuilderService<
  typeof ALL_METADATA_NAME.agent
> {
  constructor(
    private readonly flatAgentValidatorService: FlatAgentValidatorService,
  ) {
    super(ALL_METADATA_NAME.agent);
  }

  protected validateFlatEntityCreation(
    args: FlatEntityValidationArgs<typeof ALL_METADATA_NAME.agent>,
  ): FlatEntityValidationReturnType<typeof ALL_METADATA_NAME.agent, 'create'> {
    const validationResult =
      this.flatAgentValidatorService.validateFlatAgentCreation(args);

    if (validationResult.errors.length > 0) {
      return {
        status: 'fail',
        ...validationResult,
      };
    }

    const { flatEntityToValidate: flatAgentToValidate } = args;

    return {
      status: 'success',
      action: {
        type: 'create',
        metadataName: 'agent',
        flatEntity: flatAgentToValidate,
      },
    };
  }

  protected validateFlatEntityDeletion(
    args: FlatEntityValidationArgs<typeof ALL_METADATA_NAME.agent>,
  ): FlatEntityValidationReturnType<typeof ALL_METADATA_NAME.agent, 'delete'> {
    const validationResult =
      this.flatAgentValidatorService.validateFlatAgentDeletion(args);

    if (validationResult.errors.length > 0) {
      return {
        status: 'fail',
        ...validationResult,
      };
    }

    const { flatEntityToValidate: flatAgentToValidate } = args;

    return {
      status: 'success',
      action: {
        type: 'delete',
        metadataName: 'agent',
        universalIdentifier: flatAgentToValidate.universalIdentifier,
      },
    };
  }

  protected validateFlatEntityUpdate(
    args: FlatEntityUpdateValidationArgs<typeof ALL_METADATA_NAME.agent>,
  ): FlatEntityValidationReturnType<typeof ALL_METADATA_NAME.agent, 'update'> {
    const validationResult =
      this.flatAgentValidatorService.validateFlatAgentUpdate(args);

    if (validationResult.errors.length > 0) {
      return {
        status: 'fail',
        ...validationResult,
      };
    }

    const { flatEntityId, flatEntityUpdates } = args;

    const updateAgentAction: UpdateAgentAction = {
      type: 'update',
      metadataName: 'agent',
      entityId: flatEntityId,
      updates: flatEntityUpdates,
    };

    return {
      status: 'success',
      action: updateAgentAction,
    };
  }
}
