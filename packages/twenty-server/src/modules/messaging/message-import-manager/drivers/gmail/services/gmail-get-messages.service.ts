import { Injectable } from '@nestjs/common';

import { batchFetchImplementation } from '@jrmdayn/googleapis-batcher';
import { type gmail_v1 as gmailV1, google } from 'googleapis';
import { isDefined } from 'twenty-shared/utils';

import { MessageFolderImportPolicy } from 'twenty-shared/types';
import { type MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';
import { GoogleOAuth2ClientProvider } from 'src/modules/connected-account/oauth2-client-manager/drivers/google/google-oauth2-client.provider';
import { type ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { GmailMessagesImportErrorHandler } from 'src/modules/messaging/message-import-manager/drivers/gmail/services/gmail-messages-import-error-handler.service';
import { filterGmailMessagesByFolderPolicy } from 'src/modules/messaging/message-import-manager/drivers/gmail/utils/filter-gmail-messages-by-folder-policy.util';
import { groupGmailMessagesBySyncedThread } from 'src/modules/messaging/message-import-manager/drivers/gmail/utils/group-gmail-messages-by-synced-thread.util';
import { parseAndFormatGmailMessage } from 'src/modules/messaging/message-import-manager/drivers/gmail/utils/parse-and-format-gmail-message.util';
import { type MessageWithParticipants } from 'src/modules/messaging/message-import-manager/types/message';

const GMAIL_BATCH_REQUEST_MAX_SIZE = 50;

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
    messageChannel: Pick<
      MessageChannelEntity,
      'messageFolders' | 'messageFolderImportPolicy'
    >,
  ): Promise<MessageWithParticipants[]> {
    const oAuth2Client = await this.googleOAuth2ClientProvider.getClient(
      connectedAccount.id,
    );

    const batchedFetchImplementation = batchFetchImplementation({
      maxBatchSize: GMAIL_BATCH_REQUEST_MAX_SIZE,
    });

    const batchedGmailClient = google.gmail({
      version: 'v1',
      auth: oAuth2Client,
      fetchImplementation: batchedFetchImplementation,
    });

    const fetchedMessages = await this.fetchMessages(
      batchedGmailClient,
      messageIds,
      connectedAccount,
    );

    const filteredMessages = filterGmailMessagesByFolderPolicy(
      fetchedMessages,
      messageChannel,
    );

    if (
      messageChannel.messageFolderImportPolicy !==
      MessageFolderImportPolicy.SELECTED_FOLDERS
    ) {
      return filteredMessages;
    }

    return groupGmailMessagesBySyncedThread(fetchedMessages, filteredMessages);
  }

  private async fetchMessages(
    gmailClient: gmailV1.Gmail,
    messageIds: string[],
    connectedAccount: Pick<ConnectedAccountEntity, 'handle' | 'handleAliases'>,
  ): Promise<MessageWithParticipants[]> {
    const results = await Promise.all(
      messageIds.map((messageId) =>
        gmailClient.users.messages
          .get({ userId: 'me', id: messageId })
          .then((response) => ({ messageId, data: response.data, error: null }))
          .catch((error) => ({ messageId, data: null, error })),
      ),
    );

    return results
      .map(({ messageId, data, error }) => {
        if (error) {
          this.gmailMessagesImportErrorHandler.handleError(error, messageId);

          return undefined;
        }

        return parseAndFormatGmailMessage(
          data as gmailV1.Schema$Message,
          connectedAccount,
        );
      })
      .filter(isDefined);
  }
}
