import { Injectable } from '@nestjs/common';

import { InjectCacheStorage } from 'src/engine/core-modules/cache-storage/decorators/cache-storage.decorator';
import { CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';

export type MessageToImport = {
  messageExternalId: string;
  folderId: string;
};

const DELIMITER = '\x1F'; // ASCII Unit Separator (Non printable character)

@Injectable()
export class MessagingImportCacheService {
  constructor(
    @InjectCacheStorage(CacheStorageNamespace.ModuleMessaging)
    private readonly cacheStorage: CacheStorageService,
  ) {}

  private getQueueKey(workspaceId: string, channelId: string): string {
    return `messages-to-import:${workspaceId}:${channelId}`;
  }

  async addMessage(
    workspaceId: string,
    channelId: string,
    messageExternalId: string,
    folderId: string,
  ): Promise<void> {
    await this.addMessages(workspaceId, channelId, [
      { messageExternalId, folderId },
    ]);
  }

  async addMessages(
    workspaceId: string,
    channelId: string,
    messages: MessageToImport[],
  ): Promise<void> {
    if (messages.length === 0) {
      return;
    }

    await this.cacheStorage.setAdd(
      this.getQueueKey(workspaceId, channelId),
      messages.map(
        ({ folderId, messageExternalId }) =>
          `${folderId}${DELIMITER}${messageExternalId}`,
      ),
    );
  }

  async popMessages(
    workspaceId: string,
    channelId: string,
    count: number,
  ): Promise<MessageToImport[]> {
    const values = (await this.cacheStorage.setPop(
      this.getQueueKey(workspaceId, channelId),
      count,
    )) as string[];

    return values.map((value) => {
      const [folderId, messageExternalId] = value.split(DELIMITER);

      return { folderId, messageExternalId };
    });
  }

  async clearQueue(workspaceId: string, channelId: string): Promise<void> {
    await this.cacheStorage.del(this.getQueueKey(workspaceId, channelId));
  }

  async clearAll(workspaceId: string, channelId: string): Promise<void> {
    await this.clearQueue(workspaceId, channelId);
  }
}
