import { Injectable, Logger } from '@nestjs/common';

import { MessageQueueJob } from 'src/engine/integrations/message-queue/interfaces/message-queue-job.interface';

import { CacheStorageService } from 'src/engine/integrations/cache-storage/cache-storage.service';
import { InjectCacheStorage } from 'src/engine/integrations/cache-storage/decorators/cache-storage.decorator';
import { CacheStorageNamespace } from 'src/engine/integrations/cache-storage/types/cache-storage-namespace.enum';

export type DeleteMessageChannelAssociatedDataJobData = {
  workspaceId: string;
  messageChannelId: string;
};

@Injectable()
export class DeleteMessageChannelAssociatedDataJob
  implements MessageQueueJob<DeleteMessageChannelAssociatedDataJobData>
{
  private readonly logger = new Logger(
    DeleteMessageChannelAssociatedDataJob.name,
  );

  constructor(
    @InjectCacheStorage(CacheStorageNamespace.Messaging)
    private readonly cacheStorage: CacheStorageService,
  ) {}

  async handle(data: DeleteMessageChannelAssociatedDataJobData): Promise<void> {
    this.logger.log(
      `Deleting message channel ${data.messageChannelId} associated data in workspace ${data.workspaceId}`,
    );

    await this.cacheStorage.del(
      `messages-to-import:${data.workspaceId}:gmail:${data.messageChannelId}`,
    );

    this.logger.log(
      `Deleted message channel ${data.messageChannelId} associated data in workspace ${data.workspaceId}`,
    );
  }
}
