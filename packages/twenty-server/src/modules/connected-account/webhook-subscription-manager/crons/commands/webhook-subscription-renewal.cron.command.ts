import { Command, CommandRunner } from 'nest-commander';

import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { WEBHOOK_SUBSCRIPTION_RENEWAL_CRON_PATTERN } from 'src/modules/connected-account/webhook-subscription-manager/constants/webhook-subscription.constants';
import { WebhookSubscriptionRenewalCronJob } from 'src/modules/connected-account/webhook-subscription-manager/crons/jobs/webhook-subscription-renewal.cron.job';

@Command({
  name: 'cron:messaging-calendar:webhook-subscription-renewal',
  description:
    'Starts a cron job to renew messaging/calendar webhook subscriptions before they expire',
})
export class WebhookSubscriptionRenewalCronCommand extends CommandRunner {
  constructor(
    @InjectMessageQueue(MessageQueue.cronQueue)
    private readonly messageQueueService: MessageQueueService,
  ) {
    super();
  }

  async run(): Promise<void> {
    await this.messageQueueService.addCron<undefined>({
      jobName: WebhookSubscriptionRenewalCronJob.name,
      data: undefined,
      options: {
        repeat: {
          pattern: WEBHOOK_SUBSCRIPTION_RENEWAL_CRON_PATTERN,
        },
      },
    });
  }
}
