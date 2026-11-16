import { Injectable, Logger } from '@nestjs/common';

import { AuthException } from 'src/engine/core-modules/auth/auth.exception';
import { UserWorkspaceAuthContextService } from 'src/engine/core-modules/user-workspace/services/user-workspace-auth-context.service';
import { AgentChatEventPublisherService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-event-publisher.service';
import { AgentChatReplyExecutionPolicyService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-reply-execution-policy.service';
import { formatErrorWithCause } from 'src/engine/metadata-modules/ai/ai-chat/utils/format-error-with-cause.util';
import { resolveAgentChatMessageWorkspaceMemberIdOrThrow } from 'src/engine/metadata-modules/ai/ai-chat/utils/resolve-agent-chat-message-workspace-member-id-or-throw.util';
import { AgentMessageRole } from 'src/engine/metadata-modules/ai/ai-history/enums/agent-message-role.enum';
import { AgentMessageStatus } from 'src/engine/metadata-modules/ai/ai-history/enums/agent-message-status.enum';
import { AgentTurnStatus } from 'src/engine/metadata-modules/ai/ai-history/enums/agent-turn-status.enum';
import { type AgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/agent-history-repository';
import { InjectAgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/inject-agent-history-repository.decorator';
import { AgentConversationWriterService } from 'src/engine/metadata-modules/ai/ai-history/services/agent-conversation-writer.service';
import { type AgentChatThreadWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-chat-thread.workspace-entity';
import { type AgentMessageWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-message.workspace-entity';
import {
  AiException,
  AiExceptionCode,
} from 'src/engine/metadata-modules/ai/ai.exception';

@Injectable()
export class AgentChatReplyContinuationPolicyService {
  private readonly logger = new Logger(
    AgentChatReplyContinuationPolicyService.name,
  );

  constructor(
    @InjectAgentHistoryRepository('agentChatThread')
    private readonly threadRepository: AgentHistoryRepository<AgentChatThreadWorkspaceEntity>,
    @InjectAgentHistoryRepository('agentMessage')
    private readonly messageRepository: AgentHistoryRepository<AgentMessageWorkspaceEntity>,
    private readonly userWorkspaceAuthContextService: UserWorkspaceAuthContextService,
    private readonly replyExecutionPolicyService: AgentChatReplyExecutionPolicyService,
    private readonly conversationWriterService: AgentConversationWriterService,
    private readonly eventPublisherService: AgentChatEventPublisherService,
  ) {}

  async findAllowedQueuedMessageIds({
    workspaceId,
    threadId,
  }: {
    workspaceId: string;
    threadId: string;
  }): Promise<string[]> {
    const [thread, queuedMessages] = await Promise.all([
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
    const allowedMessageIds: string[] = [];
    let hasCancelledMessage = false;

    for (const message of queuedMessages) {
      const isExecutionAllowed = await this.shouldExecuteMessage({
        workspaceId,
        threadId,
        message,
        ownerWorkspaceMemberId: thread.workspaceMemberId,
      });

      if (isExecutionAllowed) {
        allowedMessageIds.push(message.id);

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
      await this.eventPublisherService
        .publish({
          workspaceId,
          threadId,
          event: { type: 'queue-updated' },
        })
        .catch((error: unknown) =>
          this.logger.warn(
            `Could not publish workspace-policy queue-updated event for workspace ${workspaceId}, thread ${threadId}: ${formatErrorWithCause(error)}`,
          ),
        );
    }

    return allowedMessageIds;
  }

  private async shouldExecuteMessage({
    workspaceId,
    threadId,
    message,
    ownerWorkspaceMemberId,
  }: {
    workspaceId: string;
    threadId: string;
    message: Pick<
      AgentMessageWorkspaceEntity,
      'id' | 'senderWorkspaceMemberId' | 'senderApplicationId'
    >;
    ownerWorkspaceMemberId: string | null;
  }): Promise<boolean> {
    try {
      const workspaceMemberId = resolveAgentChatMessageWorkspaceMemberIdOrThrow(
        {
          message,
          ownerWorkspaceMemberId,
        },
      );
      const { userWorkspaceId } =
        await this.userWorkspaceAuthContextService.resolveWorkspaceMember({
          workspaceId,
          workspaceMemberId,
        });

      return await this.replyExecutionPolicyService.shouldExecute({
        workspaceId,
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

  private async cancelQueuedReply({
    workspaceId,
    threadId,
    messageId,
  }: {
    workspaceId: string;
    threadId: string;
    messageId: string;
  }): Promise<boolean> {
    return this.conversationWriterService.runInTransaction({
      workspaceId,
      threadId,
      work: async (scope) => {
        const turnId = await this.conversationWriterService.insertTurn({
          workspaceId,
          threadId,
          agentId: null,
          status: AgentTurnStatus.CANCELLED,
          scope,
        });
        const updatedMessageCount = await scope.update({
          name: 'agentMessage',
          where: { id: messageId, threadId, status: AgentMessageStatus.QUEUED },
          values: {
            status: AgentMessageStatus.SENT,
            processedAt: new Date().toISOString(),
            turnId,
          },
        });

        if (updatedMessageCount === 0) {
          await scope.delete({ name: 'agentTurn', where: { id: turnId } });

          return false;
        }

        return true;
      },
    });
  }
}
