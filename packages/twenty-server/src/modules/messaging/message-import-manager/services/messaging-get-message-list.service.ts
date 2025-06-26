import { Injectable } from '@nestjs/common';

import { ConnectedAccountProvider } from 'twenty-shared/types';

import { TwentyORMManager } from 'src/engine/twenty-orm/twenty-orm.manager';
import { MessageChannelWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-channel.workspace-entity';
import { MessageFolderWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-folder.workspace-entity';
import { GmailGetMessageListService } from 'src/modules/messaging/message-import-manager/drivers/gmail/services/gmail-get-message-list.service';
import { ImapGetMessageListService } from 'src/modules/messaging/message-import-manager/drivers/imap/services/imap-get-message-list.service';
import { MicrosoftGetMessageListService } from 'src/modules/messaging/message-import-manager/drivers/microsoft/services/microsoft-get-message-list.service';
import {
  MessageImportException,
  MessageImportExceptionCode,
} from 'src/modules/messaging/message-import-manager/exceptions/message-import.exception';
import { MessagingCursorService } from 'src/modules/messaging/message-import-manager/services/messaging-cursor.service';

export type GetFullMessageListResponse = {
  messageExternalIds: string[];
  nextSyncCursor: string;
};

export type GetFullMessageListForFoldersResponse =
  GetFullMessageListResponse & {
    folderId: string | undefined;
  };

export type GetPartialMessageListResponse = {
  messageExternalIds: string[];
  messageExternalIdsToDelete: string[];
  previousSyncCursor: string;
  nextSyncCursor: string;
};

export type GetPartialMessageListForFoldersResponse =
  GetPartialMessageListResponse & {
    folderId: string | undefined;
  };

@Injectable()
export class MessagingGetMessageListService {
  constructor(
    private readonly gmailGetMessageListService: GmailGetMessageListService,
    private readonly microsoftGetMessageListService: MicrosoftGetMessageListService,
    private readonly imapGetMessageListService: ImapGetMessageListService,
    private readonly messagingCursorService: MessagingCursorService,
    private readonly twentyORMManager: TwentyORMManager,
  ) {}

  public async getFullMessageLists(
    messageChannel: MessageChannelWorkspaceEntity,
  ): Promise<GetFullMessageListForFoldersResponse[]> {
    switch (messageChannel.connectedAccount.provider) {
      case ConnectedAccountProvider.GOOGLE: {
        const fullMessageList =
          await this.gmailGetMessageListService.getFullMessageList(
            messageChannel.connectedAccount,
          );

        return [
          {
            ...fullMessageList,
            folderId: undefined,
          },
        ];
      }
      case ConnectedAccountProvider.MICROSOFT: {
        const folderRepository =
          await this.twentyORMManager.getRepository<MessageFolderWorkspaceEntity>(
            'messageFolder',
          );

        const folders = await folderRepository.find({
          where: {
            messageChannelId: messageChannel.id,
          },
        });

        return this.microsoftGetMessageListService.getFullMessageListForFolders(
          messageChannel.connectedAccount,
          folders,
        );
      }
      case ConnectedAccountProvider.IMAP_SMTP_CALDAV: {
        const fullMessageList =
          await this.imapGetMessageListService.getFullMessageList(
            messageChannel.connectedAccount,
          );

        return [
          {
            ...fullMessageList,
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

  public async getPartialMessageLists(
    messageChannel: MessageChannelWorkspaceEntity,
  ): Promise<GetPartialMessageListForFoldersResponse[]> {
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
