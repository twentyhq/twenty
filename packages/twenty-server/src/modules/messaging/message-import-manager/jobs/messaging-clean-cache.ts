import { Logger } from '@nestjs/common';

import { Processor } from 'src/engine/integrations/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/integrations/message-queue/message-queue.constants';
import { Process } from 'src/engine/integrations/message-queue/decorators/process.decorator';
import { InjectCacheStorage } from 'src/engine/integrations/cache-storage/decorators/cache-storage.decorator';
import { CacheStorageNamespace } from 'src/engine/integrations/cache-storage/types/cache-storage-namespace.enum';
import { CacheStorageService } from 'src/engine/integrations/cache-storage/cache-storage.service';

export type MessagingCleanCacheJobData = {
  workspaceId: string;
  messageChannelId: string;
};

@Processor(MessageQueue.messagingQueue)
export class MessagingCleanCacheJob {
  private readonly logger = new Logger(MessagingCleanCacheJob.name);

  constructor(
    @InjectCacheStorage(CacheStorageNamespace.Messaging)
    private readonly cacheStorage: CacheStorageService,
  ) {}

  @Process(MessagingCleanCacheJob.name)
  async handle(data: MessagingCleanCacheJobData): Promise<void> {
    this.logger.log(
      `Deleting message channel ${data.messageChannelId} associated cache in workspace ${data.workspaceId}`,
    );

    await this.cacheStorage.del(
      `messages-to-import:${data.workspaceId}:gmail:${data.messageChannelId}`,
    );

    this.logger.log(
      `Deleted message channel ${data.messageChannelId} associated cache in workspace ${data.workspaceId}`,
    );
  }
}
