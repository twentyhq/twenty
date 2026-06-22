import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { LessThanOrEqual, Repository } from 'typeorm';

import { SentryCronMonitor } from 'src/engine/core-modules/cron/sentry-cron-monitor.decorator';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { ConnectedAccountWebhookSubscriptionEntity } from 'src/engine/metadata-modules/connected-account-webhook-subscription/entities/connected-account-webhook-subscription.entity';
import { WebhookSubscriptionChannelType } from 'src/engine/metadata-modules/connected-account-webhook-subscription/enums/webhook-subscription-channel-type.enum';
import { WebhookSubscriptionStatus } from 'src/engine/metadata-modules/connected-account-webhook-subscription/enums/webhook-subscription-status.enum';
import { WEBHOOK_SUBSCRIPTION_RENEWAL_BUFFER_MS } from 'src/modules/connected-account/webhook-subscription-manager/constants/webhook-subscription-renewal-buffer-ms.constant';
import { WEBHOOK_SUBSCRIPTION_RENEWAL_CRON_PATTERN } from 'src/modules/connected-account/webhook-subscription-manager/constants/webhook-subscription-renewal-cron-pattern.constant';
import { CalendarWebhookSubscriptionService } from 'src/modules/connected-account/webhook-subscription-manager/services/calendar-webhook-subscription.service';
import { MessagingWebhookSubscriptionService } from 'src/modules/connected-account/webhook-subscription-manager/services/messaging-webhook-subscription.service';

@Processor(MessageQueue.cronQueue)
export class WebhookSubscriptionRenewalCronJob {
  private readonly logger = new Logger(WebhookSubscriptionRenewalCronJob.name);

  constructor(
    @InjectRepository(ConnectedAccountWebhookSubscriptionEntity)
    private readonly webhookSubscriptionRepository: Repository<ConnectedAccountWebhookSubscriptionEntity>,
    private readonly messagingWebhookSubscriptionService: MessagingWebhookSubscriptionService,
    private readonly calendarWebhookSubscriptionService: CalendarWebhookSubscriptionService,
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

    const expiringMessagingSubscriptions =
      await this.webhookSubscriptionRepository.find({
        where: {
          status: WebhookSubscriptionStatus.ACTIVE,
          expiresAt: LessThanOrEqual(renewalThreshold),
          channelType: WebhookSubscriptionChannelType.MESSAGING,
        },
      });

    const expiringCalendarSubscriptions =
      await this.webhookSubscriptionRepository.find({
        where: {
          status: WebhookSubscriptionStatus.ACTIVE,
          expiresAt: LessThanOrEqual(renewalThreshold),
          channelType: WebhookSubscriptionChannelType.CALENDAR,
        },
      });

    const expiringSubscriptionCount =
      expiringMessagingSubscriptions.length +
      expiringCalendarSubscriptions.length;

    if (expiringSubscriptionCount === 0) {
      return;
    }

    this.logger.log(
      `Renewing ${expiringSubscriptionCount} webhook subscriptions`,
    );

    for (const subscription of expiringMessagingSubscriptions) {
      try {
        await this.messagingWebhookSubscriptionService.renewSubscription(
          subscription,
        );
      } catch (error) {
        this.logger.warn(
          `Failed to renew messaging webhook subscription ${subscription.id}`,
          error,
        );
      }
    }

    for (const subscription of expiringCalendarSubscriptions) {
      try {
        await this.calendarWebhookSubscriptionService.renewSubscription(
          subscription,
        );
      } catch (error) {
        this.logger.warn(
          `Failed to renew calendar webhook subscription ${subscription.id}`,
          error,
        );
      }
    }
  }
}
