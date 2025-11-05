import { Injectable } from '@nestjs/common';

import { ConnectedAccountProvider } from 'twenty-shared/types';

import { type ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';
import {
  MessageImportDriverException,
  MessageImportDriverExceptionCode,
} from 'src/modules/messaging/message-import-manager/drivers/exceptions/message-import-driver.exception';
import { GmailGetMessagesService } from 'src/modules/messaging/message-import-manager/drivers/gmail/services/gmail-get-messages.service';
import { ImapGetMessagesService } from 'src/modules/messaging/message-import-manager/drivers/imap/services/imap-get-messages.service';
import { MicrosoftGetMessagesService } from 'src/modules/messaging/message-import-manager/drivers/microsoft/services/microsoft-get-messages.service';
import { type MessageWithParticipants } from 'src/modules/messaging/message-import-manager/types/message';

export type GetMessagesResponse = MessageWithParticipants[];

@Injectable()
export class MessagingGetMessagesService {
  constructor(
    private readonly gmailGetMessagesService: GmailGetMessagesService,
    private readonly microsoftGetMessagesService: MicrosoftGetMessagesService,
    private readonly imapGetMessagesService: ImapGetMessagesService,
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
      | 'accountOwnerId'
      | 'connectionParameters'
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
      case ConnectedAccountProvider.IMAP_SMTP_CALDAV:
        return this.imapGetMessagesService.getMessages(
          messageIds,
          connectedAccount,
        );
      default:
        throw new MessageImportDriverException(
          `Provider ${connectedAccount.provider} is not supported`,
          MessageImportDriverExceptionCode.PROVIDER_NOT_SUPPORTED,
        );
    }
  }
}
