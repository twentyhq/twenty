import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { WebhookSubscriptionStatus } from 'twenty-shared/types';
import { LessThanOrEqual, Repository } from 'typeorm';

import { SentryCronMonitor } from 'src/engine/core-modules/cron/sentry-cron-monitor.decorator';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { CalendarChannelEntity } from 'src/engine/metadata-modules/calendar-channel/entities/calendar-channel.entity';
import { MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';
import { WEBHOOK_SUBSCRIPTION_RENEWAL_BUFFER_MS } from 'src/modules/connected-account/webhook-subscription-manager/constants/webhook-subscription-renewal-buffer-ms.constant';
import { WEBHOOK_SUBSCRIPTION_RENEWAL_CRON_PATTERN } from 'src/modules/connected-account/webhook-subscription-manager/constants/webhook-subscription-renewal-cron-pattern.constant';
import { CalendarWebhookSubscriptionService } from 'src/modules/connected-account/webhook-subscription-manager/services/calendar-webhook-subscription.service';
import { MessagingWebhookSubscriptionService } from 'src/modules/connected-account/webhook-subscription-manager/services/messaging-webhook-subscription.service';

@Processor(MessageQueue.cronQueue)
export class WebhookSubscriptionRenewalCronJob {
  private readonly logger = new Logger(WebhookSubscriptionRenewalCronJob.name);

  constructor(
    @InjectRepository(MessageChannelEntity)
    private readonly messageChannelRepository: Repository<MessageChannelEntity>,
    @InjectRepository(CalendarChannelEntity)
    private readonly calendarChannelRepository: Repository<CalendarChannelEntity>,
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

    const expiringMessageChannels = await this.messageChannelRepository.find({
      where: {
        webhookSubscriptionStatus: WebhookSubscriptionStatus.ACTIVE,
        webhookSubscriptionExpiresAt: LessThanOrEqual(renewalThreshold),
      },
    });

    const expiringCalendarChannels = await this.calendarChannelRepository.find({
      where: {
        webhookSubscriptionStatus: WebhookSubscriptionStatus.ACTIVE,
        webhookSubscriptionExpiresAt: LessThanOrEqual(renewalThreshold),
      },
    });

    const expiringSubscriptionCount =
      expiringMessageChannels.length + expiringCalendarChannels.length;

    if (expiringSubscriptionCount === 0) {
      return;
    }

    this.logger.log(
      `Renewing ${expiringSubscriptionCount} webhook subscriptions`,
    );

    for (const messageChannel of expiringMessageChannels) {
      try {
        await this.messagingWebhookSubscriptionService.renewSubscription(
          messageChannel,
        );
      } catch (error) {
        this.logger.warn(
          `Failed to renew messaging webhook subscription for channel ${messageChannel.id}`,
          error,
        );
      }
    }

    for (const calendarChannel of expiringCalendarChannels) {
      try {
        await this.calendarWebhookSubscriptionService.renewSubscription(
          calendarChannel,
        );
      } catch (error) {
        this.logger.warn(
          `Failed to renew calendar webhook subscription for channel ${calendarChannel.id}`,
          error,
        );
      }
    }
  }
}
