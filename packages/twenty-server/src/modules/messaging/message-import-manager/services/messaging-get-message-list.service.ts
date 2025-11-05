import { Injectable } from '@nestjs/common';

import { ConnectedAccountProvider } from 'twenty-shared/types';

import {
  MessageFolderImportPolicy,
  type MessageChannelWorkspaceEntity,
} from 'src/modules/messaging/common/standard-objects/message-channel.workspace-entity';
import { MessageFolderWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-folder.workspace-entity';
import {
  MessageImportDriverException,
  MessageImportDriverExceptionCode,
} from 'src/modules/messaging/message-import-manager/drivers/exceptions/message-import-driver.exception';
import { GmailGetMessageListService } from 'src/modules/messaging/message-import-manager/drivers/gmail/services/gmail-get-message-list.service';
import { ImapGetMessageListService } from 'src/modules/messaging/message-import-manager/drivers/imap/services/imap-get-message-list.service';
import { MicrosoftGetMessageListService } from 'src/modules/messaging/message-import-manager/drivers/microsoft/services/microsoft-get-message-list.service';
import { type GetMessageListsResponse } from 'src/modules/messaging/message-import-manager/types/get-message-lists-response.type';

type MessageFolder = Pick<
  MessageFolderWorkspaceEntity,
  'name' | 'isSynced' | 'isSentFolder' | 'externalId' | 'syncCursor' | 'id'
>;

@Injectable()
export class MessagingGetMessageListService {
  constructor(
    private readonly gmailGetMessageListService: GmailGetMessageListService,
    private readonly microsoftGetMessageListService: MicrosoftGetMessageListService,
    private readonly imapGetMessageListService: ImapGetMessageListService,
  ) {}

  public async getMessageLists(
    messageChannel: MessageChannelWorkspaceEntity,
    messageFolders: MessageFolder[],
  ): Promise<GetMessageListsResponse> {
    const messageFoldersToSync: MessageFolder[] =
      messageChannel.messageFolderImportPolicy ===
      MessageFolderImportPolicy.ALL_FOLDERS
        ? messageFolders
        : messageFolders.filter((folder) => folder.isSynced);

    switch (messageChannel.connectedAccount.provider) {
      case ConnectedAccountProvider.GOOGLE:
        return await this.gmailGetMessageListService.getMessageLists({
          messageChannel,
          connectedAccount: messageChannel.connectedAccount,
          messageFolders: messageFoldersToSync,
        });
      case ConnectedAccountProvider.MICROSOFT:
        return this.microsoftGetMessageListService.getMessageLists({
          messageChannel,
          connectedAccount: messageChannel.connectedAccount,
          messageFolders: messageFoldersToSync,
        });
      case ConnectedAccountProvider.IMAP_SMTP_CALDAV: {
        return await this.imapGetMessageListService.getMessageLists({
          messageChannel,
          connectedAccount: messageChannel.connectedAccount,
          messageFolders: messageFoldersToSync,
        });
      }
      default:
        throw new MessageImportDriverException(
          `Provider ${messageChannel.connectedAccount.provider} is not supported`,
          MessageImportDriverExceptionCode.PROVIDER_NOT_SUPPORTED,
        );
    }
  }
}
