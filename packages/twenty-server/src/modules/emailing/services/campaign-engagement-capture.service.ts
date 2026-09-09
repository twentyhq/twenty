import { Injectable, Logger } from '@nestjs/common';

import { v4 } from 'uuid';

import { CAMPAIGN_ENGAGEMENT_RECORD_RETRY_BACKOFF } from 'src/engine/core-modules/emailing-domain/constants/campaign-engagement-record-retry-backoff.constant';
import { CAMPAIGN_ENGAGEMENT_RECORD_RETRY_LIMIT } from 'src/engine/core-modules/emailing-domain/constants/campaign-engagement-record-retry-limit.constant';
import { RECORD_CAMPAIGN_ENGAGEMENT_JOB } from 'src/engine/core-modules/emailing-domain/constants/record-campaign-engagement-job.constant';
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

const CAPTURE_RATE_LIMIT_PER_TARGET = { maxRequests: 60, windowMs: 60_000 };

const RESPONSE_RELEASE_BUDGET_MS = 100;

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

  async capture({
    payload,
    userAgent,
  }: {
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
      destinationId: payload.purpose === 'CLICK' ? payload.destinationId : null,
      messagePart: payload.messagePart,
      userAgent,
    };

    await this.releaseResponseAfterBudget(
      this.throttleAndEnqueue({ payload, observation }),
    );
  }

  private async throttleAndEnqueue({
    payload,
    observation,
  }: {
    payload: CampaignTrackingTokenPayload;
    observation: CampaignEngagementObservation;
  }): Promise<void> {
    try {
      await this.throttlerService.tokenBucketThrottleOrThrow(
        this.buildThrottleKey(payload),
        1,
        CAPTURE_RATE_LIMIT_PER_TARGET.maxRequests,
        CAPTURE_RATE_LIMIT_PER_TARGET.windowMs,
      );

      await this.messageQueueService.add<CampaignEngagementObservation>(
        RECORD_CAMPAIGN_ENGAGEMENT_JOB,
        observation,
        {
          retryLimit: CAMPAIGN_ENGAGEMENT_RECORD_RETRY_LIMIT,
          backoff: CAMPAIGN_ENGAGEMENT_RECORD_RETRY_BACKOFF,
        },
      );
    } catch (error) {
      if (error instanceof ThrottlerException) {
        this.metricsService.incrementCounterBy({
          key: MetricsKeys.CampaignEngagementCaptureThrottled,
          amount: 1,
        });

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

  private buildThrottleKey(payload: CampaignTrackingTokenPayload): string {
    switch (payload.purpose) {
      case 'CLICK':
        return `campaign-engagement:click:${payload.deliveryId}:${payload.destinationId}`;
      case 'OPEN':
        return `campaign-engagement:open:${payload.deliveryId}`;
    }
  }

  private async releaseResponseAfterBudget(
    recording: Promise<void>,
  ): Promise<void> {
    let releaseTimer: NodeJS.Timeout | undefined;

    const release = new Promise<void>((resolve) => {
      releaseTimer = setTimeout(resolve, RESPONSE_RELEASE_BUDGET_MS);
    });

    try {
      await Promise.race([recording, release]);
    } finally {
      clearTimeout(releaseTimer);
    }
  }
}
