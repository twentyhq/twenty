import { Injectable, Logger } from '@nestjs/common';

import { isNonEmptyString } from '@sniptt/guards';
import { type gmail_v1 as gmailV1, google } from 'googleapis';
import chunk from 'lodash.chunk';

import { MessageFolderImportPolicy } from 'twenty-shared/types';
import { MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';
import { GoogleOAuth2ClientProvider } from 'src/modules/connected-account/oauth2-client-manager/drivers/google/google-oauth2-client.provider';
import { type ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { type MessageFolderEntity } from 'src/engine/metadata-modules/message-folder/entities/message-folder.entity';
import {
  MessageImportDriverException,
  MessageImportDriverExceptionCode,
} from 'src/modules/messaging/message-import-manager/drivers/exceptions/message-import-driver.exception';
import { MESSAGING_GMAIL_BATCH_REQUEST_MAX_SIZE } from 'src/modules/messaging/message-import-manager/drivers/gmail/constants/messaging-gmail-batch-request-max-size.constant';
import { MESSAGING_GMAIL_EXCLUDED_SYSTEM_LABELS } from 'src/modules/messaging/message-import-manager/drivers/gmail/constants/messaging-gmail-excluded-system-labels.constant';
import { MESSAGING_GMAIL_USERS_MESSAGES_LIST_MAX_RESULT } from 'src/modules/messaging/message-import-manager/drivers/gmail/constants/messaging-gmail-users-messages-list-max-result.constant';
import { GmailGetHistoryService } from 'src/modules/messaging/message-import-manager/drivers/gmail/services/gmail-get-history.service';
import { GmailMessageListFetchErrorHandler } from 'src/modules/messaging/message-import-manager/drivers/gmail/services/gmail-message-list-fetch-error-handler.service';
import { type GmailHistoryMessage } from 'src/modules/messaging/message-import-manager/drivers/gmail/types/gmail-history-message.type';
import { buildGmailRetryConfig } from 'src/modules/messaging/message-import-manager/drivers/gmail/utils/build-gmail-retry-config.util';
import { computeGmailDefaultNotSyncedLabelsSearchFilter } from 'src/modules/messaging/message-import-manager/drivers/gmail/utils/compute-gmail-default-not-synced-labels-search-filter';
import { computeGmailExcludeSearchFilter } from 'src/modules/messaging/message-import-manager/drivers/gmail/utils/compute-gmail-exclude-search-filter.util';
import { isGmailApiError } from 'src/modules/messaging/message-import-manager/drivers/gmail/utils/is-gmail-api-error.util';
import { isGmailMessageInSyncedFolder } from 'src/modules/messaging/message-import-manager/drivers/gmail/utils/is-gmail-message-in-synced-folder.util';
import { type GetMessageListsArgs } from 'src/modules/messaging/message-import-manager/types/get-message-lists-args.type';
import { type GetMessageListsResponse } from 'src/modules/messaging/message-import-manager/types/get-message-lists-response.type';

type GmailMessageListItem = {
  id: string;
  threadId: string | null;
};

@Injectable()
export class GmailGetMessageListService {
  private readonly logger = new Logger(GmailGetMessageListService.name);
  constructor(
    private readonly gmailGetHistoryService: GmailGetHistoryService,
    private readonly googleOAuth2ClientProvider: GoogleOAuth2ClientProvider,
    private readonly gmailMessageListFetchErrorHandler: GmailMessageListFetchErrorHandler,
  ) {}

  async getMessageListWithoutCursor(
    connectedAccount: Pick<
      ConnectedAccountEntity,
      'provider' | 'id' | 'handle'
    >,
    messageFolders: Pick<
      MessageFolderEntity,
      'name' | 'externalId' | 'isSynced' | 'parentFolderId'
    >[],
    messageChannel: Pick<MessageChannelEntity, 'messageFolderImportPolicy'>,
  ): Promise<GetMessageListsResponse> {
    const oAuth2Client = await this.googleOAuth2ClientProvider.getClient(
      connectedAccount.id,
    );
    const gmailClient = google.gmail({
      version: 'v1',
      auth: oAuth2Client,
      retryConfig: buildGmailRetryConfig(),
    });

    const profile = await gmailClient.users
      .getProfile({ userId: 'me' })
      .catch((error) => {
        this.gmailMessageListFetchErrorHandler.handleError(error);
      });

    const nextSyncCursor = profile?.data?.historyId;

    if (!isNonEmptyString(nextSyncCursor)) {
      throw new MessageImportDriverException(
        `No historyId found in profile for connected account ${connectedAccount.id}`,
        MessageImportDriverExceptionCode.NO_NEXT_SYNC_CURSOR,
      );
    }

    const excludedSearchFilter = computeGmailExcludeSearchFilter(
      messageFolders,
      messageChannel.messageFolderImportPolicy,
    );

    const listedMessages = await this.listMessages(
      gmailClient,
      connectedAccount,
      excludedSearchFilter,
    );

    const messageExternalIds = listedMessages.map(
      (listedMessage) => listedMessage.id,
    );

    const shouldIncludeThreadSiblings =
      messageChannel.messageFolderImportPolicy ===
        MessageFolderImportPolicy.SELECTED_FOLDERS &&
      messageFolders.some((folder) => !folder.isSynced) &&
      listedMessages.length > 0;

    if (shouldIncludeThreadSiblings) {
      const threadSiblingIds = await this.listThreadSiblingIds(
        gmailClient,
        connectedAccount,
        listedMessages,
      );

      messageExternalIds.push(...threadSiblingIds);
    }

    return [
      {
        messageExternalIds,
        nextSyncCursor: messageExternalIds.length > 0 ? nextSyncCursor : '',
        previousSyncCursor: '',
        messageExternalIdsToDelete: [],
        folderId: undefined,
      },
    ];
  }

  public async getMessageLists({
    messageChannel,
    connectedAccount,
    messageFolders,
  }: GetMessageListsArgs): Promise<GetMessageListsResponse> {
    if (
      messageChannel.messageFolderImportPolicy ===
      MessageFolderImportPolicy.SELECTED_FOLDERS
    ) {
      const foldersToSync = messageFolders.filter((folder) => folder.isSynced);

      if (foldersToSync.length === 0) {
        this.logger.warn(
          `Connected account ${connectedAccount.id} Message Channel: ${messageChannel.id}: No folders to process`,
        );

        return [];
      }
    }

    const oAuth2Client = await this.googleOAuth2ClientProvider.getClient(
      connectedAccount.id,
    );
    const gmailClient = google.gmail({
      version: 'v1',
      auth: oAuth2Client,
      retryConfig: buildGmailRetryConfig(),
    });

    if (!isNonEmptyString(messageChannel.syncCursor)) {
      return this.getMessageListWithoutCursor(
        connectedAccount,
        messageFolders,
        messageChannel,
      );
    }

    const { history, historyId: nextSyncCursor } =
      await this.gmailGetHistoryService.getHistory(
        gmailClient,
        messageChannel.syncCursor,
      );

    const { addedMessages, deletedMessageExternalIds } =
      await this.gmailGetHistoryService.getAddedMessagesFromHistory(history);

    if (!nextSyncCursor) {
      throw new MessageImportDriverException(
        `No nextSyncCursor found for connected account ${connectedAccount.id}`,
        MessageImportDriverExceptionCode.NO_NEXT_SYNC_CURSOR,
      );
    }

    const messageExternalIds =
      messageChannel.messageFolderImportPolicy ===
      MessageFolderImportPolicy.SELECTED_FOLDERS
        ? await this.resolveThreadAwareAddedMessageIds(
            gmailClient,
            addedMessages,
            messageFolders,
          )
        : addedMessages.map((message) => message.id);

    return [
      {
        messageExternalIds,
        messageExternalIdsToDelete: deletedMessageExternalIds,
        previousSyncCursor: messageChannel.syncCursor,
        nextSyncCursor,
        folderId: undefined,
      },
    ];
  }

  private async listMessages(
    gmailClient: gmailV1.Gmail,
    connectedAccount: Pick<ConnectedAccountEntity, 'id'>,
    searchFilter: string,
  ): Promise<GmailMessageListItem[]> {
    const listedMessages: GmailMessageListItem[] = [];
    let pageToken: string | undefined;
    let hasMoreMessages = true;

    while (hasMoreMessages) {
      const messageList = await gmailClient.users.messages
        .list({
          userId: 'me',
          maxResults: MESSAGING_GMAIL_USERS_MESSAGES_LIST_MAX_RESULT,
          pageToken,
          q: searchFilter,
        })
        .catch((error) => {
          this.logger.error(
            `Connected account ${connectedAccount.id}: Error fetching message list: ${JSON.stringify(error)}`,
          );

          this.gmailMessageListFetchErrorHandler.handleError(error);

          return {
            data: {
              messages: [],
              nextPageToken: undefined,
            },
          };
        });

      const pageMessages = messageList.data.messages;
      const hasMessages = pageMessages && pageMessages.length > 0;

      if (!hasMessages) {
        break;
      }

      pageToken = messageList.data.nextPageToken ?? undefined;
      hasMoreMessages = !!pageToken;

      for (const pageMessage of pageMessages) {
        if (isNonEmptyString(pageMessage.id)) {
          listedMessages.push({
            id: pageMessage.id,
            threadId: pageMessage.threadId ?? null,
          });
        }
      }
    }

    return listedMessages;
  }

  private async listThreadSiblingIds(
    gmailClient: gmailV1.Gmail,
    connectedAccount: Pick<ConnectedAccountEntity, 'id'>,
    listedMessages: GmailMessageListItem[],
  ): Promise<string[]> {
    const listedMessageIds = new Set(
      listedMessages.map((listedMessage) => listedMessage.id),
    );
    const listedThreadIds = new Set(
      listedMessages
        .map((listedMessage) => listedMessage.threadId)
        .filter(isNonEmptyString),
    );

    const systemExcludedSearchFilter =
      MESSAGING_GMAIL_EXCLUDED_SYSTEM_LABELS.map(
        computeGmailDefaultNotSyncedLabelsSearchFilter,
      ).join(' ');

    const mailboxMessages = await this.listMessages(
      gmailClient,
      connectedAccount,
      systemExcludedSearchFilter,
    );

    return mailboxMessages
      .filter(
        (mailboxMessage) =>
          isNonEmptyString(mailboxMessage.threadId) &&
          listedThreadIds.has(mailboxMessage.threadId) &&
          !listedMessageIds.has(mailboxMessage.id),
      )
      .map((mailboxMessage) => mailboxMessage.id);
  }

  private async resolveThreadAwareAddedMessageIds(
    gmailClient: gmailV1.Gmail,
    addedMessages: GmailHistoryMessage[],
    messageFolders: Pick<MessageFolderEntity, 'externalId' | 'isSynced'>[],
  ): Promise<string[]> {
    const syncedFolderExternalIds = messageFolders
      .filter(
        (folder) => folder.isSynced && isNonEmptyString(folder.externalId),
      )
      .map((folder) => folder.externalId as string);

    if (syncedFolderExternalIds.length === 0 || addedMessages.length === 0) {
      return [];
    }

    const messageExternalIds = new Set(
      addedMessages
        .filter((message) =>
          isGmailMessageInSyncedFolder(
            message.labelIds,
            syncedFolderExternalIds,
          ),
        )
        .map((message) => message.id),
    );

    const candidateThreadIds = [
      ...new Set(
        addedMessages
          .map((message) => message.threadId)
          .filter(isNonEmptyString),
      ),
    ];

    for (const threadIdBatch of chunk(
      candidateThreadIds,
      MESSAGING_GMAIL_BATCH_REQUEST_MAX_SIZE,
    )) {
      const batchResults = await Promise.allSettled(
        threadIdBatch.map((threadId) =>
          gmailClient.users.threads
            .get({
              userId: 'me',
              id: threadId,
              format: 'metadata',
              metadataHeaders: [],
            })
            .then((response) => response.data),
        ),
      );

      for (const result of batchResults) {
        if (result.status === 'rejected') {
          this.handleThreadFetchError(result.reason);
          continue;
        }

        const threadMessages = result.value.messages ?? [];

        const threadHasSyncedLabel = threadMessages.some((threadMessage) =>
          isGmailMessageInSyncedFolder(
            threadMessage.labelIds ?? [],
            syncedFolderExternalIds,
          ),
        );

        if (!threadHasSyncedLabel) {
          continue;
        }

        for (const threadMessage of threadMessages) {
          if (isNonEmptyString(threadMessage.id)) {
            messageExternalIds.add(threadMessage.id);
          }
        }
      }
    }

    return [...messageExternalIds];
  }

  private handleThreadFetchError(error: unknown): void {
    if (isGmailApiError(error)) {
      const status = error.response?.status;

      if (status === 404 || status === 410) {
        return;
      }
    }

    this.gmailMessageListFetchErrorHandler.handleError(error);
  }
}
