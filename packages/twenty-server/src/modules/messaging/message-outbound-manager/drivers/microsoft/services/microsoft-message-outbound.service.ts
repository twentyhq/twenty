import { Injectable } from '@nestjs/common';

import { type MessageOutboundDriver } from 'src/modules/messaging/message-outbound-manager/interfaces/message-outbound-driver.interface';

import { OAuth2ClientManagerService } from 'src/modules/connected-account/oauth2-client-manager/services/oauth2-client-manager.service';
import { type ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { toMicrosoftRecipients } from 'src/modules/messaging/message-import-manager/utils/to-microsoft-recipients.util';
import { type SendMessageInput } from 'src/modules/messaging/message-outbound-manager/types/send-message-input.type';
import { type SendMessageResult } from 'src/modules/messaging/message-outbound-manager/types/send-message-result.type';
import { type Client as MicrosoftGraphClient } from '@microsoft/microsoft-graph-client';
import { isDefined } from 'twenty-shared/utils';

@Injectable()
export class MicrosoftMessageOutboundService implements MessageOutboundDriver {
  constructor(
    private readonly oAuth2ClientManagerService: OAuth2ClientManagerService,
  ) {}

  async sendMessage(
    sendMessageInput: SendMessageInput,
    connectedAccount: ConnectedAccountEntity,
  ): Promise<SendMessageResult> {
    const microsoftClient =
      await this.oAuth2ClientManagerService.getMicrosoftOAuth2Client(
        connectedAccount,
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
    const microsoftClient =
      await this.oAuth2ClientManagerService.getMicrosoftOAuth2Client(
        connectedAccount,
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
    const encodedId = encodeURIComponent(internetMessageId);

    const response = await microsoftClient
      .api(
        `/me/messages?$filter=internetMessageId eq '${encodedId}'&$select=id&$top=1`,
      )
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
