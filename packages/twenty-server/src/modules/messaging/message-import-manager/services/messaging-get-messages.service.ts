import { Injectable } from '@nestjs/common';

import { ConnectedAccountProvider } from 'twenty-shared/types';

import { ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';
import { GmailGetMessagesService } from 'src/modules/messaging/message-import-manager/drivers/gmail/services/gmail-get-messages.service';
import { MicrosoftGetMessagesService } from 'src/modules/messaging/message-import-manager/drivers/microsoft/services/microsoft-get-messages.service';
import {
  MessageImportException,
  MessageImportExceptionCode,
} from 'src/modules/messaging/message-import-manager/exceptions/message-import.exception';
import { MessageWithParticipants } from 'src/modules/messaging/message-import-manager/types/message';

export type GetMessagesResponse = MessageWithParticipants[];

@Injectable()
export class MessagingGetMessagesService {
  constructor(
    private readonly gmailGetMessagesService: GmailGetMessagesService,
    private readonly microsoftGetMessagesService: MicrosoftGetMessagesService,
  ) {}

  public async getMessages(
    messageIds: string[],
    connectedAccount: Pick<
      ConnectedAccountWorkspaceEntity,
      | 'provider'
      | 'accessToken'
      | 'refreshToken'
      | 'id'
      | 'handle'
      | 'handleAliases'
    >,
  ): Promise<GetMessagesResponse> {
    switch (connectedAccount.provider) {
      case ConnectedAccountProvider.GOOGLE:
        return this.gmailGetMessagesService.getMessages(
          messageIds,
          connectedAccount,
        );
      case ConnectedAccountProvider.MICROSOFT:
        return this.microsoftGetMessagesService.getMessages(
          messageIds,
          connectedAccount,
        );
      default:
        throw new MessageImportException(
          `Provider ${connectedAccount.provider} is not supported`,
          MessageImportExceptionCode.PROVIDER_NOT_SUPPORTED,
        );
    }
  }
}
