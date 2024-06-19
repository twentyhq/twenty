import { Command, CommandRunner } from 'nest-commander';

import { InjectMessageQueue } from 'src/engine/integrations/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/integrations/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/integrations/message-queue/services/message-queue.service';
import { MessagingAddSingleMessageToCacheForImportJob } from 'src/modules/messaging/message-import-manager/jobs/messaging-add-single-message-to-cache-for-import.job';

type MessagingSingleMessageImportCommandOptions = {
  messageId: string;
  messageChannelId: string;
  workspaceId: string;
};

@Command({
  name: 'messaging:single-message-import',
  description: 'Enqueue a job to schedule the import of a single message',
})
export class MessagingSingleMessageImportCommand extends CommandRunner {
  constructor(
    @InjectMessageQueue(MessageQueue.cronQueue)
    private readonly messageQueueService: MessageQueueService,
  ) {
    super();
  }

  async run(
    _passedParam: string[],
    options: MessagingSingleMessageImportCommandOptions,
  ): Promise<void> {
    await this.messageQueueService.add(
      MessagingAddSingleMessageToCacheForImportJob.name,
      {
        messageId: options.messageId,
        messageChannelId: options.messageChannelId,
        workspaceId: options.workspaceId,
      },
    );
  }
}
