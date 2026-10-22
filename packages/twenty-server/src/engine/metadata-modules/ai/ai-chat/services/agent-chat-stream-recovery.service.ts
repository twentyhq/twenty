import { Injectable, Logger } from '@nestjs/common';
import { type FindOptionsWhere, IsNull } from 'typeorm';
import { isDefined, isNonEmptyString } from 'twenty-shared/utils';

import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { PendingWakeUpService } from 'src/engine/core-modules/pending-wake-up/services/pending-wake-up.service';
import { MetricsService } from 'src/engine/core-modules/metrics/metrics.service';
import { MetricsKeys } from 'src/engine/core-modules/metrics/types/metrics-keys.type';
import { AgentChatThreadWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-chat-thread.workspace-entity';
import { type AgentMessageWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-message.workspace-entity';
import { AgentMessageStatus } from 'src/engine/metadata-modules/ai/ai-history/enums/agent-message-status.enum';
import { AGENT_CHAT_WAITING_RUN_OWNER_TYPE } from 'src/engine/metadata-modules/ai/ai-chat/constants/agent-chat-waiting-run-owner-type.constant';
import { FLUSH_QUEUED_AGENT_CHAT_MESSAGES_JOB_NAME } from 'src/engine/metadata-modules/ai/ai-chat/jobs/flush-queued-agent-chat-messages-job-name.constant';
import { type FlushQueuedAgentChatMessagesJobData } from 'src/engine/metadata-modules/ai/ai-chat/jobs/flush-queued-agent-chat-messages-job.types';
import { AgentChatEventPublisherService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-event-publisher.service';
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
    private readonly pendingWakeUpService: PendingWakeUpService,
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

    await this.wakeNext({ threadId, workspaceId, shouldFlush });

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

  // the oldest queued message is the queue's place in line, so it and the runs go in the order they came
  async wakeNext({
    threadId,
    workspaceId,
    shouldFlush,
  }: {
    threadId: string;
    workspaceId: string;
    shouldFlush: boolean;
  }): Promise<void> {
    try {
      const [nextRun, oldestQueuedMessage] = await Promise.all([
        this.pendingWakeUpService.findOldest({
          workspaceId,
          owner: { type: AGENT_CHAT_WAITING_RUN_OWNER_TYPE, id: threadId },
        }),
        shouldFlush
          ? this.messageRepository.findOne(workspaceId, {
              where: { threadId, status: AgentMessageStatus.QUEUED },
              order: { createdAt: 'ASC' },
            })
          : null,
      ]);

      if (
        isDefined(oldestQueuedMessage) &&
        (!isDefined(nextRun) ||
          new Date(oldestQueuedMessage.createdAt) <= nextRun.createdAt)
      ) {
        await this.chatMessageQueueService.add<FlushQueuedAgentChatMessagesJobData>(
          FLUSH_QUEUED_AGENT_CHAT_MESSAGES_JOB_NAME,
          { workspaceId, threadId },
        );
      } else if (isDefined(nextRun)) {
        await this.pendingWakeUpService.scheduleResolution({ wakeUp: nextRun });
      }
    } catch (error) {
      this.logger.error(
        `Failed to wake what waits on thread ${threadId} of workspace ${workspaceId}: ${formatErrorWithCause(error)}`,
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
