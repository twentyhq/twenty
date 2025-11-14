import { Command, CommandRunner } from 'nest-commander';

import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import {
  MESSAGING_PROCESS_GROUP_EMAIL_ACTIONS_CRON_PATTERN,
  MessagingProcessGroupEmailActionsCronJob,
} from 'src/modules/messaging/message-import-manager/crons/jobs/messaging-process-group-email-actions.cron.job';

@Command({
  name: 'cron:messaging:process-group-email-actions',
  description:
    'Starts a cron job to process pending group email actions (deletion or import) for message channels',
})
export class MessagingProcessGroupEmailActionsCronCommand extends CommandRunner {
  constructor(
    @InjectMessageQueue(MessageQueue.cronQueue)
    private readonly messageQueueService: MessageQueueService,
  ) {
    super();
  }

  async run(): Promise<void> {
    await this.messageQueueService.addCron<undefined>({
      jobName: MessagingProcessGroupEmailActionsCronJob.name,
      data: undefined,
      options: {
        repeat: {
          pattern: MESSAGING_PROCESS_GROUP_EMAIL_ACTIONS_CRON_PATTERN,
        },
      },
    });
  }
}
