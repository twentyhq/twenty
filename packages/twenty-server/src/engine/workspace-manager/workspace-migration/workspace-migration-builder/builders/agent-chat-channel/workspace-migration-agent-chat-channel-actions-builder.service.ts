import { Injectable } from '@nestjs/common';

import { ALL_METADATA_NAME } from 'twenty-shared/metadata';

import { UniversalUpdateAgentChatChannelAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/agent-chat-channel/types/workspace-migration-agent-chat-channel-action.type';
import { WorkspaceEntityMigrationBuilderService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/services/workspace-entity-migration-builder.service';
import { FlatEntityCreationValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-creation-validation-args.type';
import { FlatEntityUpdateValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-update-validation-args.type';
import { UniversalFlatEntityValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-validation-args.type';
import { UniversalFlatEntityValidationReturnType } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-validation-result.type';
import { FlatAgentChatChannelValidatorService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/services/flat-agent-chat-channel-validator.service';

@Injectable()
export class WorkspaceMigrationAgentChatChannelActionsBuilderService extends WorkspaceEntityMigrationBuilderService<
  typeof ALL_METADATA_NAME.agentChatChannel
> {
  constructor(
    private readonly flatAgentChatChannelValidatorService: FlatAgentChatChannelValidatorService,
  ) {
    super(ALL_METADATA_NAME.agentChatChannel);
  }

  protected validateFlatEntityCreation(
    args: FlatEntityCreationValidationArgs<
      typeof ALL_METADATA_NAME.agentChatChannel
    >,
  ): UniversalFlatEntityValidationReturnType<
    typeof ALL_METADATA_NAME.agentChatChannel,
    'create'
  > {
    const validationResult =
      this.flatAgentChatChannelValidatorService.validateFlatAgentChatChannelCreation(
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
        metadataName: 'agentChatChannel',
        flatEntity: args.flatEntityToValidate,
      },
    };
  }

  protected validateFlatEntityDeletion(
    args: UniversalFlatEntityValidationArgs<
      typeof ALL_METADATA_NAME.agentChatChannel
    >,
  ): UniversalFlatEntityValidationReturnType<
    typeof ALL_METADATA_NAME.agentChatChannel,
    'delete'
  > {
    const validationResult =
      this.flatAgentChatChannelValidatorService.validateFlatAgentChatChannelDeletion(
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
        metadataName: 'agentChatChannel',
        universalIdentifier: args.flatEntityToValidate.universalIdentifier,
      },
    };
  }

  protected validateFlatEntityUpdate(
    args: FlatEntityUpdateValidationArgs<
      typeof ALL_METADATA_NAME.agentChatChannel
    >,
  ): UniversalFlatEntityValidationReturnType<
    typeof ALL_METADATA_NAME.agentChatChannel,
    'update'
  > {
    const validationResult =
      this.flatAgentChatChannelValidatorService.validateFlatAgentChatChannelUpdate(
        args,
      );

    if (validationResult.errors.length > 0) {
      return {
        status: 'fail',
        ...validationResult,
      };
    }

    const { universalIdentifier, flatEntityUpdate } = args;

    const updateAgentChatChannelAction: UniversalUpdateAgentChatChannelAction =
      {
        type: 'update',
        metadataName: 'agentChatChannel',
        universalIdentifier,
        update: flatEntityUpdate,
      };

    return {
      status: 'success',
      action: updateAgentChatChannelAction,
    };
  }
}
