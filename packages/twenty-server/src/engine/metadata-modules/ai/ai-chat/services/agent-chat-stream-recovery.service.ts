import { Injectable, Logger } from '@nestjs/common';
import { isDefined, isNonEmptyString } from 'twenty-shared/utils';

import { MetricsService } from 'src/engine/core-modules/metrics/metrics.service';
import { MetricsKeys } from 'src/engine/core-modules/metrics/types/metrics-keys.type';
import { AgentChatThreadWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-chat-thread.workspace-entity';
import { AgentChatEventPublisherService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-event-publisher.service';
import { AgentChatStreamHeartbeatService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-stream-heartbeat.service';
import { formatErrorWithCause } from 'src/engine/metadata-modules/ai/ai-chat/utils/format-error-with-cause.util';
import {
  mapErrorToStreamError,
  type StreamErrorPayload,
} from 'src/engine/metadata-modules/ai/ai-chat/utils/map-error-to-stream-error.util';
import { AgentTurnStatus } from 'src/engine/metadata-modules/ai/ai-history/enums/agent-turn-status.enum';
import { AgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/agent-history-repository';
import { buildReleaseStreamClaimQuery } from 'src/engine/metadata-modules/ai/ai-history/utils/build-release-stream-claim-query.util';
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
    private readonly eventPublisherService: AgentChatEventPublisherService,
    private readonly metricsService: MetricsService,
  ) {}

  async releaseStreamClaim({
    threadId,
    workspaceId,
    streamId,
    turnError,
  }: AgentChatStreamClaim & {
    turnError?: StreamErrorPayload;
  }): Promise<boolean> {
    const isReleased = await this.clearStreamClaim({
      threadId,
      workspaceId,
      streamId,
      turnError,
    }).catch((error: unknown) => {
      this.logger.error(
        `Failed to release stream claim for thread ${threadId}: ${formatErrorWithCause(error)}`,
      );

      return false;
    });

    await this.streamHeartbeatService.clear(streamId);

    return isReleased;
  }

  // The error belongs to the turn the stream was running, and is only written
  // by the caller still holding the claim
  private async clearStreamClaim({
    threadId,
    workspaceId,
    streamId,
    turnError,
  }: AgentChatStreamClaim & {
    turnError?: StreamErrorPayload;
  }): Promise<boolean> {
    return this.threadRepository.query(
      workspaceId,
      async ({ manager, table }) => {
        const releasedThreads = await manager.query<{ id: string }[]>(
          buildReleaseStreamClaimQuery({ table }),
          [
            threadId,
            streamId,
            isDefined(turnError) ? AgentTurnStatus.FAILED : null,
            isDefined(turnError) ? JSON.stringify(turnError) : null,
          ],
        );

        return releasedThreads.length > 0;
      },
    );
  }

  async failStream({
    threadId,
    workspaceId,
    streamId,
    error,
  }: AgentChatStreamClaim & { error: unknown }): Promise<void> {
    const turnError = mapErrorToStreamError(error);

    const isReleased = await this.releaseStreamClaim({
      threadId,
      workspaceId,
      streamId,
      turnError,
    });

    if (isReleased) {
      await this.publishStreamError({ threadId, workspaceId, turnError });
    }
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

    const hasReaped = await this.clearStreamClaim({
      threadId: thread.id,
      workspaceId,
      streamId: thread.activeStreamId,
      turnError: interruptedError,
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

    await this.eventPublisherService.resetStreamState(thread.id);
    await this.publishStreamError({
      threadId: thread.id,
      workspaceId,
      turnError: interruptedError,
    });

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
