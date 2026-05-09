import { Injectable } from '@nestjs/common';

import { ConnectedAccountProvider } from 'twenty-shared/types';
import { assertUnreachable } from 'twenty-shared/utils';

import { type ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { GmailMessageOutboundService } from 'src/modules/messaging/message-outbound-manager/drivers/gmail/services/gmail-message-outbound.service';
import { ImapSmtpMessageOutboundService } from 'src/modules/messaging/message-outbound-manager/drivers/imap/services/imap-smtp-message-outbound.service';
import { MicrosoftMessageOutboundService } from 'src/modules/messaging/message-outbound-manager/drivers/microsoft/services/microsoft-message-outbound.service';
import { SendMessageInput } from 'src/modules/messaging/message-outbound-manager/types/send-message-input.type';
import { type SendMessageResult } from 'src/modules/messaging/message-outbound-manager/types/send-message-result.type';

@Injectable()
export class MessagingMessageOutboundService {
  constructor(
    private readonly gmailMessageOutboundService: GmailMessageOutboundService,
    private readonly microsoftMessageOutboundService: MicrosoftMessageOutboundService,
    private readonly imapSmtpMessageOutboundService: ImapSmtpMessageOutboundService,
  ) {}

  public async sendMessage(
    sendMessageInput: SendMessageInput,
    connectedAccount: ConnectedAccountEntity,
  ): Promise<SendMessageResult> {
    switch (connectedAccount.provider) {
      case ConnectedAccountProvider.GOOGLE:
        return this.gmailMessageOutboundService.sendMessage(
          sendMessageInput,
          connectedAccount,
        );
      case ConnectedAccountProvider.MICROSOFT:
        return this.microsoftMessageOutboundService.sendMessage(
          sendMessageInput,
          connectedAccount,
        );
      case ConnectedAccountProvider.IMAP_SMTP_CALDAV:
        return this.imapSmtpMessageOutboundService.sendMessage(
          sendMessageInput,
          connectedAccount,
        );
      case ConnectedAccountProvider.EMAIL_GROUP:
        // Email group channels are inbound-only: replies should go through
        // the user's own Gmail/Outlook/IMAP account to avoid masking the
        // sender.
        throw new Error(
          'Email group channels are inbound-only; reply using your personal account.',
        );
      case ConnectedAccountProvider.OIDC:
      case ConnectedAccountProvider.SAML:
      case ConnectedAccountProvider.APP:
        throw new Error(
          `Provider ${connectedAccount.provider} does not support sending messages`,
        );
      default:
        assertUnreachable(
          connectedAccount.provider,
          `Provider ${connectedAccount.provider} not supported for sending messages`,
        );
    }
  }

  public async createDraft(
    sendMessageInput: SendMessageInput,
    connectedAccount: ConnectedAccountEntity,
  ): Promise<void> {
    switch (connectedAccount.provider) {
      case ConnectedAccountProvider.GOOGLE:
        return this.gmailMessageOutboundService.createDraft(
          sendMessageInput,
          connectedAccount,
        );
      case ConnectedAccountProvider.MICROSOFT:
        return this.microsoftMessageOutboundService.createDraft(
          sendMessageInput,
          connectedAccount,
        );
      case ConnectedAccountProvider.IMAP_SMTP_CALDAV:
        return this.imapSmtpMessageOutboundService.createDraft(
          sendMessageInput,
          connectedAccount,
        );
      case ConnectedAccountProvider.EMAIL_GROUP:
      case ConnectedAccountProvider.OIDC:
      case ConnectedAccountProvider.SAML:
      case ConnectedAccountProvider.APP:
        throw new Error(
          `Provider ${connectedAccount.provider} does not support creating drafts`,
        );
      default:
        assertUnreachable(
          connectedAccount.provider,
          `Provider ${connectedAccount.provider} not supported for creating drafts`,
        );
    }
  }
}
