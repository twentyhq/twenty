import { Injectable } from '@nestjs/common';

import { ConnectedAccountProvider } from 'twenty-shared/types';

import { type MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';
import { type ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import {
  MessageImportDriverException,
  MessageImportDriverExceptionCode,
} from 'src/modules/messaging/message-import-manager/drivers/exceptions/message-import-driver.exception';
import { GmailGetMessagesService } from 'src/modules/messaging/message-import-manager/drivers/gmail/services/gmail-get-messages.service';
import { ImapIngestionDriver } from 'src/modules/messaging/message-import-manager/drivers/imap/imap-ingestion.driver';
import { MicrosoftGetMessagesService } from 'src/modules/messaging/message-import-manager/drivers/microsoft/services/microsoft-get-messages.service';
import { type MessageWithParticipants } from 'src/modules/messaging/message-import-manager/types/message';

export type GetMessagesResponse = MessageWithParticipants[];

@Injectable()
export class MessagingGetMessagesService {
  constructor(
    private readonly gmailGetMessagesService: GmailGetMessagesService,
    private readonly microsoftGetMessagesService: MicrosoftGetMessagesService,
    private readonly imapIngestionDriver: ImapIngestionDriver,
  ) {}

  public async getMessages(
    messageIds: string[],
    connectedAccount: Pick<
      ConnectedAccountEntity,
      | 'provider'
      | 'accessToken'
      | 'refreshToken'
      | 'id'
      | 'handle'
      | 'handleAliases'
      | 'userWorkspaceId'
      | 'connectionParameters'
    >,
    messageChannel: Pick<
      MessageChannelEntity,
      'messageFolders' | 'messageFolderImportPolicy'
    >,
  ): Promise<GetMessagesResponse> {
    switch (connectedAccount.provider) {
      case ConnectedAccountProvider.GOOGLE:
        return this.gmailGetMessagesService.getMessages(
          messageIds,
          connectedAccount,
          messageChannel,
        );
      case ConnectedAccountProvider.MICROSOFT:
        return this.microsoftGetMessagesService.getMessages(
          messageIds,
          connectedAccount,
        );
      case ConnectedAccountProvider.IMAP_SMTP_CALDAV:
        return this.imapIngestionDriver.getMessages(
          messageIds,
          connectedAccount,
          messageChannel,
        );
      default:
        throw new MessageImportDriverException(
          `Provider ${connectedAccount.provider} is not supported`,
          MessageImportDriverExceptionCode.PROVIDER_NOT_SUPPORTED,
        );
    }
  }
}
