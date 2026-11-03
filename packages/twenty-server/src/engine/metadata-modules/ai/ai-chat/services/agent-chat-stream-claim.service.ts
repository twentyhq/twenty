import { Injectable, Logger } from '@nestjs/common';
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

  constructor(
    private readonly streamRecoveryService: AgentChatStreamRecoveryService,
    private readonly metricsService: MetricsService,
  ) {}

  async claimAndStartStream<TResult>({
    threadId,
    workspaceId,
    modelId,
    startStream,
  }: {
    threadId: string;
    workspaceId: string;
    modelId?: string;
    startStream: (streamId: string) => Promise<TResult | null>;
  }): Promise<TResult | null> {
    const streamClaim = { threadId, workspaceId, streamId: generateId() };

    if (!(await this.streamRecoveryService.tryClaimStream(streamClaim))) {
      return null;
    }

    try {
      const streamStartResult = await startStream(streamClaim.streamId);

      if (!isDefined(streamStartResult)) {
        await this.streamRecoveryService.release({
          ...streamClaim,
          shouldFlush: true,
        });
      }

      return streamStartResult;
    } catch (error) {
      await this.streamRecoveryService.release({
        ...streamClaim,
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
