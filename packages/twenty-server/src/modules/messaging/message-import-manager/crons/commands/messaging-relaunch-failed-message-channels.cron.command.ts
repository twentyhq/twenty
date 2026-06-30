import { Command, CommandRunner } from 'nest-commander';

import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import {
  MESSAGING_RELAUNCH_FAILED_MESSAGE_CHANNELS_CRON_PATTERN,
  MessagingRelaunchFailedMessageChannelsCronJob,
} from 'src/modules/messaging/message-import-manager/crons/jobs/messaging-relaunch-failed-message-channels.cron.job';

@Command({
  name: 'cron:messaging:relaunch-failed-message-channels',
  description:
    'Starts a cron job to relaunch failed message channels every 30 minutes',
})
export class MessagingRelaunchFailedMessageChannelsCronCommand extends CommandRunner {
  constructor(
    @InjectMessageQueue(MessageQueue.cronQueue)
    private readonly messageQueueService: MessageQueueService,
  ) {
    super();
  }

  async run(): Promise<void> {
    await this.messageQueueService.addCron<undefined>({
      jobName: MessagingRelaunchFailedMessageChannelsCronJob.name,
      data: undefined,
      options: {
        repeat: {
          pattern: MESSAGING_RELAUNCH_FAILED_MESSAGE_CHANNELS_CRON_PATTERN,
        },
      },
    });
  }
}
