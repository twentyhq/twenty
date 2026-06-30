import { Injectable } from '@nestjs/common';

import { type MessageOutboundDriver } from 'src/modules/messaging/message-outbound-manager/interfaces/message-outbound-driver.interface';

import { MicrosoftOAuth2ClientProvider } from 'src/modules/connected-account/oauth2-client-manager/drivers/microsoft/microsoft-oauth2-client.provider';
import { type ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { toMicrosoftRecipients } from 'src/modules/messaging/message-import-manager/utils/to-microsoft-recipients.util';
import { type SendMessageInput } from 'src/modules/messaging/message-outbound-manager/types/send-message-input.type';
import { type SendMessageResult } from 'src/modules/messaging/message-outbound-manager/types/send-message-result.type';
import { type Client as MicrosoftGraphClient } from '@microsoft/microsoft-graph-client';
import { isDefined } from 'twenty-shared/utils';

@Injectable()
export class MicrosoftMessageOutboundService implements MessageOutboundDriver {
  constructor(
    private readonly microsoftOAuth2ClientProvider: MicrosoftOAuth2ClientProvider,
  ) {}

  async sendMessage(
    sendMessageInput: SendMessageInput,
    connectedAccount: ConnectedAccountEntity,
  ): Promise<SendMessageResult> {
    const microsoftClient = await this.microsoftOAuth2ClientProvider.getClient(
      connectedAccount.id,
    );

    const {
      id: messageId,
      internetMessageId,
      conversationId,
    } = await this.createDraftMessage(microsoftClient, sendMessageInput);

    await microsoftClient.api(`/me/messages/${messageId}/send`).post({});

    return {
      headerMessageId: internetMessageId ?? '',
      messageExternalId: messageId,
      threadExternalId: conversationId ?? undefined,
    };
  }

  async createDraft(
    sendMessageInput: SendMessageInput,
    connectedAccount: ConnectedAccountEntity,
  ): Promise<void> {
    const microsoftClient = await this.microsoftOAuth2ClientProvider.getClient(
      connectedAccount.id,
    );

    await this.createDraftMessage(microsoftClient, sendMessageInput);
  }

  private async createDraftMessage(
    microsoftClient: MicrosoftGraphClient,
    sendMessageInput: SendMessageInput,
  ): Promise<{
    id: string;
    internetMessageId?: string;
    conversationId?: string;
  }> {
    const parentMessageGraphId = sendMessageInput.inReplyTo
      ? await this.findMessageByInternetMessageId(
          microsoftClient,
          sendMessageInput.inReplyTo,
        )
      : undefined;

    const message = this.composeMicrosoftMessage(sendMessageInput);

    if (isDefined(parentMessageGraphId)) {
      const reply = await microsoftClient
        .api(`/me/messages/${parentMessageGraphId}/createReply`)
        .post({});

      const patched = await microsoftClient
        .api(`/me/messages/${reply.id}`)
        .patch(message);

      return {
        id: reply.id,
        internetMessageId:
          patched?.internetMessageId ?? reply.internetMessageId,
        conversationId: patched?.conversationId ?? reply.conversationId,
      };
    }

    const response = await microsoftClient.api('/me/messages').post(message);

    return {
      id: response.id,
      internetMessageId: response.internetMessageId,
      conversationId: response.conversationId,
    };
  }

  private async findMessageByInternetMessageId(
    microsoftClient: MicrosoftGraphClient,
    internetMessageId: string,
  ): Promise<string | undefined> {
    const escapedInternetMessageId = internetMessageId.split("'").join("''");

    const response = await microsoftClient
      .api('/me/messages')
      .filter(`internetMessageId eq '${escapedInternetMessageId}'`)
      .select('id')
      .top(1)
      .get();

    return response?.value?.[0]?.id;
  }

  private composeMicrosoftMessage(
    sendMessageInput: SendMessageInput,
  ): Record<string, unknown> {
    return {
      subject: sendMessageInput.subject,
      body: {
        contentType: 'HTML',
        content: sendMessageInput.html,
      },
      toRecipients: toMicrosoftRecipients(sendMessageInput.to),
      ccRecipients: toMicrosoftRecipients(sendMessageInput.cc),
      bccRecipients: toMicrosoftRecipients(sendMessageInput.bcc),
      ...(sendMessageInput.attachments &&
      sendMessageInput.attachments.length > 0
        ? {
            attachments: sendMessageInput.attachments.map((attachment) => ({
              '@odata.type': '#microsoft.graph.fileAttachment',
              name: attachment.filename,
              contentType: attachment.contentType,
              contentBytes: attachment.content.toString('base64'),
            })),
          }
        : {}),
    };
  }
}
