import { Command, CommandRunner } from 'nest-commander';

import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import {
  SWEEP_STUCK_MESSAGE_CAMPAIGNS_CRON_PATTERN,
  SweepStuckMessageCampaignsCronJob,
} from 'src/modules/emailing/crons/jobs/sweep-stuck-message-campaigns.cron.job';

@Command({
  name: 'cron:emailing:sweep-stuck-message-campaigns',
  description:
    'Starts a cron job to reconcile message campaigns left in the sending status',
})
export class SweepStuckMessageCampaignsCronCommand extends CommandRunner {
  constructor(
    @InjectMessageQueue(MessageQueue.cronQueue)
    private readonly messageQueueService: MessageQueueService,
  ) {
    super();
  }

  async run(): Promise<void> {
    await this.messageQueueService.addCron<undefined>({
      jobName: SweepStuckMessageCampaignsCronJob.name,
      data: undefined,
      options: {
        repeat: { pattern: SWEEP_STUCK_MESSAGE_CAMPAIGNS_CRON_PATTERN },
      },
    });
  }
}
