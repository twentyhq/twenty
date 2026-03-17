import { Injectable } from '@nestjs/common';

import { type MessageOutboundDriver } from 'src/modules/messaging/message-outbound-manager/interfaces/message-outbound-driver.interface';

import { OAuth2ClientManagerService } from 'src/modules/connected-account/oauth2-client-manager/services/oauth2-client-manager.service';
import { type ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';
import { toMicrosoftRecipients } from 'src/modules/messaging/message-import-manager/utils/to-microsoft-recipients.util';
import { type SendMessageInput } from 'src/modules/messaging/message-outbound-manager/types/send-message-input.type';
import { type Client as MicrosoftGraphClient } from '@microsoft/microsoft-graph-client';
import { isDefined } from 'twenty-shared/utils';

@Injectable()
export class MicrosoftMessageOutboundService implements MessageOutboundDriver {
  constructor(
    private readonly oAuth2ClientManagerService: OAuth2ClientManagerService,
  ) {}

  async sendMessage(
    sendMessageInput: SendMessageInput,
    connectedAccount: ConnectedAccountWorkspaceEntity,
  ): Promise<void> {
    const microsoftClient =
      await this.oAuth2ClientManagerService.getMicrosoftOAuth2Client(
        connectedAccount,
      );

    const messageId = await this.createDraftMessage(
      microsoftClient,
      sendMessageInput,
    );

    await microsoftClient.api(`/me/messages/${messageId}/send`).post({});
  }

  async createDraft(
    sendMessageInput: SendMessageInput,
    connectedAccount: ConnectedAccountWorkspaceEntity,
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
  ): Promise<string> {
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

      await microsoftClient.api(`/me/messages/${reply.id}`).patch(message);

      return reply.id;
    }

    const response = await microsoftClient.api('/me/messages').post(message);

    return response.id;
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
