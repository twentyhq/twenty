import { RECONCILE_CAMPAIGN_STATS_CRON_PATTERN } from 'src/modules/emailing/constants/reconcile-campaign-stats-cron-pattern.constant';
import { Command, CommandRunner } from 'nest-commander';

import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { ReconcileCampaignStatsCronJob } from 'src/modules/emailing/crons/jobs/reconcile-campaign-stats.cron.job';

@Command({
  name: 'cron:emailing:reconcile-campaign-stats',
  description:
    'Starts a cron job to recompute message campaign counters that a dropped stats refresh left stale',
})
export class ReconcileCampaignStatsCronCommand extends CommandRunner {
  constructor(
    @InjectMessageQueue(MessageQueue.cronQueue)
    private readonly messageQueueService: MessageQueueService,
  ) {
    super();
  }

  async run(): Promise<void> {
    await this.messageQueueService.addCron<undefined>({
      jobName: ReconcileCampaignStatsCronJob.name,
      data: undefined,
      options: {
        repeat: { pattern: RECONCILE_CAMPAIGN_STATS_CRON_PATTERN },
      },
    });
  }
}
