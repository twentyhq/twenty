import { Injectable, Logger } from '@nestjs/common';
import { type FindOptionsWhere, IsNull } from 'typeorm';
import { isDefined, isNonEmptyString } from 'twenty-shared/utils';

import { MetricsService } from 'src/engine/core-modules/metrics/metrics.service';
import { MetricsKeys } from 'src/engine/core-modules/metrics/types/metrics-keys.type';
import { AgentChatThreadWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-chat-thread.workspace-entity';
import { AgentChatEventPublisherService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-event-publisher.service';
import { AgentChatStreamHeartbeatService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-stream-heartbeat.service';
import { AgentChatWaitingLineService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-waiting-line.service';
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
    private readonly streamHeartbeatService: AgentChatStreamHeartbeatService,
    private readonly waitingLineService: AgentChatWaitingLineService,
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

    await this.waitingLineService
      .wakeNext({
        workspaceId,
        threadId,
        shouldHoldQueuedMessages: !shouldFlush,
      })
      .catch((error: unknown) =>
        this.logger.error(
          `Failed to wake what waits on thread ${threadId} in workspace ${workspaceId}: ${formatErrorWithCause(error)}`,
        ),
      );

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
