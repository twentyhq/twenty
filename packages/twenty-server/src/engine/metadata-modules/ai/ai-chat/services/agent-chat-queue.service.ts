import { Injectable } from '@nestjs/common';
import { isDefined } from 'twenty-shared/utils';

import { AgentMessageStatus } from 'src/engine/metadata-modules/ai/ai-history/enums/agent-message-status.enum';
import { AgentTurnStatus } from 'src/engine/metadata-modules/ai/ai-history/enums/agent-turn-status.enum';
import { AgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/agent-history-repository';
import { InjectAgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/inject-agent-history-repository.decorator';
import { AgentConversationWriterService } from 'src/engine/metadata-modules/ai/ai-history/services/agent-conversation-writer.service';
import { AgentMessageWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-message.workspace-entity';

@Injectable()
export class AgentChatQueueService {
  constructor(
    @InjectAgentHistoryRepository('agentMessage')
    private readonly messageRepository: AgentHistoryRepository<AgentMessageWorkspaceEntity>,
    private readonly conversationWriterService: AgentConversationWriterService,
  ) {}

  async hasQueuedMessages({
    threadId,
    workspaceId,
  }: {
    threadId: string;
    workspaceId: string;
  }): Promise<boolean> {
    return this.messageRepository.existsBy(workspaceId, {
      threadId,
      status: AgentMessageStatus.QUEUED,
    });
  }

  async getQueuedMessages({
    threadId,
    workspaceId,
  }: {
    threadId: string;
    workspaceId: string;
  }): Promise<AgentMessageWorkspaceEntity[]> {
    return this.messageRepository.find(workspaceId, {
      where: {
        threadId,
        status: AgentMessageStatus.QUEUED,
      },
      order: { createdAt: 'ASC' },
      relations: ['parts', 'parts.file'],
    });
  }

  async findQueuedMessage({
    messageId,
    workspaceId,
  }: {
    messageId: string;
    workspaceId: string;
  }): Promise<AgentMessageWorkspaceEntity | null> {
    return this.messageRepository.findOne(workspaceId, {
      where: { id: messageId, status: AgentMessageStatus.QUEUED },
    });
  }

  async deleteQueuedMessage({
    messageId,
    workspaceId,
  }: {
    messageId: string;
    workspaceId: string;
  }): Promise<boolean> {
    const queuedMessage = await this.messageRepository.findOne(workspaceId, {
      where: { id: messageId, status: AgentMessageStatus.QUEUED },
      select: ['threadId'],
    });

    if (!isDefined(queuedMessage)) {
      return false;
    }

    const deletedMessageCount =
      await this.conversationWriterService.runInTransaction({
        workspaceId,
        threadId: queuedMessage.threadId,
        work: (scope) =>
          scope.delete({
            name: 'agentMessage',
            where: {
              id: messageId,
              threadId: queuedMessage.threadId,
              status: AgentMessageStatus.QUEUED,
            },
          }),
      });

    return deletedMessageCount > 0;
  }

  async promoteQueuedMessage({
    messageId,
    threadId,
    workspaceId,
  }: {
    messageId: string;
    threadId: string;
    workspaceId: string;
  }): Promise<string | null> {
    return this.conversationWriterService.runInTransaction({
      workspaceId,
      threadId,
      work: async (scope) => {
        const savedTurnId = await this.conversationWriterService.insertTurn({
          workspaceId,
          threadId,
          agentId: null,
          status: AgentTurnStatus.RUNNING,
          scope,
        });

        const updatedMessageCount = await scope.update({
          name: 'agentMessage',
          where: { id: messageId, threadId, status: AgentMessageStatus.QUEUED },
          values: {
            status: AgentMessageStatus.SENT,
            processedAt: new Date().toISOString(),
            turnId: savedTurnId,
          },
        });

        if (updatedMessageCount === 0) {
          await scope.delete({ name: 'agentTurn', where: { id: savedTurnId } });

          return null;
        }

        return savedTurnId;
      },
    });
  }
}
