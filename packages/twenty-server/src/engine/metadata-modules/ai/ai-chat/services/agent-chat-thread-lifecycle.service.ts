import { Injectable, Logger } from '@nestjs/common';

import { isNonEmptyString } from '@sniptt/guards';
import { isNonEmptyArray } from 'twenty-shared/utils';
import { In, IsNull, Not } from 'typeorm';

import { CodeInterpreterService } from 'src/engine/core-modules/code-interpreter/code-interpreter.service';
import { RedisClientService } from 'src/engine/core-modules/redis-client/redis-client.service';
import { closeOpenToolParts } from 'src/engine/metadata-modules/ai/ai-agent-execution/pausing-tools/utils/close-open-tool-parts.util';
import { AgentChatThreadRecordEventService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-thread-record-event.service';
import { getCancelChannel } from 'src/engine/metadata-modules/ai/ai-chat/utils/get-cancel-channel.util';
import { InjectAgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/inject-agent-history-repository.decorator';
import { AgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/agent-history-repository';
import { AgentChatThreadWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-chat-thread.workspace-entity';
import { AgentMessagePartWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-message-part.workspace-entity';
import { AgentTurnStatus } from 'src/engine/metadata-modules/ai/ai-history/enums/agent-turn-status.enum';
import { AgentTurnRecorderService } from 'src/engine/metadata-modules/ai/ai-history/services/agent-turn-recorder.service';

@Injectable()
export class AgentChatThreadLifecycleService {
  private readonly logger = new Logger(AgentChatThreadLifecycleService.name);

  constructor(
    @InjectAgentHistoryRepository('agentChatThread')
    private readonly threadRepository: AgentHistoryRepository<AgentChatThreadWorkspaceEntity>,
    private readonly redisClientService: RedisClientService,
    private readonly codeInterpreterService: CodeInterpreterService,
    private readonly threadRecordEventService: AgentChatThreadRecordEventService,
    private readonly turnRecorderService: AgentTurnRecorderService,
    @InjectAgentHistoryRepository('agentMessagePart')
    private readonly messagePartRepository: AgentHistoryRepository<AgentMessagePartWorkspaceEntity>,
  ) {}

  async cancelStream({
    threadId,
    streamId,
  }: {
    threadId: string;
    streamId: string;
  }): Promise<void> {
    await this.redisClientService
      .getClient()
      .publish(getCancelChannel(threadId, streamId), 'cancel');
  }

  releaseThreadSandboxBestEffort({
    workspaceId,
    threadId,
  }: {
    workspaceId: string;
    threadId: string;
  }): void {
    void this.codeInterpreterService
      .releaseThreadSandbox(workspaceId, threadId)
      .catch((error) =>
        this.logger.warn(
          `Failed to release code interpreter sandbox for thread ${threadId}: ${
            error instanceof Error ? error.message : String(error)
          }`,
        ),
      );
  }

  // awaited so the stream stops before the soft delete responds
  async stopDeletedThreads({
    workspaceId,
    threadIds,
  }: {
    workspaceId: string;
    threadIds: string[];
  }): Promise<void> {
    if (!isNonEmptyArray(threadIds)) {
      return;
    }

    const deletedThreads = await this.threadRepository.find(workspaceId, {
      where: { id: In(threadIds), deletedAt: Not(IsNull()) },
    });

    for (const deletedThread of deletedThreads) {
      await this.stopStreamIfAny({ workspaceId, thread: deletedThread });

      this.releaseThreadSandboxBestEffort({
        workspaceId,
        threadId: deletedThread.id,
      });
    }
  }

  async stopStreamIfAny({
    workspaceId,
    thread,
  }: {
    workspaceId: string;
    thread: AgentChatThreadWorkspaceEntity;
  }): Promise<void> {
    if (!isNonEmptyString(thread.activeStreamId)) {
      return;
    }

    await this.cancelStream({
      threadId: thread.id,
      streamId: thread.activeStreamId,
    });

    const isReleased = await this.turnRecorderService.releaseStreamClaim({
      workspaceId,
      threadId: thread.id,
      streamId: thread.activeStreamId,
      endRunningTurn: { status: AgentTurnStatus.CANCELLED },
    });

    if (isReleased) {
      await this.threadRecordEventService.emitThreadUpdated({
        workspaceId,
        threadBefore: thread,
      });
    }
  }

  // Clearing the marker is the claim, so only one caller closes the calls, and only while the
  // thread is held by the stream given, or by none. The event goes last so listeners read the
  // closed calls and the ended turn
  async closePendingQuestion({
    workspaceId,
    threadId,
    messageId,
    activeStreamId,
    turnStatus,
  }: {
    workspaceId: string;
    threadId: string;
    messageId: string;
    activeStreamId: string | null;
    turnStatus: AgentTurnStatus.COMPLETED | AgentTurnStatus.CANCELLED;
  }): Promise<void> {
    const { affected } = await this.threadRepository.update(
      workspaceId,
      {
        id: threadId,
        pendingQuestionMessageId: messageId,
        activeStreamId: activeStreamId ?? IsNull(),
      },
      { pendingQuestionMessageId: null },
    );

    if (!affected) {
      return;
    }

    await closeOpenToolParts({
      messagePartRepository: this.messagePartRepository,
      messageId,
      workspaceId,
    });

    await this.turnRecorderService.endWaitingTurn({
      workspaceId,
      messageId,
      status: turnStatus,
    });

    await this.threadRecordEventService.emitPendingQuestionCleared({
      workspaceId,
      threadId,
      messageId,
    });
  }
}
