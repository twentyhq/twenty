import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isDefined } from 'twenty-shared/utils';
import { type Repository } from 'typeorm';

import { AuthException } from 'src/engine/core-modules/auth/auth.exception';
import { UserWorkspaceAuthContextService } from 'src/engine/core-modules/user-workspace/services/user-workspace-auth-context.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AgentChatEventPublisherService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-event-publisher.service';
import { AgentChatReplyExecutionPolicyService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-reply-execution-policy.service';
import { AgentMessageRole } from 'src/engine/metadata-modules/ai/ai-history/enums/agent-message-role.enum';
import { AgentMessageStatus } from 'src/engine/metadata-modules/ai/ai-history/enums/agent-message-status.enum';
import { AgentTurnStatus } from 'src/engine/metadata-modules/ai/ai-history/enums/agent-turn-status.enum';
import { type AgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/agent-history-repository';
import { getAgentHistoryRepositoryToken } from 'src/engine/metadata-modules/ai/ai-history/repositories/inject-agent-history-repository.decorator';
import { AgentConversationWriterService } from 'src/engine/metadata-modules/ai/ai-history/services/agent-conversation-writer.service';
import { type AgentChatThreadWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-chat-thread.workspace-entity';
import { type AgentMessageWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-message.workspace-entity';
import {
  AiException,
  AiExceptionCode,
} from 'src/engine/metadata-modules/ai/ai.exception';

@Injectable()
export class AgentChatReplyContinuationPolicyService {
  @InjectRepository(WorkspaceEntity)
  private readonly workspaceRepository: Repository<WorkspaceEntity>;

  @Inject(getAgentHistoryRepositoryToken('agentChatThread'))
  private readonly threadRepository: AgentHistoryRepository<AgentChatThreadWorkspaceEntity>;

  @Inject(getAgentHistoryRepositoryToken('agentMessage'))
  private readonly messageRepository: AgentHistoryRepository<AgentMessageWorkspaceEntity>;

  @Inject(UserWorkspaceAuthContextService)
  private readonly userWorkspaceAuthContextService: UserWorkspaceAuthContextService;

  @Inject(AgentChatReplyExecutionPolicyService)
  private readonly replyExecutionPolicyService: AgentChatReplyExecutionPolicyService;

  @Inject(AgentConversationWriterService)
  private readonly conversationWriterService: AgentConversationWriterService;

  @Inject(AgentChatEventPublisherService)
  private readonly eventPublisherService: AgentChatEventPublisherService;

  async shouldContinue({
    workspaceId,
    threadId,
  }: {
    workspaceId: string;
    threadId: string;
  }): Promise<boolean> {
    const [workspace, thread, queuedMessages] = await Promise.all([
      this.workspaceRepository.findOneByOrFail({ id: workspaceId }),
      this.threadRepository.findOneOrFail(workspaceId, {
        where: { id: threadId },
        select: ['id', 'workspaceMemberId'],
      }),
      this.messageRepository.find(workspaceId, {
        where: {
          threadId,
          role: AgentMessageRole.USER,
          status: AgentMessageStatus.QUEUED,
        },
        order: { createdAt: 'ASC', id: 'ASC' },
        relations: ['parts'],
      }),
    ]);
    let hasAllowedMessage = false;
    let hasCancelledMessage = false;

    for (const message of queuedMessages) {
      const isStillQueued = await this.messageRepository.existsBy(workspaceId, {
        id: message.id,
        threadId,
        status: AgentMessageStatus.QUEUED,
      });

      if (!isStillQueued) {
        continue;
      }

      const isExecutionAllowed = await this.shouldExecuteMessage({
        workspace,
        threadId,
        message,
        ownerWorkspaceMemberId: thread.workspaceMemberId,
      });

      if (isExecutionAllowed) {
        hasAllowedMessage = true;

        continue;
      }

      const isCancelled = await this.cancelQueuedReply({
        workspaceId,
        threadId,
        messageId: message.id,
      });

      hasCancelledMessage = isCancelled || hasCancelledMessage;
    }

    if (hasCancelledMessage) {
      await this.eventPublisherService.publish({
        workspaceId,
        threadId,
        event: { type: 'queue-updated' },
      });
    }

    return hasAllowedMessage;
  }

  private async shouldExecuteMessage({
    workspace,
    threadId,
    message,
    ownerWorkspaceMemberId,
  }: {
    workspace: WorkspaceEntity;
    threadId: string;
    message: AgentMessageWorkspaceEntity;
    ownerWorkspaceMemberId: string | null;
  }): Promise<boolean> {
    try {
      const userWorkspaceId = await this.resolveMessageUserWorkspaceId({
        workspaceId: workspace.id,
        message,
        ownerWorkspaceMemberId,
      });

      return await this.replyExecutionPolicyService.shouldExecute({
        workspace,
        threadId,
        messageId: message.id,
        userWorkspaceId,
      });
    } catch (error) {
      const isUnavailableMessage =
        error instanceof AiException &&
        (error.code === AiExceptionCode.RUN_AS_WORKSPACE_MEMBER_NOT_FOUND ||
          error.code === AiExceptionCode.MESSAGE_NOT_FOUND);

      if (error instanceof AuthException || isUnavailableMessage) {
        return false;
      }

      throw error;
    }
  }

  private async resolveMessageUserWorkspaceId({
    workspaceId,
    message,
    ownerWorkspaceMemberId,
  }: {
    workspaceId: string;
    message: AgentMessageWorkspaceEntity;
    ownerWorkspaceMemberId: string | null;
  }): Promise<string> {
    if (
      !isDefined(message.senderWorkspaceMemberId) &&
      !isDefined(message.senderApplicationId)
    ) {
      throw new AiException(
        'Message sender is no longer a workspace member',
        AiExceptionCode.RUN_AS_WORKSPACE_MEMBER_NOT_FOUND,
      );
    }

    const workspaceMemberId =
      message.senderWorkspaceMemberId ?? ownerWorkspaceMemberId;

    if (!isDefined(workspaceMemberId)) {
      throw new AiException(
        'Message has no sender or workspace member owner',
        AiExceptionCode.RUN_AS_WORKSPACE_MEMBER_NOT_FOUND,
      );
    }

    const { userWorkspaceId } =
      await this.userWorkspaceAuthContextService.resolveWorkspaceMember({
        workspaceId,
        workspaceMemberId,
      });

    return userWorkspaceId;
  }

  private async cancelQueuedReply({
    workspaceId,
    threadId,
    messageId,
  }: {
    workspaceId: string;
    threadId: string;
    messageId: string;
  }): Promise<boolean> {
    return this.conversationWriterService.runInTransaction(
      workspaceId,
      async (scope) => {
        const turnId = await this.conversationWriterService.insertTurn({
          workspaceId,
          threadId,
          agentId: null,
          status: AgentTurnStatus.CANCELLED,
          scope,
        });
        const updatedMessageCount = await scope.update(
          'agentMessage',
          { id: messageId, threadId, status: AgentMessageStatus.QUEUED },
          {
            status: AgentMessageStatus.SENT,
            processedAt: new Date().toISOString(),
            turnId,
          },
        );

        if (updatedMessageCount === 0) {
          await scope.delete('agentTurn', { id: turnId });

          return false;
        }

        return true;
      },
    );
  }
}
