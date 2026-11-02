import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';
import { IsNull } from 'typeorm';

import { isUserAuthContext } from 'src/engine/core-modules/auth/guards/is-user-auth-context.guard';
import { AgentChatSharingService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-sharing.service';
import { AgentChatThreadService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-thread.service';
import { type AgentInboxCallerAuthContext } from 'src/engine/metadata-modules/ai/ai-chat/types/agent-inbox-caller-auth-context.type';
import { throwAgentChatThreadNotFound } from 'src/engine/metadata-modules/ai/ai-chat/utils/throw-agent-chat-thread-not-found.util';
import { AgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/agent-history-repository';
import { InjectAgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/inject-agent-history-repository.decorator';
import { AgentMessageWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-message.workspace-entity';

@Injectable()
export class AgentInboxAccessService {
  constructor(
    @InjectAgentHistoryRepository('agentMessage')
    private readonly agentMessageRepository: AgentHistoryRepository<AgentMessageWorkspaceEntity>,
    private readonly threadService: AgentChatThreadService,
    private readonly sharingService: AgentChatSharingService,
  ) {}

  async assertThreadIsWritableOrThrow({
    authContext,
    threadId,
  }: {
    authContext: AgentInboxCallerAuthContext;
    threadId: string;
  }): Promise<void> {
    const workspaceId = authContext.workspace.id;

    if (isUserAuthContext(authContext)) {
      await this.threadService.getWritableThread({
        workspaceId,
        workspaceMemberId: authContext.workspaceMemberId,
        threadId,
      });

      return;
    }

    const { id: applicationId, defaultRoleId } = authContext.application;
    const canApplicationWriteThread =
      (await this.doesApplicationParticipateInThread({
        workspaceId,
        applicationId,
        threadId,
      })) ||
      (isDefined(defaultRoleId) &&
        (await this.sharingService.isThreadWritableByRole({
          workspaceId,
          threadId,
          roleId: defaultRoleId,
        })));

    if (!canApplicationWriteThread) {
      throwAgentChatThreadNotFound();
    }
  }

  private doesApplicationParticipateInThread({
    workspaceId,
    applicationId,
    threadId,
  }: {
    workspaceId: string;
    applicationId: string;
    threadId: string;
  }): Promise<boolean> {
    return this.agentMessageRepository.existsBy(workspaceId, {
      threadId,
      senderApplicationId: applicationId,
      senderWorkspaceMemberId: IsNull(),
    });
  }
}
