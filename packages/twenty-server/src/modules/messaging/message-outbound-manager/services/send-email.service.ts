import { Injectable, Logger } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { type ComposedEmail } from 'src/engine/core-modules/tool/tools/email-tool/types/composed-email.type';
import { MessagingDraftSendService } from 'src/modules/messaging/message-outbound-manager/services/messaging-draft-send.service';
import { MessagingMessageOutboundService } from 'src/modules/messaging/message-outbound-manager/services/messaging-message-outbound.service';
import { SentMessagePersistenceService } from 'src/modules/messaging/message-outbound-manager/services/sent-message-persistence.service';
import { type SendMessageInput } from 'src/modules/messaging/message-outbound-manager/types/send-message-input.type';
import { type SendMessageResult } from 'src/modules/messaging/message-outbound-manager/types/send-message-result.type';

@Injectable()
export class SendEmailService {
  private readonly logger = new Logger(SendEmailService.name);

  constructor(
    private readonly messageOutboundService: MessagingMessageOutboundService,
    private readonly messagingDraftSendService: MessagingDraftSendService,
    private readonly sentMessagePersistenceService: SentMessagePersistenceService,
  ) {}

  async sendComposedEmail(data: ComposedEmail): Promise<SendMessageResult> {
    return this.messageOutboundService.sendMessage(
      this.toSendMessageInput(data),
      data.connectedAccount,
    );
  }

  async sendComposedDraft(
    data: ComposedEmail,
    draftMessageId: string,
    workspaceId: string,
  ): Promise<SendMessageResult> {
    return this.messagingDraftSendService.sendDraftMessage({
      draftMessageId,
      sendMessageInput: this.toSendMessageInput(data),
      connectedAccount: data.connectedAccount,
      workspaceId,
    });
  }

  async finalizeSentDraft(
    draftMessageId: string,
    messageExternalId: string | undefined,
    workspaceId: string,
  ): Promise<string | undefined> {
    await this.messagingDraftSendService.deleteSentDraft({
      draftMessageId,
      workspaceId,
    });

    if (!isDefined(messageExternalId)) {
      return undefined;
    }

    return this.messagingDraftSendService.getSentMessageThreadId({
      messageExternalId,
      workspaceId,
    });
  }

  private toSendMessageInput(data: ComposedEmail): SendMessageInput {
    return {
      to: data.recipients.to,
      cc: data.recipients.cc.length > 0 ? data.recipients.cc : undefined,
      bcc: data.recipients.bcc.length > 0 ? data.recipients.bcc : undefined,
      subject: data.sanitizedSubject,
      body: data.plainTextBody,
      html: data.sanitizedHtmlBody,
      attachments: data.attachments,
      inReplyTo: data.inReplyTo,
      threadExternalId: data.threadExternalId,
      references: data.references,
    };
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
        recipients: sendResult.deliveredRecipients ?? data.recipients,
        connectedAccount: data.connectedAccount,
        messageChannelId: data.messageChannelId!,
        inReplyTo: data.inReplyTo,
        parentThreadExternalId: data.threadExternalId,
        workspaceId,
      });
    } catch (persistenceError) {
      this.logger.warn(
        `Failed to persist sent message (sync will recover): ${persistenceError}`,
      );
    }
  }
}
