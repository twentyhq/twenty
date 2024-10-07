import { Logger } from '@nestjs/common';

import { InjectCacheStorage } from 'src/engine/core-modules/cache-storage/decorators/cache-storage.decorator';
import { CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';

export type MessagingCleanCacheJobData = {
  workspaceId: string;
  messageChannelId: string;
};

@Processor(MessageQueue.messagingQueue)
export class MessagingCleanCacheJob {
  private readonly logger = new Logger(MessagingCleanCacheJob.name);

  constructor(
    @InjectCacheStorage(CacheStorageNamespace.ModuleMessaging)
    private readonly cacheStorage: CacheStorageService,
  ) {}

  @Process(MessagingCleanCacheJob.name)
  async handle(data: MessagingCleanCacheJobData): Promise<void> {
    this.logger.log(
      `Deleting message channel ${data.messageChannelId} associated cache in workspace ${data.workspaceId}`,
    );

    await this.cacheStorage.del(
      `messages-to-import:${data.workspaceId}:${data.messageChannelId}`,
    );

    this.logger.log(
      `Deleted message channel ${data.messageChannelId} associated cache in workspace ${data.workspaceId}`,
    );
  }
}
