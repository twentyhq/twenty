import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { LessThanOrEqual, Repository } from 'typeorm';

import { SentryCronMonitor } from 'src/engine/core-modules/cron/sentry-cron-monitor.decorator';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { ConnectedAccountWebhookSubscriptionEntity } from 'src/engine/metadata-modules/connected-account-webhook-subscription/entities/connected-account-webhook-subscription.entity';
import {
  WEBHOOK_SUBSCRIPTION_RENEWAL_BUFFER_MS,
  WEBHOOK_SUBSCRIPTION_RENEWAL_CRON_PATTERN,
} from 'src/modules/connected-account/webhook-subscription-manager/constants/webhook-subscription.constants';
import { WebhookSubscriptionService } from 'src/modules/connected-account/webhook-subscription-manager/services/webhook-subscription.service';

@Processor(MessageQueue.cronQueue)
export class WebhookSubscriptionRenewalCronJob {
  private readonly logger = new Logger(WebhookSubscriptionRenewalCronJob.name);

  constructor(
    @InjectRepository(ConnectedAccountWebhookSubscriptionEntity)
    private readonly webhookSubscriptionRepository: Repository<ConnectedAccountWebhookSubscriptionEntity>,
    private readonly webhookSubscriptionService: WebhookSubscriptionService,
  ) {}

  @Process(WebhookSubscriptionRenewalCronJob.name)
  @SentryCronMonitor(
    WebhookSubscriptionRenewalCronJob.name,
    WEBHOOK_SUBSCRIPTION_RENEWAL_CRON_PATTERN,
  )
  async handle(): Promise<void> {
    const renewalThreshold = new Date(
      Date.now() + WEBHOOK_SUBSCRIPTION_RENEWAL_BUFFER_MS,
    );

    const expiringSubscriptions = await this.webhookSubscriptionRepository.find(
      {
        where: {
          status: 'ACTIVE',
          expiresAt: LessThanOrEqual(renewalThreshold),
        },
      },
    );

    if (expiringSubscriptions.length === 0) {
      return;
    }

    this.logger.log(
      `Renewing ${expiringSubscriptions.length} webhook subscriptions`,
    );

    for (const subscription of expiringSubscriptions) {
      await this.webhookSubscriptionService.renewSubscription(subscription);
    }
  }
}
