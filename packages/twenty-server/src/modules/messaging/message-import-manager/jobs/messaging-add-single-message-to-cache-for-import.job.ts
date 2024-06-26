import { CacheStorageService } from 'src/engine/integrations/cache-storage/cache-storage.service';
import { InjectCacheStorage } from 'src/engine/integrations/cache-storage/decorators/cache-storage.decorator';
import { CacheStorageNamespace } from 'src/engine/integrations/cache-storage/types/cache-storage-namespace.enum';
import { Process } from 'src/engine/integrations/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/integrations/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/integrations/message-queue/message-queue.constants';

export type MessagingAddSingleMessageToCacheForImportJobData = {
  messageExternalId: string;
  messageChannelId: string;
  workspaceId: string;
};

@Processor(MessageQueue.messagingQueue)
export class MessagingAddSingleMessageToCacheForImportJob {
  constructor(
    @InjectCacheStorage(CacheStorageNamespace.Messaging)
    private readonly cacheStorage: CacheStorageService,
  ) {}

  @Process(MessagingAddSingleMessageToCacheForImportJob.name)
  async handle(
    data: MessagingAddSingleMessageToCacheForImportJobData,
  ): Promise<void> {
    const { messageExternalId, messageChannelId, workspaceId } = data;

    await this.cacheStorage.setAdd(
      `messages-to-import:${workspaceId}:gmail:${messageChannelId}`,
      [messageExternalId],
    );
  }
}
