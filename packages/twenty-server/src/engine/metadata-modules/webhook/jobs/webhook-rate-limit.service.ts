import { Injectable, Logger } from '@nestjs/common';

import { FeatureFlagKey } from 'twenty-shared/types';

import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { MetricsService } from 'src/engine/core-modules/metrics/metrics.service';
import { MetricsKeys } from 'src/engine/core-modules/metrics/types/metrics-keys.type';
import { UsageLimitSpeedService } from 'src/engine/core-modules/usage-limit/services/usage-limit-speed.service';
import { type SpeedBucketRequest } from 'src/engine/core-modules/usage-limit/types/speed-bucket-request.type';
import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';
import { type WebhookJobData } from 'src/engine/metadata-modules/webhook/types/webhook-job-data.type';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';

@Injectable()
export class WebhookRateLimitService {
  private readonly logger = new Logger(WebhookRateLimitService.name);

  constructor(
    private readonly usageLimitSpeedService: UsageLimitSpeedService,
    private readonly featureFlagService: FeatureFlagService,
    private readonly metricsService: MetricsService,
  ) {}

  async admitWebhookEventsWithinRateLimit<
    TWebhookEvent extends WebhookJobData,
  >({
    workspaceId,
    webhookEvents,
  }: {
    workspaceId: string;
    webhookEvents: TWebhookEvent[];
  }): Promise<TWebhookEvent[]> {
    if (webhookEvents.length === 0) {
      return webhookEvents;
    }

    const isWebhookRateLimitEnabled =
      await this.featureFlagService.isFeatureEnabled(
        FeatureFlagKey.IS_WEBHOOK_RATE_LIMIT_ENABLED,
        workspaceId,
      );

    if (!isWebhookRateLimitEnabled) {
      return webhookEvents;
    }

    const outcome = await this.usageLimitSpeedService.tryConsumeUpTo({
      resourceType: UsageResourceType.WEBHOOK,
      operationType: UsageOperationType.WEBHOOK_CALL,
      authContext: buildSystemAuthContext(workspaceId),
      maxCost: webhookEvents.length,
    });

    if (!outcome.admitted) {
      this.dropThrottledWebhookCalls({
        workspaceId,
        droppedCallCount: webhookEvents.length - outcome.admittedCount,
        exhaustedBucket: outcome.exhausted,
      });
    }

    return webhookEvents.slice(0, outcome.admittedCount);
  }

  private dropThrottledWebhookCalls({
    workspaceId,
    droppedCallCount,
    exhaustedBucket,
  }: {
    workspaceId: string;
    droppedCallCount: number;
    exhaustedBucket: SpeedBucketRequest;
  }): void {
    this.logger.warn(
      `Dropped ${droppedCallCount} webhook calls for workspace ${workspaceId}, which exceeded ${exhaustedBucket.refillPerWindow} webhook calls per ${exhaustedBucket.windowMs / 1000}s`,
    );

    this.metricsService.incrementCounterBy({
      key: MetricsKeys.JobWebhookCallThrottled,
      amount: droppedCallCount,
    });
  }
}
