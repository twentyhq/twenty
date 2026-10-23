import { Injectable } from '@nestjs/common';

import { WorkspaceMigrationRunnerActionHandler } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/interfaces/workspace-migration-runner-action-handler-service.interface';

import { AgentChatChannelRoleEntity } from 'src/engine/metadata-modules/agent-chat-channel/entities/agent-chat-channel-role.entity';
import {
  FlatDeleteAgentChatChannelRoleAction,
  UniversalDeleteAgentChatChannelRoleAction,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/agent-chat-channel-role/types/workspace-migration-agent-chat-channel-role-action.type';
import {
  WorkspaceMigrationActionRunnerArgs,
  WorkspaceMigrationActionRunnerContext,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/workspace-migration-action-runner-args.type';

@Injectable()
export class DeleteAgentChatChannelRoleActionHandlerService extends WorkspaceMigrationRunnerActionHandler(
  'delete',
  'agentChatChannelRole',
) {
  constructor() {
    super();
  }

  override async transpileUniversalActionToFlatAction(
    context: WorkspaceMigrationActionRunnerArgs<UniversalDeleteAgentChatChannelRoleAction>,
  ): Promise<FlatDeleteAgentChatChannelRoleAction> {
    return this.transpileUniversalDeleteActionToFlatDeleteAction(context);
  }

  async executeForMetadata(
    context: WorkspaceMigrationActionRunnerContext<FlatDeleteAgentChatChannelRoleAction>,
  ): Promise<void> {
    const { flatAction, queryRunner, workspaceId } = context;

    const agentChatChannelRoleRepository =
      queryRunner.manager.getRepository<AgentChatChannelRoleEntity>(
        AgentChatChannelRoleEntity,
      );

    await agentChatChannelRoleRepository.delete({
      id: flatAction.entityId,
      workspaceId,
    });
  }

  async executeForWorkspaceSchema(
    _context: WorkspaceMigrationActionRunnerContext<FlatDeleteAgentChatChannelRoleAction>,
  ): Promise<void> {
    return;
  }
}
