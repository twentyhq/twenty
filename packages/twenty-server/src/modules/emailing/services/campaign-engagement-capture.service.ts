import { Injectable, Logger } from '@nestjs/common';

import { v4 } from 'uuid';

import { type CampaignTrackingTokenPayload } from 'src/engine/core-modules/emailing-domain/types/campaign-tracking-token-payload.type';
import { MetricsService } from 'src/engine/core-modules/metrics/metrics.service';
import { MetricsKeys } from 'src/engine/core-modules/metrics/types/metrics-keys.type';
import { ThrottlerException } from 'src/engine/core-modules/throttler/throttler.exception';
import { ThrottlerService } from 'src/engine/core-modules/throttler/throttler.service';
import { CAMPAIGN_ENGAGEMENT_CAPTURE_RATE_LIMIT_PER_LINK } from 'src/modules/emailing/constants/campaign-engagement-capture-rate-limit-per-link.constant';
import { CAMPAIGN_ENGAGEMENT_CAPTURE_RATE_LIMIT_PER_REQUESTER } from 'src/modules/emailing/constants/campaign-engagement-capture-rate-limit-per-requester.constant';
import { CampaignEngagementEventService } from 'src/modules/emailing/services/campaign-engagement-event.service';
import { CampaignEngagementRecordingService } from 'src/modules/emailing/services/campaign-engagement-recording.service';
import { type CampaignEngagementObservation } from 'src/modules/emailing/types/campaign-engagement-observation.type';

@Injectable()
export class CampaignEngagementCaptureService {
  private readonly logger = new Logger(CampaignEngagementCaptureService.name);

  constructor(
    private readonly throttlerService: ThrottlerService,
    private readonly metricsService: MetricsService,
    private readonly campaignEngagementEventService: CampaignEngagementEventService,
    private readonly campaignEngagementRecordingService: CampaignEngagementRecordingService,
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
      this.throttleAndRecord({ payload, observation, requesterIp }),
    );
  }

  private async throttleAndRecord({
    payload,
    observation,
    requesterIp,
  }: {
    payload: CampaignTrackingTokenPayload;
    observation: CampaignEngagementObservation;
    requesterIp: string | null;
  }): Promise<void> {
    try {
      await this.throttlerService.tokenBucketThrottleOrThrow(
        `campaign-engagement:requester:${requesterIp ?? 'unknown-requester'}`,
        1,
        CAMPAIGN_ENGAGEMENT_CAPTURE_RATE_LIMIT_PER_REQUESTER.maxRequests,
        CAMPAIGN_ENGAGEMENT_CAPTURE_RATE_LIMIT_PER_REQUESTER.windowMs,
      );

      await this.throttlerService.tokenBucketThrottleOrThrow(
        `campaign-engagement:${payload.deliveryId}:${payload.shortLinkId}`,
        1,
        CAMPAIGN_ENGAGEMENT_CAPTURE_RATE_LIMIT_PER_LINK.maxRequests,
        CAMPAIGN_ENGAGEMENT_CAPTURE_RATE_LIMIT_PER_LINK.windowMs,
      );

      await this.campaignEngagementRecordingService.record(observation);
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
    recording: Promise<void>,
  ): Promise<void> {
    let releaseTimer: NodeJS.Timeout | undefined;

    const release = new Promise<void>((resolve) => {
      releaseTimer = setTimeout(resolve, 100);
    });

    try {
      await Promise.race([recording, release]);
    } finally {
      clearTimeout(releaseTimer);
    }
  }
}
