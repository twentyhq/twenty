import { Injectable } from '@nestjs/common';

import { ALL_METADATA_NAME } from 'twenty-shared/metadata';

import { UniversalUpdateAgentChatChannelRoleAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/agent-chat-channel-role/types/workspace-migration-agent-chat-channel-role-action.type';
import { WorkspaceEntityMigrationBuilderService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/services/workspace-entity-migration-builder.service';
import { FlatEntityCreationValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-creation-validation-args.type';
import { FlatEntityUpdateValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-update-validation-args.type';
import { UniversalFlatEntityValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-validation-args.type';
import { UniversalFlatEntityValidationReturnType } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-validation-result.type';
import { FlatAgentChatChannelRoleValidatorService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/services/flat-agent-chat-channel-role-validator.service';

@Injectable()
export class WorkspaceMigrationAgentChatChannelRoleActionsBuilderService extends WorkspaceEntityMigrationBuilderService<
  typeof ALL_METADATA_NAME.agentChatChannelRole
> {
  constructor(
    private readonly flatAgentChatChannelRoleValidatorService: FlatAgentChatChannelRoleValidatorService,
  ) {
    super(ALL_METADATA_NAME.agentChatChannelRole);
  }

  protected validateFlatEntityCreation(
    args: FlatEntityCreationValidationArgs<
      typeof ALL_METADATA_NAME.agentChatChannelRole
    >,
  ): UniversalFlatEntityValidationReturnType<
    typeof ALL_METADATA_NAME.agentChatChannelRole,
    'create'
  > {
    const validationResult =
      this.flatAgentChatChannelRoleValidatorService.validateFlatAgentChatChannelRoleCreation(
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
        metadataName: 'agentChatChannelRole',
        flatEntity: args.flatEntityToValidate,
      },
    };
  }

  protected validateFlatEntityDeletion(
    args: UniversalFlatEntityValidationArgs<
      typeof ALL_METADATA_NAME.agentChatChannelRole
    >,
  ): UniversalFlatEntityValidationReturnType<
    typeof ALL_METADATA_NAME.agentChatChannelRole,
    'delete'
  > {
    const validationResult =
      this.flatAgentChatChannelRoleValidatorService.validateFlatAgentChatChannelRoleDeletion(
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
        metadataName: 'agentChatChannelRole',
        universalIdentifier: args.flatEntityToValidate.universalIdentifier,
      },
    };
  }

  protected validateFlatEntityUpdate(
    args: FlatEntityUpdateValidationArgs<
      typeof ALL_METADATA_NAME.agentChatChannelRole
    >,
  ): UniversalFlatEntityValidationReturnType<
    typeof ALL_METADATA_NAME.agentChatChannelRole,
    'update'
  > {
    const validationResult =
      this.flatAgentChatChannelRoleValidatorService.validateFlatAgentChatChannelRoleUpdate(
        args,
      );

    if (validationResult.errors.length > 0) {
      return {
        status: 'fail',
        ...validationResult,
      };
    }

    const { universalIdentifier, flatEntityUpdate } = args;

    const updateAgentChatChannelRoleAction: UniversalUpdateAgentChatChannelRoleAction =
      {
        type: 'update',
        metadataName: 'agentChatChannelRole',
        universalIdentifier,
        update: flatEntityUpdate,
      };

    return {
      status: 'success',
      action: updateAgentChatChannelRoleAction,
    };
  }
}
