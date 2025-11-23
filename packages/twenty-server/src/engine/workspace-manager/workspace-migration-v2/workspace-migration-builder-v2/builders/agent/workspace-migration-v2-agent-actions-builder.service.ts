import { Injectable } from '@nestjs/common';

import { ALL_METADATA_NAME } from 'twenty-shared/metadata';

import { type UpdateAgentAction } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/agent/types/workspace-migration-agent-action-v2.type';
import { WorkspaceEntityMigrationBuilderV2Service } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/services/workspace-entity-migration-builder-v2.service';
import { type FlatEntityUpdateValidationArgs } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/flat-entity-update-validation-args.type';
import { type FlatEntityValidationArgs } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/flat-entity-validation-args.type';
import { type FlatEntityValidationReturnType } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/flat-entity-validation-result.type';
import { FlatAgentValidatorService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/validators/services/flat-agent-validator.service';

@Injectable()
export class WorkspaceMigrationV2AgentActionsBuilderService extends WorkspaceEntityMigrationBuilderV2Service<
  typeof ALL_METADATA_NAME.agent
> {
  constructor(
    private readonly flatAgentValidatorService: FlatAgentValidatorService,
  ) {
    super(ALL_METADATA_NAME.agent);
  }

  protected async validateFlatEntityCreation(
    args: FlatEntityValidationArgs<typeof ALL_METADATA_NAME.agent>,
  ): Promise<
    FlatEntityValidationReturnType<typeof ALL_METADATA_NAME.agent, 'created'>
  > {
    const validationResult =
      await this.flatAgentValidatorService.validateFlatAgentCreation(args);

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
        type: 'create_agent',
        agent: flatAgentToValidate,
      },
    };
  }

  protected async validateFlatEntityDeletion(
    args: FlatEntityValidationArgs<typeof ALL_METADATA_NAME.agent>,
  ): Promise<
    FlatEntityValidationReturnType<typeof ALL_METADATA_NAME.agent, 'deleted'>
  > {
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
        type: 'delete_agent',
        agentId: flatAgentToValidate.id,
      },
    };
  }

  protected async validateFlatEntityUpdate(
    args: FlatEntityUpdateValidationArgs<typeof ALL_METADATA_NAME.agent>,
  ): Promise<
    FlatEntityValidationReturnType<typeof ALL_METADATA_NAME.agent, 'updated'>
  > {
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
      type: 'update_agent',
      agentId: flatEntityId,
      updates: flatEntityUpdates,
    };

    return {
      status: 'success',
      action: updateAgentAction,
    };
  }
}

