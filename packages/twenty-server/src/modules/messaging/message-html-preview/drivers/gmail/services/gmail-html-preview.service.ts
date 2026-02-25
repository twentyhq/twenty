import { Injectable, Logger } from '@nestjs/common';

import { batchFetchImplementation } from '@jrmdayn/googleapis-batcher';
import { type gmail_v1 as gmailV1, google } from 'googleapis';
import { isDefined } from 'twenty-shared/utils';

import { OAuth2ClientManagerService } from 'src/modules/connected-account/oauth2-client-manager/services/oauth2-client-manager.service';
import { type ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';
import { getHtmlBodyData } from 'src/modules/messaging/message-html-preview/drivers/gmail/utils/get-html-body-data.util';

const GMAIL_BATCH_REQUEST_MAX_SIZE = 50;

type CidAttachment = {
  cid: string;
  attachmentId: string;
  mimeType: string;
};

type MessageHtmlResult = {
  messageExternalId: string;
  html: string | null;
};

@Injectable()
export class GmailHtmlPreviewService {
  private readonly logger = new Logger(GmailHtmlPreviewService.name);

  constructor(
    private readonly oAuth2ClientManagerService: OAuth2ClientManagerService,
  ) {}

  async getMessagesHtml(
    messageExternalIds: string[],
    connectedAccount: Pick<
      ConnectedAccountWorkspaceEntity,
      'provider' | 'refreshToken'
    >,
  ): Promise<MessageHtmlResult[]> {
    const oAuth2Client =
      await this.oAuth2ClientManagerService.getGoogleOAuth2Client(
        connectedAccount,
      );

    const gmailClient = google.gmail({
      version: 'v1',
      auth: oAuth2Client,
      fetchImplementation: batchFetchImplementation({
        maxBatchSize: GMAIL_BATCH_REQUEST_MAX_SIZE,
      }),
    });

    // Batch-fetch all messages in parallel (auto-batched by googleapis-batcher)
    const messageResults = await Promise.all(
      messageExternalIds.map((id) =>
        gmailClient.users.messages
          .get({ userId: 'me', id })
          .then((response) => ({ id, data: response.data, error: null }))
          .catch((error) => ({ id, data: null, error })),
      ),
    );

    // Extract HTML + collect CID attachments for all messages
    const messagesNeedingAttachments: {
      id: string;
      html: string;
      cidAttachments: CidAttachment[];
    }[] = [];

    const results: MessageHtmlResult[] = [];

    for (const result of messageResults) {
      if (result.error || !result.data) {
        this.logger.warn(
          `Failed to fetch Gmail message ${result.id}: ${result.error}`,
        );
        results.push({ messageExternalId: result.id, html: null });
        continue;
      }

      const htmlData = getHtmlBodyData(result.data);

      if (!htmlData) {
        results.push({ messageExternalId: result.id, html: null });
        continue;
      }

      const html = Buffer.from(htmlData, 'base64').toString('utf-8');
      const cidAttachments = this.extractCidAttachments(result.data);

      if (cidAttachments.length === 0) {
        results.push({ messageExternalId: result.id, html });
      } else {
        messagesNeedingAttachments.push({
          id: result.id,
          html,
          cidAttachments,
        });
      }
    }

    // Batch-fetch all inline attachments across all messages in parallel
    if (messagesNeedingAttachments.length > 0) {
      const allAttachmentFetches: {
        messageId: string;
        cid: string;
        mimeType: string;
        promise: Promise<string | null>;
      }[] = [];

      for (const message of messagesNeedingAttachments) {
        for (const attachment of message.cidAttachments) {
          allAttachmentFetches.push({
            messageId: message.id,
            cid: attachment.cid,
            mimeType: attachment.mimeType,
            promise: gmailClient.users.messages.attachments
              .get({
                userId: 'me',
                messageId: message.id,
                id: attachment.attachmentId,
              })
              .then((response) => {
                const data = response.data.data;

                if (!data) {
                  return null;
                }

                // Gmail returns URL-safe base64; convert to standard base64
                return data.replace(/-/g, '+').replace(/_/g, '/');
              })
              .catch(() => null),
          });
        }
      }

      const attachmentResults = await Promise.all(
        allAttachmentFetches.map((fetch) => fetch.promise),
      );

      // Build a map: messageId -> [{cid, dataUri}]
      const resolvedAttachments = new Map<
        string,
        { cid: string; dataUri: string }[]
      >();

      allAttachmentFetches.forEach((fetch, index) => {
        const base64Data = attachmentResults[index];

        if (!isDefined(base64Data)) {
          return;
        }

        const dataUri = `data:${fetch.mimeType};base64,${base64Data}`;
        const existing = resolvedAttachments.get(fetch.messageId) ?? [];

        existing.push({ cid: fetch.cid, dataUri });
        resolvedAttachments.set(fetch.messageId, existing);
      });

      for (const message of messagesNeedingAttachments) {
        let resolvedHtml = message.html;
        const attachments = resolvedAttachments.get(message.id) ?? [];

        for (const attachment of attachments) {
          resolvedHtml = resolvedHtml.replace(
            new RegExp(
              `cid:${attachment.cid.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`,
              'g',
            ),
            attachment.dataUri,
          );
        }

        results.push({ messageExternalId: message.id, html: resolvedHtml });
      }
    }

    return results;
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
}
