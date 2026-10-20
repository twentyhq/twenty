import { Injectable, Logger } from '@nestjs/common';
import { type FindOptionsWhere, IsNull } from 'typeorm';
import { isDefined, isNonEmptyString } from 'twenty-shared/utils';

import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { AGENT_CHAT_STREAM_REAP_CHECK_INTERVAL_MS } from 'src/engine/metadata-modules/ai/ai-chat/constants/agent-chat-stream-reap-check-interval-ms.constant';
import { MetricsService } from 'src/engine/core-modules/metrics/metrics.service';
import { MetricsKeys } from 'src/engine/core-modules/metrics/types/metrics-keys.type';
import { AgentChatThreadWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-chat-thread.workspace-entity';
import { type AgentMessageWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-message.workspace-entity';
import { AgentMessageStatus } from 'src/engine/metadata-modules/ai/ai-history/enums/agent-message-status.enum';
import { FLUSH_QUEUED_AGENT_CHAT_MESSAGES_JOB_NAME } from 'src/engine/metadata-modules/ai/ai-chat/jobs/flush-queued-agent-chat-messages-job-name.constant';
import { type FlushQueuedAgentChatMessagesJobData } from 'src/engine/metadata-modules/ai/ai-chat/jobs/flush-queued-agent-chat-messages-job.types';
import { AgentChatEventPublisherService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-event-publisher.service';
import { AgentChatParkedRunsService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-parked-runs.service';
import { AgentChatStreamHeartbeatService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-stream-heartbeat.service';
import { formatErrorWithCause } from 'src/engine/metadata-modules/ai/ai-chat/utils/format-error-with-cause.util';
import { type StreamErrorPayload } from 'src/engine/metadata-modules/ai/ai-history/utils/map-error-to-stream-error.util';
import { AgentTurnStatus } from 'src/engine/metadata-modules/ai/ai-history/enums/agent-turn-status.enum';
import { AgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/agent-history-repository';
import { AgentTurnRecorderService } from 'src/engine/metadata-modules/ai/ai-history/services/agent-turn-recorder.service';
import { AiExceptionCode } from 'src/engine/metadata-modules/ai/ai.exception';

import { InjectAgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/inject-agent-history-repository.decorator';

export type AgentChatStreamClaim = {
  threadId: string;
  workspaceId: string;
  streamId: string;
};

@Injectable()
export class AgentChatStreamRecoveryService {
  private readonly logger = new Logger(AgentChatStreamRecoveryService.name);

  constructor(
    @InjectAgentHistoryRepository('agentChatThread')
    private readonly threadRepository: AgentHistoryRepository<AgentChatThreadWorkspaceEntity>,
    @InjectAgentHistoryRepository('agentMessage')
    private readonly messageRepository: AgentHistoryRepository<AgentMessageWorkspaceEntity>,
    @InjectMessageQueue(MessageQueue.aiStreamQueue)
    private readonly chatMessageQueueService: MessageQueueService,
    private readonly streamHeartbeatService: AgentChatStreamHeartbeatService,
    private readonly parkedRunsService: AgentChatParkedRunsService,
    private readonly eventPublisherService: AgentChatEventPublisherService,
    private readonly metricsService: MetricsService,
    private readonly turnRecorderService: AgentTurnRecorderService,
  ) {}

  // a member who stopped the turn, or a run about to take the queue itself, leaves the queue where it is
  async release({
    turnError,
    shouldFlush,
    ...claim
  }: AgentChatStreamClaim & {
    turnError?: StreamErrorPayload;
    shouldFlush: boolean;
  }): Promise<boolean> {
    const { threadId, workspaceId, streamId } = claim;

    if (isDefined(turnError)) {
      await this.eventPublisherService
        .resetOwnedStreamState({ threadId, streamId })
        .catch((error: unknown) =>
          this.logger.warn(
            `Failed to reset the stream state of thread ${threadId} in workspace ${workspaceId}: ${formatErrorWithCause(error)}`,
          ),
        );
    }

    const isReleased = await this.turnRecorderService
      .releaseStreamClaim({
        ...claim,
        endRunningTurn: isDefined(turnError)
          ? { status: AgentTurnStatus.FAILED, error: turnError }
          : undefined,
      })
      .catch((error: unknown) => {
        this.logger.error(
          `Failed to release stream claim for thread ${threadId}: ${formatErrorWithCause(error)}`,
        );

        return false;
      });

    await this.streamHeartbeatService.clear(streamId);

    if (!isReleased) {
      return false;
    }

    if (isDefined(turnError)) {
      await this.publishStreamError({ threadId, workspaceId, turnError });
    }

    if (shouldFlush) {
      await this.flushQueuedMessages({ threadId, workspaceId });
    }

    await this.parkedRunsService.wake({ workspaceId, threadId });

    return true;
  }

  async tryClaimStream({
    threadId,
    workspaceId,
    streamId,
    where = {},
  }: AgentChatStreamClaim & {
    where?: FindOptionsWhere<AgentChatThreadWorkspaceEntity>;
  }): Promise<boolean> {
    await this.streamHeartbeatService.markClaimed(streamId);

    const claim = await this.threadRepository.update(
      workspaceId,
      { id: threadId, activeStreamId: IsNull(), ...where },
      { activeStreamId: streamId },
    );

    if (!claim.affected) {
      await this.streamHeartbeatService.clear(streamId);

      return false;
    }

    return true;
  }

  // a conversation's subscriber reaps a stream whose worker died, and pings the channel so its iterator
  // wakes up and the transport stays open
  createSubscriberHeartbeat({
    workspaceId,
    threadId,
  }: {
    workspaceId: string;
    threadId: string;
  }): () => Promise<void> {
    let lastReapCheckAt = 0;

    return async () => {
      if (
        Date.now() - lastReapCheckAt >=
        AGENT_CHAT_STREAM_REAP_CHECK_INTERVAL_MS
      ) {
        lastReapCheckAt = Date.now();
        await this.reapDeadStreamOfThread({ workspaceId, threadId });
      }

      await this.eventPublisherService.publish({
        threadId,
        workspaceId,
        event: { type: 'keepalive' },
      });
    };
  }

  private async reapDeadStreamOfThread({
    workspaceId,
    threadId,
  }: {
    workspaceId: string;
    threadId: string;
  }): Promise<void> {
    const thread = await this.threadRepository
      .findOne(workspaceId, {
        where: { id: threadId },
        select: ['id', 'activeStreamId'],
      })
      .catch(() => null);

    if (!isDefined(thread)) {
      return;
    }

    await this.reapDeadStream({ thread, workspaceId }).catch(() => {});
  }

  async reapDeadStream({
    thread,
    workspaceId,
  }: {
    thread: Pick<AgentChatThreadWorkspaceEntity, 'id' | 'activeStreamId'>;
    workspaceId: string;
  }): Promise<StreamErrorPayload | null> {
    if (!isNonEmptyString(thread.activeStreamId)) {
      return null;
    }

    if (await this.streamHeartbeatService.isAlive(thread.activeStreamId)) {
      return null;
    }

    const interruptedError: StreamErrorPayload = {
      code: AiExceptionCode.STREAM_INTERRUPTED,
      message: 'The response was interrupted before it could finish.',
    };

    const hasReaped = await this.release({
      threadId: thread.id,
      workspaceId,
      streamId: thread.activeStreamId,
      turnError: interruptedError,
      shouldFlush: true,
    });

    if (!hasReaped) {
      return null;
    }

    this.metricsService.incrementCounterBy({
      key: MetricsKeys.AiChatTurnFailed,
      amount: 1,
      attributes: {
        failure_phase: 'interrupted',
        error_code: interruptedError.code,
      },
    });

    this.logger.error(
      `[AI_CHAT_TURN_FAILED] failurePhase=interrupted, threadId=${thread.id}, workspaceId=${workspaceId}: stream ${thread.activeStreamId} stopped sending heartbeats`,
    );

    return interruptedError;
  }

  private async flushQueuedMessages({
    threadId,
    workspaceId,
  }: {
    threadId: string;
    workspaceId: string;
  }): Promise<void> {
    try {
      const hasQueuedMessages = await this.messageRepository.existsBy(
        workspaceId,
        { threadId, status: AgentMessageStatus.QUEUED },
      );

      if (hasQueuedMessages) {
        await this.chatMessageQueueService.add<FlushQueuedAgentChatMessagesJobData>(
          FLUSH_QUEUED_AGENT_CHAT_MESSAGES_JOB_NAME,
          { workspaceId, threadId },
        );
      }
    } catch (error) {
      this.logger.error(
        `Failed to send the messages queued in thread ${threadId} of workspace ${workspaceId}: ${formatErrorWithCause(error)}`,
      );
    }
  }

  private async publishStreamError({
    threadId,
    workspaceId,
    turnError,
  }: {
    threadId: string;
    workspaceId: string;
    turnError: StreamErrorPayload;
  }): Promise<void> {
    await this.eventPublisherService
      .publish({
        threadId,
        workspaceId,
        event: {
          type: 'stream-error',
          code: turnError.code,
          message: turnError.message,
        },
      })
      .catch(() => {});
  }
}
