import { Injectable } from '@nestjs/common';

import { ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';
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

export type GetPartialMessageListResponse = {
  messageExternalIds: string[];
  messageExternalIdsToDelete: string[];
  nextSyncCursor: string;
};

@Injectable()
export class MessagingGetMessageListService {
  constructor(
    private readonly gmailGetMessageListService: GmailGetMessageListService,
    private readonly microsoftGetMessageListService: MicrosoftGetMessageListService,
  ) {}

  public async getFullMessageList(
    connectedAccount: Pick<
      ConnectedAccountWorkspaceEntity,
      'provider' | 'refreshToken' | 'id' | 'handle'
    >,
  ): Promise<GetFullMessageListResponse> {
    switch (connectedAccount.provider) {
      case 'google':
        return this.gmailGetMessageListService.getFullMessageList(
          connectedAccount,
        );
      case 'microsoft':
        return this.microsoftGetMessageListService.getFullMessageList(
          connectedAccount,
        );
      default:
        throw new MessageImportException(
          `Provider ${connectedAccount.provider} is not supported`,
          MessageImportExceptionCode.PROVIDER_NOT_SUPPORTED,
        );
    }
  }

  public async getPartialMessageList(
    connectedAccount: Pick<
      ConnectedAccountWorkspaceEntity,
      'provider' | 'refreshToken' | 'id'
    >,
    syncCursor: string,
  ): Promise<GetPartialMessageListResponse> {
    switch (connectedAccount.provider) {
      case 'google':
        return this.gmailGetMessageListService.getPartialMessageList(
          connectedAccount,
          syncCursor,
        );
      case 'microsoft':
        return this.microsoftGetMessageListService.getPartialMessageList(
          connectedAccount,
          syncCursor,
        );
      default:
        throw new MessageImportException(
          `Provider ${connectedAccount.provider} is not supported`,
          MessageImportExceptionCode.PROVIDER_NOT_SUPPORTED,
        );
    }
  }
}
