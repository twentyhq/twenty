import { Injectable } from '@nestjs/common';

import { ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';
import {
  MessageImportDriverException,
  MessageImportDriverExceptionCode,
} from 'src/modules/messaging/message-import-manager/drivers/exceptions/message-import-driver.exception';
import { GmailGetMessageListService } from 'src/modules/messaging/message-import-manager/drivers/gmail/services/gmail-get-message-list.service';

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
  ) {}

  public async getFullMessageList(
    connectedAccount: Pick<
      ConnectedAccountWorkspaceEntity,
      'provider' | 'refreshToken' | 'id'
    >,
  ): Promise<GetFullMessageListResponse> {
    switch (connectedAccount.provider) {
      case 'google':
        return this.gmailGetMessageListService.getFullMessageList(
          connectedAccount,
        );
      default:
        throw new Error(
          `Provider ${connectedAccount.provider} is not supported.`,
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
      default:
        throw new MessageImportDriverException(
          `Provider ${connectedAccount.provider} is not supported`,
          MessageImportDriverExceptionCode.PROVIDER_NOT_SUPPORTED,
        );
    }
  }
}
