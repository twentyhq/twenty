import { Command, CommandRunner } from 'nest-commander';

import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import {
  MESSAGING_FOLDER_SYNC_CRON_PATTERN,
  MessagingFolderSyncCronJob,
} from 'src/modules/messaging/folder-sync-manager/crons/jobs/messaging-folder-sync.cron.job';

@Command({
  name: 'cron:messaging:folder-sync',
  description:
    'Starts a cron job to sync message folders from connected accounts',
})
export class MessagingFolderSyncCronCommand extends CommandRunner {
  constructor(
    @InjectMessageQueue(MessageQueue.cronQueue)
    private readonly messageQueueService: MessageQueueService,
  ) {
    super();
  }

  async run(): Promise<void> {
    await this.messageQueueService.addCron<undefined>({
      jobName: MessagingFolderSyncCronJob.name,
      data: undefined,
      options: {
        repeat: { pattern: MESSAGING_FOLDER_SYNC_CRON_PATTERN },
      },
    });
  }
}
