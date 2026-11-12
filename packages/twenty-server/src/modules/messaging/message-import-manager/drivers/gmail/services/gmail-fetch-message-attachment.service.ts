import { Injectable } from '@nestjs/common';

import { google } from 'googleapis';
import { type Readable } from 'stream';
import { isDefined } from 'twenty-shared/utils';

import { GoogleOAuth2ClientProvider } from 'src/modules/connected-account/oauth2-client-manager/drivers/google/google-oauth2-client.provider';
import { decodeGmailAttachmentDataStream } from 'src/modules/messaging/message-import-manager/drivers/gmail/utils/decode-gmail-attachment-data-stream.util';
import { getAttachmentData } from 'src/modules/messaging/message-import-manager/drivers/gmail/utils/get-attachment-data.util';
import { isGmailApiError } from 'src/modules/messaging/message-import-manager/drivers/gmail/utils/is-gmail-api-error.util';
import { type MessageAttachmentDriver } from 'src/modules/messaging/message-import-manager/interfaces/message-attachment-driver.interface';
import { type FetchMessageAttachmentParams } from 'src/modules/messaging/message-import-manager/types/fetch-message-attachment-params.type';

@Injectable()
export class GmailFetchMessageAttachmentService implements MessageAttachmentDriver {
  constructor(
    private readonly googleOAuth2ClientProvider: GoogleOAuth2ClientProvider,
  ) {}

  async fetchMessageAttachment({
    connectedAccountId,
    messageExternalId,
    attachmentExternalId,
  }: FetchMessageAttachmentParams): Promise<Readable | null> {
    const oAuth2Client =
      await this.googleOAuth2ClientProvider.getClient(connectedAccountId);

    const gmailClient = google.gmail({ version: 'v1', auth: oAuth2Client });

    const message = await gmailClient.users.messages
      .get({
        userId: 'me',
        id: messageExternalId,
        format: 'full',
        fields: 'payload',
      })
      .then((response) => response.data)
      .catch((error) => this.returnNullIfNotFound(error));

    if (!isDefined(message)) {
      return null;
    }

    const attachment = getAttachmentData(message).find(
      ({ externalId }) => externalId === attachmentExternalId,
    );

    if (!isDefined(attachment)) {
      return null;
    }

    const attachmentResponseStream =
      await gmailClient.users.messages.attachments
        .get(
          {
            userId: 'me',
            messageId: messageExternalId,
            id: attachment.attachmentId,
            fields: 'data',
          },
          { responseType: 'stream' },
        )
        .then((response) => response.data)
        .catch((error) => this.returnNullIfNotFound(error));

    if (!isDefined(attachmentResponseStream)) {
      return null;
    }

    return decodeGmailAttachmentDataStream(attachmentResponseStream);
  }

  private returnNullIfNotFound(error: unknown): null {
    if (isGmailApiError(error) && error.response?.status === 404) {
      return null;
    }

    throw error;
  }
}
