import { Injectable, Logger } from '@nestjs/common';

import { type ComposedEmail } from 'src/engine/core-modules/tool/tools/email-tool/types/composed-email.type';
import { MessagingDraftSendService } from 'src/modules/messaging/message-outbound-manager/services/messaging-draft-send.service';
import { MessagingMessageOutboundService } from 'src/modules/messaging/message-outbound-manager/services/messaging-message-outbound.service';
import { SentMessagePersistenceService } from 'src/modules/messaging/message-outbound-manager/services/sent-message-persistence.service';
import { type PersistedSentMessage } from 'src/modules/messaging/message-outbound-manager/types/persisted-sent-message.type';
import { type SendMessageResult } from 'src/modules/messaging/message-outbound-manager/types/send-message-result.type';
import { toSendMessageInput } from 'src/modules/messaging/message-outbound-manager/utils/to-send-message-input.util';

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
      toSendMessageInput(data),
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
      sendMessageInput: toSendMessageInput(data),
      connectedAccount: data.connectedAccount,
      workspaceId,
    });
  }

  async deleteSentDraft(
    draftMessageId: string,
    connectedAccountId: string,
    workspaceId: string,
  ): Promise<void> {
    await this.messagingDraftSendService.deleteSentDraft({
      draftMessageId,
      connectedAccountId,
      workspaceId,
    });
  }

  async getSentMessageThreadId(
    messageExternalId: string,
    workspaceId: string,
  ): Promise<string | undefined> {
    return this.messagingDraftSendService.getSentMessageThreadId({
      messageExternalId,
      workspaceId,
    });
  }

  async persistSentMessage(
    sendResult: SendMessageResult,
    data: ComposedEmail,
    workspaceId: string,
  ): Promise<PersistedSentMessage | undefined> {
    try {
      return await this.sentMessagePersistenceService.persistSentMessage({
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

      return undefined;
    }
  }
}
