import { Injectable, Logger } from '@nestjs/common';

import { v4 } from 'uuid';

import {
  CAMPAIGN_ENGAGEMENT_RECORD_RETRY_BACKOFF,
  CAMPAIGN_ENGAGEMENT_RECORD_RETRY_LIMIT,
} from 'src/engine/core-modules/emailing-domain/constants/campaign-engagement-record-retry.constant';
import { RECORD_CAMPAIGN_ENGAGEMENT_JOB } from 'src/engine/core-modules/emailing-domain/constants/campaign.constant';
import { type CampaignTrackingTokenPayload } from 'src/engine/core-modules/emailing-domain/types/campaign-tracking-token-payload.type';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { MetricsService } from 'src/engine/core-modules/metrics/metrics.service';
import { MetricsKeys } from 'src/engine/core-modules/metrics/types/metrics-keys.type';
import { ThrottlerException } from 'src/engine/core-modules/throttler/throttler.exception';
import { ThrottlerService } from 'src/engine/core-modules/throttler/throttler.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { type CampaignEngagementObservation } from 'src/modules/emailing/types/campaign-engagement-observation.type';

// A replayed token captures at most this many events per window; the
// redirect itself is never limited.
const CAPTURE_RATE_LIMIT = { maxRequests: 60, windowMs: 60_000 };

// The queue client retries commands until Redis is back, which is right for
// workers and wrong for a reader waiting on a redirect. The response is
// released after this budget; a command still pending flushes on reconnect.
const ENQUEUE_BUDGET_MS = 100;

@Injectable()
export class CampaignEngagementCaptureService {
  private readonly logger = new Logger(CampaignEngagementCaptureService.name);

  constructor(
    @InjectMessageQueue(MessageQueue.campaignEngagementQueue)
    private readonly messageQueueService: MessageQueueService,
    private readonly throttlerService: ThrottlerService,
    private readonly metricsService: MetricsService,
    private readonly twentyConfigService: TwentyConfigService,
  ) {}

  // Never throws: the recipient's redirect or pixel is already decided by the
  // time this runs, and analytics must not change that outcome.
  async capture({
    token,
    payload,
    userAgent,
  }: {
    token: string;
    payload: CampaignTrackingTokenPayload;
    userAgent: string | null;
  }): Promise<void> {
    if (!this.twentyConfigService.get('CAMPAIGN_TRACKING_CAPTURE_ENABLED')) {
      return;
    }

    const observation: CampaignEngagementObservation = {
      eventId: v4(),
      occurredAt: new Date().toISOString(),
      eventType: payload.purpose,
      deliveryId: payload.deliveryId,
      destinationId: payload.destinationId,
      messagePart: payload.messagePart,
      userAgent,
    };

    try {
      await this.withinBudget(
        this.throttlerService.tokenBucketThrottleOrThrow(
          `campaign-engagement:${token}`,
          1,
          CAPTURE_RATE_LIMIT.maxRequests,
          CAPTURE_RATE_LIMIT.windowMs,
        ),
      );

      await this.withinBudget(
        this.messageQueueService.add<CampaignEngagementObservation>(
          RECORD_CAMPAIGN_ENGAGEMENT_JOB,
          observation,
          {
            retryLimit: CAMPAIGN_ENGAGEMENT_RECORD_RETRY_LIMIT,
            backoff: CAMPAIGN_ENGAGEMENT_RECORD_RETRY_BACKOFF,
          },
        ),
      );
    } catch (error) {
      if (error instanceof ThrottlerException) {
        return;
      }

      this.metricsService.incrementCounterBy({
        key: MetricsKeys.CampaignEngagementCaptureFailed,
        amount: 1,
      });
      this.logger.warn(
        `Dropped ${observation.eventType} event for delivery ${observation.deliveryId}: ${error}`,
      );
    }
  }

  private async withinBudget<TResult>(
    operation: Promise<TResult>,
  ): Promise<TResult> {
    let timer: NodeJS.Timeout | undefined;

    const budget = new Promise<never>((_resolve, reject) => {
      timer = setTimeout(
        () => reject(new Error(`Exceeded ${ENQUEUE_BUDGET_MS}ms budget`)),
        ENQUEUE_BUDGET_MS,
      );
    });

    try {
      return await Promise.race([operation, budget]);
    } finally {
      clearTimeout(timer);
    }
  }
}
