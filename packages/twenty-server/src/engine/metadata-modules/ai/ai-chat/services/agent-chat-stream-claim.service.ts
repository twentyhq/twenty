import { Inject, Injectable, Logger } from '@nestjs/common';
import { generateId } from 'ai';
import { isDefined } from 'twenty-shared/utils';

import { MetricsService } from 'src/engine/core-modules/metrics/metrics.service';
import { MetricsKeys } from 'src/engine/core-modules/metrics/types/metrics-keys.type';
import { AgentChatStreamRecoveryService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-stream-recovery.service';
import { formatErrorWithCause } from 'src/engine/metadata-modules/ai/ai-chat/utils/format-error-with-cause.util';
import { mapErrorToStreamError } from 'src/engine/metadata-modules/ai/ai-history/utils/map-error-to-stream-error.util';

@Injectable()
export class AgentChatStreamClaimService {
  private readonly logger = new Logger(AgentChatStreamClaimService.name);

  @Inject(AgentChatStreamRecoveryService)
  private readonly streamRecoveryService: AgentChatStreamRecoveryService;

  @Inject(MetricsService)
  private readonly metricsService: MetricsService;

  async run<TResult>({
    threadId,
    workspaceId,
    modelId,
    start,
  }: {
    threadId: string;
    workspaceId: string;
    modelId?: string;
    start: (streamId: string) => Promise<TResult | null>;
  }): Promise<TResult | null> {
    const claim = { threadId, workspaceId, streamId: generateId() };

    if (!(await this.streamRecoveryService.tryClaimStream(claim))) {
      return null;
    }

    try {
      const started = await start(claim.streamId);

      if (!isDefined(started)) {
        await this.streamRecoveryService.release({
          ...claim,
          shouldFlush: true,
        });
      }

      return started;
    } catch (error) {
      await this.streamRecoveryService.release({
        ...claim,
        turnError: mapErrorToStreamError(error),
        shouldFlush: true,
      });

      const model = modelId ?? 'unknown';

      this.metricsService.incrementCounterBy({
        key: MetricsKeys.AiChatTurnFailed,
        amount: 1,
        attributes: {
          model,
          failure_phase: 'enqueue',
          error_code: mapErrorToStreamError(error).code,
        },
      });

      this.logger.error(
        `[AI_CHAT_TURN_FAILED] failurePhase=enqueue, model=${model}, threadId=${threadId}, workspaceId=${workspaceId}: ${formatErrorWithCause(error)}`,
      );

      throw error;
    }
  }
}
