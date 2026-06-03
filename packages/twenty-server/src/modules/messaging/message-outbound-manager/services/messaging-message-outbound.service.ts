import { Injectable, Logger } from '@nestjs/common';

import { ConnectedAccountProvider, FeatureFlagKey } from 'twenty-shared/types';
import { assertUnreachable, isDefined } from 'twenty-shared/utils';

import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { type ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { EmailSignatureManagerService } from 'src/modules/connected-account/email-signature-manager/services/email-signature-manager.service';
import { appendSignatureToEmail } from 'src/modules/connected-account/email-signature-manager/utils/append-signature-to-email.util';
import { EmailGroupMessageOutboundService } from 'src/modules/messaging/message-outbound-manager/drivers/email-group/services/email-group-message-outbound.service';
import { GmailMessageOutboundService } from 'src/modules/messaging/message-outbound-manager/drivers/gmail/services/gmail-message-outbound.service';
import { ImapSmtpMessageOutboundService } from 'src/modules/messaging/message-outbound-manager/drivers/imap/services/imap-smtp-message-outbound.service';
import { MicrosoftMessageOutboundService } from 'src/modules/messaging/message-outbound-manager/drivers/microsoft/services/microsoft-message-outbound.service';
import { SendMessageInput } from 'src/modules/messaging/message-outbound-manager/types/send-message-input.type';
import { type SendMessageResult } from 'src/modules/messaging/message-outbound-manager/types/send-message-result.type';

@Injectable()
export class MessagingMessageOutboundService {
  private readonly logger = new Logger(MessagingMessageOutboundService.name);

  constructor(
    private readonly gmailMessageOutboundService: GmailMessageOutboundService,
    private readonly microsoftMessageOutboundService: MicrosoftMessageOutboundService,
    private readonly imapSmtpMessageOutboundService: ImapSmtpMessageOutboundService,
    private readonly emailGroupMessageOutboundService: EmailGroupMessageOutboundService,
    private readonly emailSignatureManagerService: EmailSignatureManagerService,
    private readonly featureFlagService: FeatureFlagService,
  ) {}

  public async sendMessage(
    sendMessageInput: SendMessageInput,
    connectedAccount: ConnectedAccountEntity,
  ): Promise<SendMessageResult> {
    const finalInput = await this.maybeAppendSignature(
      sendMessageInput,
      connectedAccount,
    );

    switch (connectedAccount.provider) {
      case ConnectedAccountProvider.GOOGLE:
        return this.gmailMessageOutboundService.sendMessage(
          finalInput,
          connectedAccount,
        );
      case ConnectedAccountProvider.MICROSOFT:
        return this.microsoftMessageOutboundService.sendMessage(
          finalInput,
          connectedAccount,
        );
      case ConnectedAccountProvider.IMAP_SMTP_CALDAV:
        return this.imapSmtpMessageOutboundService.sendMessage(
          finalInput,
          connectedAccount,
        );
      case ConnectedAccountProvider.EMAIL_GROUP:
        return this.emailGroupMessageOutboundService.sendMessage(
          finalInput,
          connectedAccount,
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

  // Appends the sender's signature to the outbound message when the workspace
  // has opted in (IS_EMAIL_SIGNATURE_ENABLED). Best-effort: any failure leaves
  // the message unchanged so it can never block sending. Drafts are excluded -
  // the Gmail/Outlook UI adds the signature when the user opens the draft.
  private async maybeAppendSignature(
    sendMessageInput: SendMessageInput,
    connectedAccount: ConnectedAccountEntity,
  ): Promise<SendMessageInput> {
    try {
      const isSignatureEnabled = await this.featureFlagService.isFeatureEnabled(
        FeatureFlagKey.IS_EMAIL_SIGNATURE_ENABLED,
        connectedAccount.workspaceId,
      );

      if (!isSignatureEnabled) {
        return sendMessageInput;
      }

      const signature =
        await this.emailSignatureManagerService.getSignature(connectedAccount);

      if (!isDefined(signature)) {
        return sendMessageInput;
      }

      const { html, text } = appendSignatureToEmail({
        html: sendMessageInput.html,
        text: sendMessageInput.body,
        signature,
      });

      return { ...sendMessageInput, html, body: text };
    } catch (error) {
      this.logger.warn(
        `Failed to append email signature, sending without it: ${error}`,
      );

      return sendMessageInput;
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
