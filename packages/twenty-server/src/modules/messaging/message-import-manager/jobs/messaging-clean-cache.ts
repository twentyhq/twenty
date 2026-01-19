import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessagingImportCacheService } from 'src/modules/messaging/common/services/messaging-import-cache.service';

export type MessagingCleanCacheJobData = {
  workspaceId: string;
  messageChannelId: string;
};

@Processor(MessageQueue.messagingQueue)
export class MessagingCleanCacheJob {
  constructor(
    private readonly messagingImportCacheService: MessagingImportCacheService,
  ) {}

  @Process(MessagingCleanCacheJob.name)
  async handle(data: MessagingCleanCacheJobData): Promise<void> {
    await this.messagingImportCacheService.clearAll(
      data.workspaceId,
      data.messageChannelId,
    );
  }
}
