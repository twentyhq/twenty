import { Injectable } from '@nestjs/common';

import { ConnectedAccountProvider } from 'twenty-shared/types';

import { type MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';
import { type MessageFolderEntity } from 'src/engine/metadata-modules/message-folder/entities/message-folder.entity';
import {
  MessageImportDriverException,
  MessageImportDriverExceptionCode,
} from 'src/modules/messaging/message-import-manager/drivers/exceptions/message-import-driver.exception';
import { MessagingGmailFolderBackfillService } from 'src/modules/messaging/message-import-manager/services/messaging-gmail-folder-backfill.service';

@Injectable()
export class MessagingImportFolderMessagesService {
  constructor(
    private readonly messagingGmailFolderBackfillService: MessagingGmailFolderBackfillService,
  ) {}

  async getFolderMessageIdsToImport(
    messageChannel: MessageChannelEntity,
    messageFolder: MessageFolderEntity,
    workspaceId: string,
  ): Promise<string[]> {
    switch (messageChannel.connectedAccount.provider) {
      case ConnectedAccountProvider.GOOGLE:
        return this.messagingGmailFolderBackfillService.getFolderMessageIdsToImport(
          messageChannel,
          messageFolder,
          workspaceId,
        );
      default:
        throw new MessageImportDriverException(
          `Provider ${messageChannel.connectedAccount.provider} is not supported`,
          MessageImportDriverExceptionCode.PROVIDER_NOT_SUPPORTED,
        );
    }
  }
}
