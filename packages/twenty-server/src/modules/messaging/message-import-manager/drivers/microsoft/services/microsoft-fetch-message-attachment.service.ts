import { Injectable } from '@nestjs/common';

import { type GraphError } from '@microsoft/microsoft-graph-client';
import { Readable } from 'stream';
import { type ReadableStream } from 'stream/web';
import { isDefined } from 'twenty-shared/utils';

import { MicrosoftOAuth2ClientProvider } from 'src/modules/connected-account/oauth2-client-manager/drivers/microsoft/microsoft-oauth2-client.provider';
import { MICROSOFT_GRAPH_IMMUTABLE_ID_PREFER_HEADER } from 'src/modules/messaging/message-import-manager/drivers/microsoft/constants/microsoft-graph-immutable-id-prefer-header.constant';
import { type MessageAttachmentDriver } from 'src/modules/messaging/message-import-manager/interfaces/message-attachment-driver.interface';
import { type FetchMessageAttachmentParams } from 'src/modules/messaging/message-import-manager/types/fetch-message-attachment-params.type';

@Injectable()
export class MicrosoftFetchMessageAttachmentService implements MessageAttachmentDriver {
  constructor(
    private readonly microsoftOAuth2ClientProvider: MicrosoftOAuth2ClientProvider,
  ) {}

  async fetchMessageAttachment({
    connectedAccountId,
    messageExternalId,
    attachmentExternalId,
  }: FetchMessageAttachmentParams): Promise<Readable | null> {
    const microsoftClient =
      await this.microsoftOAuth2ClientProvider.getClient(connectedAccountId);

    const contentStream: ReadableStream<Uint8Array> | null | undefined =
      await microsoftClient
        .api(
          `/me/messages/${messageExternalId}/attachments/${attachmentExternalId}/$value`,
        )
        .header('Prefer', MICROSOFT_GRAPH_IMMUTABLE_ID_PREFER_HEADER)
        .getStream()
        .catch((error: GraphError) => this.returnNullIfNotFound(error));

    if (!isDefined(contentStream)) {
      return null;
    }

    return Readable.fromWeb(contentStream);
  }

  private returnNullIfNotFound(error: GraphError): null {
    if (error.statusCode === 404) {
      return null;
    }

    throw error;
  }
}
