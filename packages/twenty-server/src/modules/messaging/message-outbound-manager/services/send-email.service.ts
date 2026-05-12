import { Injectable, Logger } from '@nestjs/common';

import { type ComposedEmail } from 'src/engine/core-modules/tool/tools/email-tool/types/composed-email.type';
import { MessagingMessageOutboundService } from 'src/modules/messaging/message-outbound-manager/services/messaging-message-outbound.service';
import { SentMessagePersistenceService } from 'src/modules/messaging/message-outbound-manager/services/sent-message-persistence.service';
import { type SendMessageResult } from 'src/modules/messaging/message-outbound-manager/types/send-message-result.type';

@Injectable()
export class SendEmailService {
  private readonly logger = new Logger(SendEmailService.name);

  constructor(
    private readonly messageOutboundService: MessagingMessageOutboundService,
    private readonly sentMessagePersistenceService: SentMessagePersistenceService,
  ) {}

  async sendComposedEmail(data: ComposedEmail): Promise<SendMessageResult> {
    return this.messageOutboundService.sendMessage(
      {
        to: data.recipients.to,
        cc: data.recipients.cc.length > 0 ? data.recipients.cc : undefined,
        bcc: data.recipients.bcc.length > 0 ? data.recipients.bcc : undefined,
        subject: data.sanitizedSubject,
        body: data.plainTextBody,
        html: data.sanitizedHtmlBody,
        attachments: data.attachments,
        inReplyTo: data.inReplyTo,
        threadExternalId: data.threadExternalId,
      },
      data.connectedAccount,
    );
  }

  async persistSentMessage(
    sendResult: SendMessageResult,
    data: ComposedEmail,
    workspaceId: string,
  ): Promise<void> {
    try {
      await this.sentMessagePersistenceService.persistSentMessage({
        sendResult,
        subject: data.sanitizedSubject,
        body: data.plainTextBody,
        recipients: data.recipients,
        connectedAccount: data.connectedAccount,
        messageChannelId: data.messageChannelId!,
        inReplyTo: data.inReplyTo,
        workspaceId,
      });
    } catch (persistenceError) {
      this.logger.warn(
        `Failed to persist sent message (sync will recover): ${persistenceError}`,
      );
    }
  }
}
