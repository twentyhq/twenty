import { Injectable } from '@nestjs/common';

import { ConnectedAccountProvider } from 'twenty-shared/types';

import { MessageChannelWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-channel.workspace-entity';
import { GmailGetMessageListService } from 'src/modules/messaging/message-import-manager/drivers/gmail/services/gmail-get-message-list.service';
import { ImapGetMessageListService } from 'src/modules/messaging/message-import-manager/drivers/imap/services/imap-get-message-list.service';
import { MicrosoftGetMessageListService } from 'src/modules/messaging/message-import-manager/drivers/microsoft/services/microsoft-get-message-list.service';
import {
  MessageImportException,
  MessageImportExceptionCode,
} from 'src/modules/messaging/message-import-manager/exceptions/message-import.exception';

export type GetMessageListResponse = {
  messageExternalIds: string[];
  messageExternalIdsToDelete: string[];
  previousSyncCursor: string;
  nextSyncCursor: string;
};

export type GetMessageListForFoldersResponse = GetMessageListResponse & {
  folderId: string | undefined;
};

@Injectable()
export class MessagingGetMessageListService {
  constructor(
    private readonly gmailGetMessageListService: GmailGetMessageListService,
    private readonly microsoftGetMessageListService: MicrosoftGetMessageListService,
    private readonly imapGetMessageListService: ImapGetMessageListService,
  ) {}

  public async getMessageLists(
    messageChannel: MessageChannelWorkspaceEntity,
  ): Promise<GetMessageListForFoldersResponse[]> {
    switch (messageChannel.connectedAccount.provider) {
      case ConnectedAccountProvider.GOOGLE:
        return [
          {
            ...(await this.gmailGetMessageListService.getPartialMessageList(
              messageChannel.connectedAccount,
              messageChannel.syncCursor,
            )),
            folderId: undefined,
          },
        ];
      case ConnectedAccountProvider.MICROSOFT:
        return this.microsoftGetMessageListService.getPartialMessageListForFolders(
          messageChannel.connectedAccount,
          messageChannel,
        );
      case ConnectedAccountProvider.IMAP_SMTP_CALDAV: {
        const messageList =
          await this.imapGetMessageListService.getPartialMessageList(
            messageChannel.connectedAccount,
            messageChannel.syncCursor,
          );

        return [
          {
            messageExternalIds: messageList.messageExternalIds,
            messageExternalIdsToDelete: [],
            previousSyncCursor: messageChannel.syncCursor || '',
            nextSyncCursor: messageList.nextSyncCursor || '',
            folderId: undefined,
          },
        ];
      }
      default:
        throw new MessageImportException(
          `Provider ${messageChannel.connectedAccount.provider} is not supported`,
          MessageImportExceptionCode.PROVIDER_NOT_SUPPORTED,
        );
    }
  }
}
