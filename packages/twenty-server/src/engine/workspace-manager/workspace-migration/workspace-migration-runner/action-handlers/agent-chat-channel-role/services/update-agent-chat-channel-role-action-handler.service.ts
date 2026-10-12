import { Injectable } from '@nestjs/common';

import { WorkspaceMigrationRunnerActionHandler } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/interfaces/workspace-migration-runner-action-handler-service.interface';

import { findFlatEntityByUniversalIdentifierOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier-or-throw.util';
import { AgentChatChannelRoleEntity } from 'src/engine/metadata-modules/agent-chat-channel/entities/agent-chat-channel-role.entity';
import { resolveUniversalUpdateRelationIdentifiersToIds } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/utils/resolve-universal-update-relation-identifiers-to-ids.util';
import {
  FlatUpdateAgentChatChannelRoleAction,
  UniversalUpdateAgentChatChannelRoleAction,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/agent-chat-channel-role/types/workspace-migration-agent-chat-channel-role-action.type';
import {
  WorkspaceMigrationActionRunnerArgs,
  WorkspaceMigrationActionRunnerContext,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/workspace-migration-action-runner-args.type';

@Injectable()
export class UpdateAgentChatChannelRoleActionHandlerService extends WorkspaceMigrationRunnerActionHandler(
  'update',
  'agentChatChannelRole',
) {
  override async transpileUniversalActionToFlatAction(
    context: WorkspaceMigrationActionRunnerArgs<UniversalUpdateAgentChatChannelRoleAction>,
  ): Promise<FlatUpdateAgentChatChannelRoleAction> {
    const { action, allFlatEntityMaps } = context;

    const flatAgentChatChannelRole = findFlatEntityByUniversalIdentifierOrThrow(
      {
        flatEntityMaps: allFlatEntityMaps.flatAgentChatChannelRoleMaps,
        universalIdentifier: action.universalIdentifier,
      },
    );

    const update = resolveUniversalUpdateRelationIdentifiersToIds({
      metadataName: 'agentChatChannelRole',
      universalUpdate: action.update,
      allFlatEntityMaps,
    });

    return {
      type: 'update',
      metadataName: 'agentChatChannelRole',
      entityId: flatAgentChatChannelRole.id,
      update,
    };
  }

  async executeForMetadata(
    context: WorkspaceMigrationActionRunnerContext<FlatUpdateAgentChatChannelRoleAction>,
  ): Promise<void> {
    const { flatAction, queryRunner, workspaceId } = context;
    const { entityId, update } = flatAction;

    const agentChatChannelRoleRepository =
      queryRunner.manager.getRepository<AgentChatChannelRoleEntity>(
        AgentChatChannelRoleEntity,
      );

    await agentChatChannelRoleRepository.update(
      { id: entityId, workspaceId },
      update,
    );
  }

  async executeForWorkspaceSchema(
    _context: WorkspaceMigrationActionRunnerContext<FlatUpdateAgentChatChannelRoleAction>,
  ): Promise<void> {
    return;
  }
}
