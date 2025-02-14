import { Injectable } from '@nestjs/common';

import { TwentyORMManager } from 'src/engine/twenty-orm/twenty-orm.manager';
import { MessageChannelWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-channel.workspace-entity';
import { MessageFolderWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-folder.workspace-entity';
import { GmailGetMessageListService } from 'src/modules/messaging/message-import-manager/drivers/gmail/services/gmail-get-message-list.service';
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
    private readonly messagingCursorService: MessagingCursorService,
    private readonly twentyORMManager: TwentyORMManager,
  ) {}

  public async getFullMessageLists(
    messageChannel: MessageChannelWorkspaceEntity,
  ): Promise<GetFullMessageListForFoldersResponse[]> {
    switch (messageChannel.connectedAccount.provider) {
      case 'google':
        return [
          {
            ...(await this.gmailGetMessageListService.getFullMessageList(
              messageChannel.connectedAccount,
            )),
            folderId: undefined,
          },
        ];
      case 'microsoft': {
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
      case 'google':
        return [
          {
            ...(await this.gmailGetMessageListService.getPartialMessageList(
              messageChannel.connectedAccount,
              messageChannel.syncCursor,
            )),
            folderId: undefined,
          },
        ];
      case 'microsoft':
        return this.microsoftGetMessageListService.getPartialMessageListForFolders(
          messageChannel.connectedAccount,
          messageChannel,
        );
      default:
        throw new MessageImportException(
          `Provider ${messageChannel.connectedAccount.provider} is not supported`,
          MessageImportExceptionCode.PROVIDER_NOT_SUPPORTED,
        );
    }
  }
}
