import { Injectable } from '@nestjs/common';
import { isDefined } from 'twenty-shared/utils';

import { MetricsService } from 'src/engine/core-modules/metrics/metrics.service';
import { MetricsKeys } from 'src/engine/core-modules/metrics/types/metrics-keys.type';
import { type AgentChatThreadEntity } from 'src/engine/metadata-modules/ai/ai-chat/entities/agent-chat-thread.entity';
import { AgentChatEventPublisherService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-event-publisher.service';
import { AgentChatStreamHeartbeatService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-stream-heartbeat.service';
import { type AgentChatThreadLastStreamError } from 'src/engine/metadata-modules/ai/ai-chat/types/agent-chat-thread-last-stream-error.type';
import { AgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/agent-history-repository';
import { AiExceptionCode } from 'src/engine/metadata-modules/ai/ai.exception';

import { InjectAgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/inject-agent-history-repository.decorator';

@Injectable()
export class AgentChatStreamRecoveryService {
  constructor(
    @InjectAgentHistoryRepository('agentChatThread')
    private readonly threadRepository: AgentHistoryRepository<AgentChatThreadEntity>,
    private readonly streamHeartbeatService: AgentChatStreamHeartbeatService,
    private readonly eventPublisherService: AgentChatEventPublisherService,
    private readonly metricsService: MetricsService,
  ) {}

  async reapDeadStream({
    thread,
    workspaceId,
  }: {
    thread: Pick<AgentChatThreadEntity, 'id' | 'activeStreamId'>;
    workspaceId: string;
  }): Promise<AgentChatThreadLastStreamError | null> {
    if (!isDefined(thread.activeStreamId)) {
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

    const reap = await this.threadRepository.update(
      workspaceId,
      { id: thread.id, activeStreamId: thread.activeStreamId },
      { activeStreamId: null, lastStreamError: interruptedError },
    );

    if (!reap.affected) {
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

    await this.eventPublisherService.resetStreamState(thread.id);
    await this.eventPublisherService
      .publish({
        threadId: thread.id,
        workspaceId,
        event: {
          type: 'stream-error',
          code: interruptedError.code,
          message: interruptedError.message,
        },
      })
      .catch(() => {});

    return interruptedError;
  }
}
