import { InjectCacheStorage } from 'src/engine/core-modules/cache-storage/decorators/cache-storage.decorator';
import { CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';

export type MessagingAddSingleMessageToCacheForImportJobData = {
  messageExternalId: string;
  messageChannelId: string;
  workspaceId: string;
};

@Processor(MessageQueue.messagingQueue)
export class MessagingAddSingleMessageToCacheForImportJob {
  constructor(
    @InjectCacheStorage(CacheStorageNamespace.ModuleMessaging)
    private readonly cacheStorage: CacheStorageService,
  ) {}

  @Process(MessagingAddSingleMessageToCacheForImportJob.name)
  async handle(
    data: MessagingAddSingleMessageToCacheForImportJobData,
  ): Promise<void> {
    const { messageExternalId, messageChannelId, workspaceId } = data;

    await this.cacheStorage.setAdd(
      `messages-to-import:${workspaceId}:${messageChannelId}`,
      [messageExternalId],
    );
  }
}
