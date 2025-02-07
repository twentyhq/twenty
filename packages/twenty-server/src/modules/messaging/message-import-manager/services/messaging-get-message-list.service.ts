import { Injectable } from '@nestjs/common';

import { ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';
import { MessageChannelWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-channel.workspace-entity';
import { GmailGetMessageListService } from 'src/modules/messaging/message-import-manager/drivers/gmail/services/gmail-get-message-list.service';
import { MicrosoftGetMessageListService } from 'src/modules/messaging/message-import-manager/drivers/microsoft/services/microsoft-get-message-list.service';
import {
  MessageImportException,
  MessageImportExceptionCode,
} from 'src/modules/messaging/message-import-manager/exceptions/message-import.exception';

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
  ) {}

  public async getFullMessageLists(
    connectedAccount: Pick<
      ConnectedAccountWorkspaceEntity,
      'provider' | 'refreshToken' | 'id' | 'handle'
    >,
  ): Promise<GetFullMessageListForFoldersResponse[]> {
    switch (connectedAccount.provider) {
      case 'google':
        return [
          {
            ...(await this.gmailGetMessageListService.getFullMessageList(
              connectedAccount,
            )),
            folderId: undefined,
          },
        ];
      case 'microsoft':
        // TODO: update the folder list, currently empty []
        return this.microsoftGetMessageListService.getFullMessageListForFolders(
          connectedAccount,
          [],
        );
      default:
        throw new MessageImportException(
          `Provider ${connectedAccount.provider} is not supported`,
          MessageImportExceptionCode.PROVIDER_NOT_SUPPORTED,
        );
    }
  }

  public async getPartialMessageLists(
    connectedAccount: Pick<
      ConnectedAccountWorkspaceEntity,
      'provider' | 'refreshToken' | 'id'
    >,
    messageChannel: MessageChannelWorkspaceEntity,
  ): Promise<GetPartialMessageListForFoldersResponse[]> {
    switch (connectedAccount.provider) {
      case 'google':
        return [
          {
            ...(await this.gmailGetMessageListService.getPartialMessageList(
              connectedAccount,
              messageChannel.syncCursor,
            )),
            folderId: undefined,
          },
        ];
      case 'microsoft':
        return this.microsoftGetMessageListService.getPartialMessageListForFolders(
          connectedAccount,
          messageChannel,
        );
      default:
        throw new MessageImportException(
          `Provider ${connectedAccount.provider} is not supported`,
          MessageImportExceptionCode.PROVIDER_NOT_SUPPORTED,
        );
    }
  }
}
