import { Injectable, Logger } from '@nestjs/common';

import { v4 } from 'uuid';

import { RECORD_CAMPAIGN_ENGAGEMENT_JOB } from 'src/engine/core-modules/emailing-domain/constants/record-campaign-engagement-job.constant';
import { type CampaignTrackingTokenPayload } from 'src/engine/core-modules/emailing-domain/types/campaign-tracking-token-payload.type';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { MetricsService } from 'src/engine/core-modules/metrics/metrics.service';
import { MetricsKeys } from 'src/engine/core-modules/metrics/types/metrics-keys.type';
import { ThrottlerException } from 'src/engine/core-modules/throttler/throttler.exception';
import { ThrottlerService } from 'src/engine/core-modules/throttler/throttler.service';
import { CampaignEngagementEventService } from 'src/modules/emailing/services/campaign-engagement-event.service';
import { type CampaignEngagementObservation } from 'src/modules/emailing/types/campaign-engagement-observation.type';
import { getCampaignEngagementThrottleLimits } from 'src/modules/emailing/utils/get-campaign-engagement-throttle-limits.util';

const RESPONSE_RELEASE_BUDGET_MS = 100;

@Injectable()
export class CampaignEngagementCaptureService {
  private readonly logger = new Logger(CampaignEngagementCaptureService.name);

  constructor(
    @InjectMessageQueue(MessageQueue.campaignEngagementQueue)
    private readonly messageQueueService: MessageQueueService,
    private readonly throttlerService: ThrottlerService,
    private readonly metricsService: MetricsService,
    private readonly campaignEngagementEventService: CampaignEngagementEventService,
  ) {}

  async capture({
    payload,
    userAgent,
    requesterIp,
  }: {
    payload: CampaignTrackingTokenPayload;
    userAgent: string | null;
    requesterIp: string | null;
  }): Promise<void> {
    if (!this.campaignEngagementEventService.isAvailable()) {
      return;
    }

    const observation: CampaignEngagementObservation = {
      eventId: v4(),
      occurredAt: new Date().toISOString(),
      deliveryId: payload.deliveryId,
      shortLinkId: payload.shortLinkId,
      userAgent,
    };

    await this.releaseResponseAfterBudget(
      this.throttleAndEnqueue({ payload, observation, requesterIp }),
    );
  }

  private async throttleAndEnqueue({
    payload,
    observation,
    requesterIp,
  }: {
    payload: CampaignTrackingTokenPayload;
    observation: CampaignEngagementObservation;
    requesterIp: string | null;
  }): Promise<void> {
    try {
      for (const limit of getCampaignEngagementThrottleLimits({
        payload,
        requesterIp,
      })) {
        await this.throttlerService.tokenBucketThrottleOrThrow(
          limit.key,
          1,
          limit.maxRequests,
          limit.windowMs,
        );
      }

      await this.messageQueueService.add<CampaignEngagementObservation>(
        RECORD_CAMPAIGN_ENGAGEMENT_JOB,
        observation,
        {
          retryLimit: 14,
          backoff: {
            strategy: 'exponential',
            initialDelayMilliseconds: 5_000,
            jitter: 0.5,
          },
        },
      );
    } catch (error) {
      const isThrottled = error instanceof ThrottlerException;

      this.metricsService.incrementCounterBy({
        key: isThrottled
          ? MetricsKeys.CampaignEngagementCaptureThrottled
          : MetricsKeys.CampaignEngagementCaptureFailed,
        amount: 1,
      });

      if (isThrottled) {
        return;
      }

      this.logger.warn(
        `Dropped click event for delivery ${observation.deliveryId}: ${error}`,
      );
    }
  }

  private async releaseResponseAfterBudget(
    enqueueing: Promise<void>,
  ): Promise<void> {
    let releaseTimer: NodeJS.Timeout | undefined;

    const release = new Promise<void>((resolve) => {
      releaseTimer = setTimeout(resolve, RESPONSE_RELEASE_BUDGET_MS);
    });

    try {
      await Promise.race([enqueueing, release]);
    } finally {
      clearTimeout(releaseTimer);
    }
  }
}
