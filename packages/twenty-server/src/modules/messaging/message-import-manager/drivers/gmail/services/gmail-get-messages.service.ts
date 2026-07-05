import { Injectable } from '@nestjs/common';

import { batchFetchImplementation } from '@jrmdayn/googleapis-batcher';
import { isNonEmptyString } from '@sniptt/guards';
import { type gmail_v1 as gmailV1, google } from 'googleapis';
import chunk from 'lodash.chunk';
import { isDefined } from 'twenty-shared/utils';

import { MessageFolderImportPolicy } from 'twenty-shared/types';
import { type MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';
import { GoogleOAuth2ClientProvider } from 'src/modules/connected-account/oauth2-client-manager/drivers/google/google-oauth2-client.provider';
import { type ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { MESSAGING_GMAIL_BATCH_REQUEST_MAX_SIZE } from 'src/modules/messaging/message-import-manager/drivers/gmail/constants/messaging-gmail-batch-request-max-size.constant';
import { MESSAGING_GMAIL_EXCLUDED_SYSTEM_LABELS } from 'src/modules/messaging/message-import-manager/drivers/gmail/constants/messaging-gmail-excluded-system-labels.constant';
import { GmailMessagesImportErrorHandler } from 'src/modules/messaging/message-import-manager/drivers/gmail/services/gmail-messages-import-error-handler.service';
import { buildGmailRetryConfig } from 'src/modules/messaging/message-import-manager/drivers/gmail/utils/build-gmail-retry-config.util';
import { isGmailMessageInSyncedFolder } from 'src/modules/messaging/message-import-manager/drivers/gmail/utils/is-gmail-message-in-synced-folder.util';
import { parseAndFormatGmailMessage } from 'src/modules/messaging/message-import-manager/drivers/gmail/utils/parse-and-format-gmail-message.util';
import { type MessageWithParticipants } from 'src/modules/messaging/message-import-manager/types/message';

@Injectable()
export class GmailGetMessagesService {
  constructor(
    private readonly googleOAuth2ClientProvider: GoogleOAuth2ClientProvider,
    private readonly gmailMessagesImportErrorHandler: GmailMessagesImportErrorHandler,
  ) {}

  async getMessages(
    messageThreadExternalIds: string[],
    connectedAccount: Pick<
      ConnectedAccountEntity,
      'provider' | 'id' | 'handle' | 'handleAliases'
    >,
    messageChannel: Pick<
      MessageChannelEntity,
      'messageFolders' | 'messageFolderImportPolicy'
    >,
  ): Promise<MessageWithParticipants[]> {
    const shouldFilterThreadsBySyncedFolder =
      messageChannel.messageFolderImportPolicy ===
      MessageFolderImportPolicy.SELECTED_FOLDERS;

    const syncedFolderExternalIds = (messageChannel.messageFolders ?? [])
      .filter(
        (folder) => folder.isSynced && isNonEmptyString(folder.externalId),
      )
      .map((folder) => folder.externalId as string);

    if (
      shouldFilterThreadsBySyncedFolder &&
      syncedFolderExternalIds.length === 0
    ) {
      return [];
    }

    const threads = await this.fetchThreads(
      messageThreadExternalIds,
      connectedAccount,
    );

    return threads
      .filter(
        (thread) =>
          !shouldFilterThreadsBySyncedFolder ||
          (thread.messages ?? []).some((threadMessage) =>
            isGmailMessageInSyncedFolder(
              threadMessage.labelIds ?? [],
              syncedFolderExternalIds,
            ),
          ),
      )
      .flatMap((thread) => thread.messages ?? [])
      .filter(
        (threadMessage) =>
          !(threadMessage.labelIds ?? []).some((labelId) =>
            MESSAGING_GMAIL_EXCLUDED_SYSTEM_LABELS.includes(labelId),
          ),
      )
      .map((threadMessage) =>
        parseAndFormatGmailMessage(threadMessage, connectedAccount),
      )
      .filter(isDefined);
  }

  private async fetchThreads(
    messageThreadExternalIds: string[],
    connectedAccount: Pick<ConnectedAccountEntity, 'id'>,
  ): Promise<gmailV1.Schema$Thread[]> {
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

    const threads: gmailV1.Schema$Thread[] = [];

    for (const threadIdBatch of chunk(
      messageThreadExternalIds,
      MESSAGING_GMAIL_BATCH_REQUEST_MAX_SIZE,
    )) {
      const batchResults = await Promise.allSettled(
        threadIdBatch.map((threadId) =>
          batchedGmailClient.users.threads
            .get({ userId: 'me', id: threadId })
            .then((response) => response.data),
        ),
      );

      for (const [index, result] of batchResults.entries()) {
        if (result.status === 'rejected') {
          this.gmailMessagesImportErrorHandler.handleError(
            result.reason,
            threadIdBatch[index],
          );
          continue;
        }

        threads.push(result.value);
      }
    }

    return threads;
  }
}
