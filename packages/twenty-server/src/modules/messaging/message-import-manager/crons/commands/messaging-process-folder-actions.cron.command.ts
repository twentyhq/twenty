import { Command, CommandRunner } from 'nest-commander';

import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import {
  MESSAGING_PROCESS_FOLDER_ACTIONS_CRON_PATTERN,
  MessagingProcessFolderActionsCronJob,
} from 'src/modules/messaging/message-import-manager/crons/jobs/messaging-process-folder-actions.cron.job';

@Command({
  name: 'cron:messaging:process-folder-actions',
  description:
    'Starts a cron job to process pending folder actions (deletion) for message channels',
})
export class MessagingProcessFolderActionsCronCommand extends CommandRunner {
  constructor(
    @InjectMessageQueue(MessageQueue.cronQueue)
    private readonly messageQueueService: MessageQueueService,
  ) {
    super();
  }

  async run(): Promise<void> {
    await this.messageQueueService.addCron<undefined>({
      jobName: MessagingProcessFolderActionsCronJob.name,
      data: undefined,
      options: {
        repeat: {
          pattern: MESSAGING_PROCESS_FOLDER_ACTIONS_CRON_PATTERN,
        },
      },
    });
  }
}
