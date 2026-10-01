import { Injectable } from '@nestjs/common';

import { AgentChatSharingService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-sharing.service';
import { AgentChatThreadRecordEventService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-thread-record-event.service';
import { AgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/agent-history-repository';
import { InjectAgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/inject-agent-history-repository.decorator';
import { AgentChatThreadWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-chat-thread.workspace-entity';
import {
  AiException,
  AiExceptionCode,
} from 'src/engine/metadata-modules/ai/ai.exception';

@Injectable()
export class AgentChatThreadService {
  constructor(
    @InjectAgentHistoryRepository('agentChatThread')
    private readonly threadRepository: AgentHistoryRepository<AgentChatThreadWorkspaceEntity>,
    private readonly sharingService: AgentChatSharingService,
    private readonly threadRecordEventService: AgentChatThreadRecordEventService,
  ) {}

  async createThread({
    workspaceMemberId,
    workspaceId,
    id,
    title,
  }: {
    workspaceMemberId: string;
    workspaceId: string;
    id?: string;
    title?: string;
  }) {
    const savedThread = await this.sharingService.createThread({
      workspaceId,
      workspaceMemberId,
      id,
      title,
    });

    await this.threadRecordEventService.emitThreadCreated({
      workspaceId,
      threadId: savedThread.id,
    });

    return savedThread;
  }

  async findWritableThread({
    threadId,
    workspaceMemberId,
    workspaceId,
  }: {
    threadId: string;
    workspaceMemberId: string;
    workspaceId: string;
  }) {
    try {
      return await this.getWritableThread({
        threadId,
        workspaceMemberId,
        workspaceId,
      });
    } catch (error) {
      if (
        error instanceof AiException &&
        error.code === AiExceptionCode.THREAD_NOT_FOUND
      ) {
        return null;
      }
      throw error;
    }
  }

  async getWritableThread(args: {
    threadId: string;
    workspaceMemberId: string;
    workspaceId: string;
  }) {
    return this.sharingService.getThreadWithAccess({
      ...args,
      operationType: 'update',
    });
  }

  async notifyThreadActivityUpdated({
    threadId,
    workspaceMemberId,
    workspaceId,
  }: {
    threadId: string;
    workspaceMemberId: string;
    workspaceId: string;
  }): Promise<void> {
    const thread = await this.getWritableThread({
      threadId,
      workspaceMemberId,
      workspaceId,
    });

    const threadAfter = { ...thread, updatedAt: new Date().toISOString() };

    // conversations sort by last change, so bump on send rather than at turn end
    await this.threadRepository.update(
      workspaceId,
      { id: threadId },
      { updatedAt: threadAfter.updatedAt },
    );

    await this.threadRecordEventService.emitThreadUpdated({
      workspaceId,
      threadBefore: thread,
      threadAfter,
    });
  }
}
