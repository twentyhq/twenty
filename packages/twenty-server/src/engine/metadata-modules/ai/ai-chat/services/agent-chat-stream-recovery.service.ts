import { Injectable, Logger } from '@nestjs/common';
import { isDefined, isNonEmptyString } from 'twenty-shared/utils';

import { MetricsService } from 'src/engine/core-modules/metrics/metrics.service';
import { MetricsKeys } from 'src/engine/core-modules/metrics/types/metrics-keys.type';
import { AgentChatThreadWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-chat-thread.workspace-entity';
import { AgentChatEventPublisherService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-event-publisher.service';
import { AgentChatStreamHeartbeatService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-stream-heartbeat.service';
import { type AgentChatThreadLastStreamError } from 'src/engine/metadata-modules/ai/ai-chat/types/agent-chat-thread-last-stream-error.type';
import { formatErrorWithCause } from 'src/engine/metadata-modules/ai/ai-chat/utils/format-error-with-cause.util';
import { mapErrorToStreamError } from 'src/engine/metadata-modules/ai/ai-chat/utils/map-error-to-stream-error.util';
import { AgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/agent-history-repository';
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
    lastStreamError,
  }: AgentChatStreamClaim & {
    lastStreamError?: AgentChatThreadLastStreamError;
  }): Promise<boolean> {
    const release = await this.threadRepository
      .update(
        workspaceId,
        { id: threadId, activeStreamId: streamId },
        {
          activeStreamId: null,
          ...(isDefined(lastStreamError) ? { lastStreamError } : {}),
        },
      )
      .catch((error: unknown) => {
        this.logger.error(
          `Failed to release stream claim for thread ${threadId}: ${formatErrorWithCause(error)}`,
        );

        return null;
      });

    await this.streamHeartbeatService.clear(streamId);

    return Boolean(release?.affected);
  }

  async failStream({
    threadId,
    workspaceId,
    streamId,
    error,
  }: AgentChatStreamClaim & { error: unknown }): Promise<void> {
    const lastStreamError: AgentChatThreadLastStreamError = {
      ...mapErrorToStreamError(error),
      failedAt: new Date().toISOString(),
    };

    const isReleased = await this.releaseStreamClaim({
      threadId,
      workspaceId,
      streamId,
      lastStreamError,
    });

    if (isReleased) {
      await this.publishStreamError({ threadId, workspaceId, lastStreamError });
    }
  }

  async reapDeadStream({
    thread,
    workspaceId,
  }: {
    thread: Pick<AgentChatThreadWorkspaceEntity, 'id' | 'activeStreamId'>;
    workspaceId: string;
  }): Promise<AgentChatThreadLastStreamError | null> {
    if (!isNonEmptyString(thread.activeStreamId)) {
      return null;
    }

    if (await this.streamHeartbeatService.isAlive(thread.activeStreamId)) {
      return null;
    }

    const interruptedError: AgentChatThreadLastStreamError = {
      code: AiExceptionCode.STREAM_INTERRUPTED,
      message: 'The response was interrupted before it could finish.',
      failedAt: new Date().toISOString(),
    };

    const hasReaped = await this.releaseStreamClaim({
      threadId: thread.id,
      workspaceId,
      streamId: thread.activeStreamId,
      lastStreamError: interruptedError,
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
      lastStreamError: interruptedError,
    });

    return interruptedError;
  }

  private async publishStreamError({
    threadId,
    workspaceId,
    lastStreamError,
  }: {
    threadId: string;
    workspaceId: string;
    lastStreamError: AgentChatThreadLastStreamError;
  }): Promise<void> {
    await this.eventPublisherService
      .publish({
        threadId,
        workspaceId,
        event: {
          type: 'stream-error',
          code: lastStreamError.code,
          message: lastStreamError.message,
        },
      })
      .catch(() => {});
  }
}
