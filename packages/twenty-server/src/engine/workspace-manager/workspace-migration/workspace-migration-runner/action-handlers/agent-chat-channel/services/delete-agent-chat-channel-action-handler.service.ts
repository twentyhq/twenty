import { Injectable } from '@nestjs/common';

import { WorkspaceMigrationRunnerActionHandler } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/interfaces/workspace-migration-runner-action-handler-service.interface';

import { AgentChatChannelEntity } from 'src/engine/metadata-modules/agent-chat-channel/entities/agent-chat-channel.entity';
import {
  FlatDeleteAgentChatChannelAction,
  UniversalDeleteAgentChatChannelAction,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/agent-chat-channel/types/workspace-migration-agent-chat-channel-action.type';
import {
  WorkspaceMigrationActionRunnerArgs,
  WorkspaceMigrationActionRunnerContext,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/workspace-migration-action-runner-args.type';

@Injectable()
export class DeleteAgentChatChannelActionHandlerService extends WorkspaceMigrationRunnerActionHandler(
  'delete',
  'agentChatChannel',
) {
  constructor() {
    super();
  }

  override async transpileUniversalActionToFlatAction(
    context: WorkspaceMigrationActionRunnerArgs<UniversalDeleteAgentChatChannelAction>,
  ): Promise<FlatDeleteAgentChatChannelAction> {
    return this.transpileUniversalDeleteActionToFlatDeleteAction(context);
  }

  async executeForMetadata(
    context: WorkspaceMigrationActionRunnerContext<FlatDeleteAgentChatChannelAction>,
  ): Promise<void> {
    const { flatAction, queryRunner, workspaceId } = context;

    const agentChatChannelRepository =
      queryRunner.manager.getRepository<AgentChatChannelEntity>(
        AgentChatChannelEntity,
      );

    await agentChatChannelRepository.delete({
      id: flatAction.entityId,
      workspaceId,
    });
  }

  async executeForWorkspaceSchema(
    _context: WorkspaceMigrationActionRunnerContext<FlatDeleteAgentChatChannelAction>,
  ): Promise<void> {
    return;
  }
}
