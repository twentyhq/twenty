import { Injectable } from '@nestjs/common';

import { batchFetchImplementation } from '@jrmdayn/googleapis-batcher';
import { type gmail_v1 as gmailV1, google } from 'googleapis';
import chunk from 'lodash.chunk';
import { isDefined } from 'twenty-shared/utils';

import { GoogleOAuth2ClientProvider } from 'src/modules/connected-account/oauth2-client-manager/drivers/google/google-oauth2-client.provider';
import { type ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { MESSAGING_GMAIL_BATCH_REQUEST_MAX_SIZE } from 'src/modules/messaging/message-import-manager/drivers/gmail/constants/messaging-gmail-batch-request-max-size.constant';
import { MESSAGING_GMAIL_EXCLUDED_SYSTEM_LABELS } from 'src/modules/messaging/message-import-manager/drivers/gmail/constants/messaging-gmail-excluded-system-labels.constant';
import { GmailMessagesImportErrorHandler } from 'src/modules/messaging/message-import-manager/drivers/gmail/services/gmail-messages-import-error-handler.service';
import { buildGmailRetryConfig } from 'src/modules/messaging/message-import-manager/drivers/gmail/utils/build-gmail-retry-config.util';
import { parseAndFormatGmailMessage } from 'src/modules/messaging/message-import-manager/drivers/gmail/utils/parse-and-format-gmail-message.util';
import { type MessageWithParticipants } from 'src/modules/messaging/message-import-manager/types/message';

@Injectable()
export class GmailGetMessagesService {
  constructor(
    private readonly googleOAuth2ClientProvider: GoogleOAuth2ClientProvider,
    private readonly gmailMessagesImportErrorHandler: GmailMessagesImportErrorHandler,
  ) {}

  async getMessages(
    messageIds: string[],
    connectedAccount: Pick<
      ConnectedAccountEntity,
      'provider' | 'id' | 'handle' | 'handleAliases'
    >,
  ): Promise<MessageWithParticipants[]> {
    const oAuth2Client = await this.googleOAuth2ClientProvider.getClient(
      connectedAccount.id,
    );

    const batchedGmailClient = google.gmail({
      version: 'v1',
      auth: oAuth2Client,
      fetchImplementation: batchFetchImplementation({
        maxBatchSize: MESSAGING_GMAIL_BATCH_REQUEST_MAX_SIZE,
      }),
      retryConfig: buildGmailRetryConfig(),
    });

    const messages: MessageWithParticipants[] = [];

    for (const messageIdBatch of chunk(
      messageIds,
      MESSAGING_GMAIL_BATCH_REQUEST_MAX_SIZE,
    )) {
      const batchResults = await Promise.allSettled(
        messageIdBatch.map((messageId) =>
          batchedGmailClient.users.messages
            .get({ userId: 'me', id: messageId })
            .then((response) => response.data),
        ),
      );

      for (const [index, result] of batchResults.entries()) {
        if (result.status === 'rejected') {
          this.gmailMessagesImportErrorHandler.handleError(
            result.reason,
            messageIdBatch[index],
          );
          continue;
        }

        const messageHasExcludedSystemLabel = (
          result.value.labelIds ?? []
        ).some((labelId) =>
          MESSAGING_GMAIL_EXCLUDED_SYSTEM_LABELS.includes(labelId),
        );

        if (messageHasExcludedSystemLabel) {
          continue;
        }

        const parsedMessage = parseAndFormatGmailMessage(
          result.value as gmailV1.Schema$Message,
          connectedAccount,
        );

        if (isDefined(parsedMessage)) {
          messages.push(parsedMessage);
        }
      }
    }

    return messages;
  }
}
