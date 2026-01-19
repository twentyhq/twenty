import { Logger } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessagingImportCacheService } from 'src/modules/messaging/common/services/messaging-import-cache.service';

export type MessagingAddSingleMessageToCacheForImportJobData = {
  messageExternalId: string;
  messageChannelId: string;
  workspaceId: string;
  messageFolderId?: string;
};

@Processor(MessageQueue.messagingQueue)
export class MessagingAddSingleMessageToCacheForImportJob {
  private readonly logger = new Logger(
    MessagingAddSingleMessageToCacheForImportJob.name,
  );

  constructor(
    private readonly messagingImportCacheService: MessagingImportCacheService,
  ) {}

  @Process(MessagingAddSingleMessageToCacheForImportJob.name)
  async handle(
    data: MessagingAddSingleMessageToCacheForImportJobData,
  ): Promise<void> {
    const {
      messageExternalId,
      messageChannelId,
      workspaceId,
      messageFolderId,
    } = data;

    if (!isDefined(messageFolderId)) {
      this.logger.debug(
        `Skipping message ${messageExternalId} - no messageFolderId provided`,
      );

      return;
    }

    await this.messagingImportCacheService.addMessage(
      workspaceId,
      messageChannelId,
      messageExternalId,
      messageFolderId,
    );
  }
}
