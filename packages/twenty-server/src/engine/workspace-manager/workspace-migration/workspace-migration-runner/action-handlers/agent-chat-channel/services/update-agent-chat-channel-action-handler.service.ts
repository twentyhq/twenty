import { Injectable } from '@nestjs/common';

import { WorkspaceMigrationRunnerActionHandler } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/interfaces/workspace-migration-runner-action-handler-service.interface';

import { findFlatEntityByUniversalIdentifierOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier-or-throw.util';
import { AgentChatChannelEntity } from 'src/engine/metadata-modules/agent-chat-channel/entities/agent-chat-channel.entity';
import { resolveUniversalUpdateRelationIdentifiersToIds } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/utils/resolve-universal-update-relation-identifiers-to-ids.util';
import {
  FlatUpdateAgentChatChannelAction,
  UniversalUpdateAgentChatChannelAction,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/agent-chat-channel/types/workspace-migration-agent-chat-channel-action.type';
import {
  WorkspaceMigrationActionRunnerArgs,
  WorkspaceMigrationActionRunnerContext,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/workspace-migration-action-runner-args.type';

@Injectable()
export class UpdateAgentChatChannelActionHandlerService extends WorkspaceMigrationRunnerActionHandler(
  'update',
  'agentChatChannel',
) {
  override async transpileUniversalActionToFlatAction(
    context: WorkspaceMigrationActionRunnerArgs<UniversalUpdateAgentChatChannelAction>,
  ): Promise<FlatUpdateAgentChatChannelAction> {
    const { action, allFlatEntityMaps } = context;

    const flatAgentChatChannel = findFlatEntityByUniversalIdentifierOrThrow({
      flatEntityMaps: allFlatEntityMaps.flatAgentChatChannelMaps,
      universalIdentifier: action.universalIdentifier,
    });

    const update = resolveUniversalUpdateRelationIdentifiersToIds({
      metadataName: 'agentChatChannel',
      universalUpdate: action.update,
      allFlatEntityMaps,
    });

    return {
      type: 'update',
      metadataName: 'agentChatChannel',
      entityId: flatAgentChatChannel.id,
      update,
    };
  }

  async executeForMetadata(
    context: WorkspaceMigrationActionRunnerContext<FlatUpdateAgentChatChannelAction>,
  ): Promise<void> {
    const { flatAction, queryRunner, workspaceId } = context;
    const { entityId, update } = flatAction;

    const agentChatChannelRepository =
      queryRunner.manager.getRepository<AgentChatChannelEntity>(
        AgentChatChannelEntity,
      );

    await agentChatChannelRepository.update(
      { id: entityId, workspaceId },
      update,
    );
  }

  async executeForWorkspaceSchema(
    _context: WorkspaceMigrationActionRunnerContext<FlatUpdateAgentChatChannelAction>,
  ): Promise<void> {
    return;
  }
}
