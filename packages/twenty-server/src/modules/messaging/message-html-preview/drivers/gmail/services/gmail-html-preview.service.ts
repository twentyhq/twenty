import { Injectable, Logger } from '@nestjs/common';

import { type gmail_v1 as gmailV1, google } from 'googleapis';

import { OAuth2ClientManagerService } from 'src/modules/connected-account/oauth2-client-manager/services/oauth2-client-manager.service';
import { type ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';
import { getHtmlBodyData } from 'src/modules/messaging/message-html-preview/drivers/gmail/utils/get-html-body-data.util';

type CidAttachment = {
  cid: string;
  attachmentId: string;
  mimeType: string;
};

@Injectable()
export class GmailHtmlPreviewService {
  private readonly logger = new Logger(GmailHtmlPreviewService.name);

  constructor(
    private readonly oAuth2ClientManagerService: OAuth2ClientManagerService,
  ) {}

  async getMessageHtml(
    messageExternalId: string,
    connectedAccount: Pick<
      ConnectedAccountWorkspaceEntity,
      'provider' | 'refreshToken'
    >,
  ): Promise<string | null> {
    const oAuth2Client =
      await this.oAuth2ClientManagerService.getGoogleOAuth2Client(
        connectedAccount,
      );

    const gmailClient = google.gmail({
      version: 'v1',
      auth: oAuth2Client,
    });

    const response = await gmailClient.users.messages.get({
      userId: 'me',
      id: messageExternalId,
    });

    const htmlData = getHtmlBodyData(response.data);

    if (!htmlData) {
      return null;
    }

    let html = Buffer.from(htmlData, 'base64').toString('utf-8');

    html = await this.resolveInlineImages(
      gmailClient,
      messageExternalId,
      response.data,
      html,
    );

    return html;
  }

  private async resolveInlineImages(
    gmailClient: gmailV1.Gmail,
    messageExternalId: string,
    message: gmailV1.Schema$Message,
    html: string,
  ): Promise<string> {
    const cidAttachments = this.extractCidAttachments(message);

    if (cidAttachments.length === 0) {
      return html;
    }

    let resolvedHtml = html;

    const results = await Promise.allSettled(
      cidAttachments.map(async (attachment) => {
        const attachmentResponse =
          await gmailClient.users.messages.attachments.get({
            userId: 'me',
            messageId: messageExternalId,
            id: attachment.attachmentId,
          });

        const data = attachmentResponse.data.data;

        if (!data) {
          return null;
        }

        // Gmail returns URL-safe base64; convert to standard base64
        const base64Data = data.replace(/-/g, '+').replace(/_/g, '/');

        return {
          cid: attachment.cid,
          dataUri: `data:${attachment.mimeType};base64,${base64Data}`,
        };
      }),
    );

    for (const result of results) {
      if (result.status === 'fulfilled' && result.value) {
        resolvedHtml = resolvedHtml.replace(
          new RegExp(`cid:${this.escapeRegExp(result.value.cid)}`, 'g'),
          result.value.dataUri,
        );
      }
    }

    return resolvedHtml;
  }

  private extractCidAttachments(
    message: gmailV1.Schema$Message,
  ): CidAttachment[] {
    const attachments: CidAttachment[] = [];

    this.walkParts(message.payload?.parts ?? [], attachments);

    return attachments;
  }

  private walkParts(
    parts: gmailV1.Schema$MessagePart[],
    attachments: CidAttachment[],
  ): void {
    for (const part of parts) {
      const contentIdHeader = part.headers?.find(
        (header) => header.name?.toLowerCase() === 'content-id',
      );

      if (contentIdHeader?.value && part.body?.attachmentId && part.mimeType) {
        // Content-ID is wrapped in angle brackets: <image001.png@01DB1234.5678>
        const cid = contentIdHeader.value.replace(/^<|>$/g, '');

        attachments.push({
          cid,
          attachmentId: part.body.attachmentId,
          mimeType: part.mimeType,
        });
      }

      if (part.parts) {
        this.walkParts(part.parts, attachments);
      }
    }
  }

  private escapeRegExp(string: string): string {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}
